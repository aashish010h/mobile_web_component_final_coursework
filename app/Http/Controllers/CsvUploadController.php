<?php

namespace App\Http\Controllers;

use App\Http\Requests\Csv\CsvUploadRequest;
use App\Http\Resources\CsvFileResource;
use App\Http\Resources\CsvImportResource;
use App\Models\CsvFile;
use App\Models\CsvImport;
use App\Services\CsvUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Throwable;

class CsvUploadController extends Controller
{
    public function __construct(private CsvUploadService $service) {}

    public function upload(CsvUploadRequest $request): JsonResponse
    {
        try {
            $file = $request->file('file');
            /** @var bool $hasHeader */
            $hasHeader = (bool) $request->input('has_header', false);
            $delimiter = (string) $request->input('delimiter', ',');

            $batchId = $this->service->handleUpload($file, $hasHeader, $delimiter);

            return response()->json([
                'message' => 'CSV accepted. Processing in background.',
                'batch_id' => $batchId,
            ], 202);
        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Upload failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 5);

        $files = CsvFile::query()->withCount('records')
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        return CsvFileResource::collection($files);
    }
}
