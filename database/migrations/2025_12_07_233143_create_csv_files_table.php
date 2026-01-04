<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('csv_files', function (Blueprint $table): void {
            $table->id();
            $table->string('original_name');
            $table->string('stored_path');
            $table->unsignedBigInteger('size_bytes');
            $table->string('mime_type')->nullable();
            $table->unsignedInteger('total_chunks')->default(0);
            $table->string('status')->default('pending'); // pending, processing, completed, failed
            $table->string('batch_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('csv_files');
    }
};
