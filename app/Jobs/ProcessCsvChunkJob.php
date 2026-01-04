<?php

namespace App\Jobs;

use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessCsvChunkJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, Batchable;

    public int $timeout = 300;
    public int $tries = 5;

    public int $csvFileId;
    /** @var array<int,array<int,string|null>> rows as plain arrays */
    public array $rows;

    public function __construct(int $csvFileId, array $rows)
    {
        $this->csvFileId = $csvFileId;
        $this->rows = $rows;
    }

    public function handle(): void
    {
        if (empty($this->rows)) {
            return;
        }

        try {
            $now = now();
            $buffer = [];
            foreach ($this->rows as $row) {
                $buffer[] = [
                    'csv_file_id' => $this->csvFileId,
                    // store raw JSON string into JSONB column
                    'payload' => json_encode($row, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                if (count($buffer) >= 500) {
                    DB::table('csv_records')->insert($buffer);
                    $buffer = [];
                }
            }

            if (!empty($buffer)) {
                DB::table('csv_records')->insert($buffer);
            }
        } catch (Throwable $e) {
            Log::error('ProcessCsvChunkJob failed', [
                'csv_file_id' => $this->csvFileId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // rethrow so Laravel can retry or mark batch failed
            throw $e;
        }
    }
}
