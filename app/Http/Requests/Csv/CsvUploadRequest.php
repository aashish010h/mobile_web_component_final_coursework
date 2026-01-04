<?php

namespace App\Http\Requests\Csv;

use Illuminate\Foundation\Http\FormRequest;

class CsvUploadRequest extends FormRequest
{
    public function rules(): array
    {
        // max is KB: 1GB = 1,048,576 KB ; adjust as needed
        return [
            'file' => ['required', 'file', 'mimetypes:text/plain,text/csv,text/tsv,application/vnd.ms-excel', 'max:1048576'],
            'has_header' => ['sometimes', 'boolean'],
            'delimiter' => ['sometimes', 'string', 'size:1'],
        ];
    }
}
