<?php

namespace App\Services;

use App\Jobs\ProcessCsvChunkJob;
use App\Models\CsvFile;
use Illuminate\Bus\Batch;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use SplFileObject;
use Throwable;
use RuntimeException;

final class CsvUploadService
{
    private const CHUNK_SIZE = 5000;          // rows per job
    private const INSERT_SUB_BATCH = 500;     // job-level DB insert sub-batch if needed

    /**
     * @param UploadedFile $file
     * @param bool $hasHeader whether first row is header (if true, header is dropped and rows remain numeric arrays)
     * @param string $delimiter CSV delimiter
     * @return string batch id
     */
    public function handleUpload(UploadedFile $file, bool $hasHeader = false, string $delimiter = ','): string
    {
        // store physically
        $storedPath = $file->store('uploads/csv');
        $fullPath = Storage::path($storedPath);

        // ensure file exists
        if (!is_file($fullPath) || !is_readable($fullPath)) {
            Log::error('Stored CSV not found or unreadable', ['path' => $fullPath]);
            throw new RuntimeException('Stored CSV not found or unreadable');
        }

        // create metadata record
        $csvFile = CsvFile::create([
            'original_name' => $file->getClientOriginalName(),
            'stored_path' => $storedPath,
            'size_bytes' => $file->getSize() ?? 0,
            'mime_type' => $file->getClientMimeType(),
            'status' => 'processing',
        ]);

        $jobs = [];
        $chunk = [];
        $chunkIndex = 0;

        try {
            $fh = new SplFileObject($fullPath, 'r');
            $fh->setFlags(SplFileObject::READ_CSV | SplFileObject::SKIP_EMPTY);
            $fh->setCsvControl($delimiter);

            // if has header, read first row as header but we are not using headers — store rows as arrays
            if ($hasHeader && !$fh->eof()) {
                $headerRow = $fh->fgetcsv();
                // headerRow may be used for associative mapping in future; currently ignored (user requested "any structure")
            }

            while (!$fh->eof()) {
                $row = $fh->fgetcsv();

                if ($row === null || $row === false || $row === [null]) {
                    $fh->next();
                    continue;
                }

                // keep row as-is (array of values)
                $chunk[] = $row;

                if (count($chunk) >= self::CHUNK_SIZE) {
                    $chunkIndex++;
                    // create job with only serializable data: file id + plain arrays
                    $jobs[] = new ProcessCsvChunkJob($csvFile->id, $chunk);
                    $chunk = [];
                }

                $fh->next();
            }

            if (count($chunk) > 0) {
                $chunkIndex++;
                $jobs[] = new ProcessCsvChunkJob($csvFile->id, $chunk);
                $chunk = [];
            }

            // save chunk count
            $csvFile->update(['total_chunks' => $chunkIndex]);
        } catch (Throwable $e) {
            Log::error('CSV streaming failed', ['error' => $e->getMessage(), 'path' => $fullPath]);
            $csvFile->update(['status' => 'failed']);
            throw $e;
        }

        // If no jobs created, mark file failed and return
        if (empty($jobs)) {
            $csvFile->update(['status' => 'failed']);
            throw new RuntimeException('CSV contained no rows to process');
        }

        // Dispatch jobs as a batch
        $batch = Bus::batch($jobs)
            ->then(function (Batch $batch) use ($csvFile) {
                $csvFile->update(['status' => 'completed', 'batch_id' => $batch->id]);
            })
            ->catch(function (Batch $batch, Throwable $e) use ($csvFile) {
                Log::error('Batch failed', ['batch_id' => $batch->id, 'error' => $e->getMessage()]);
                $csvFile->update(['status' => 'failed', 'batch_id' => $batch->id]);
            })
            ->finally(function (Batch $batch) use ($csvFile) {
                // ensure batch_id saved even if then/catch not called immediately
                if ($csvFile->batch_id !== $batch->id) {
                    $csvFile->update(['batch_id' => $batch->id]);
                }
            })
            ->dispatch();

        // return batch id for optional debugging
        return $batch->id;
    }
}
