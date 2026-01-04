<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('csv_records', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('csv_file_id')->constrained('csv_files')->cascadeOnDelete();
            $table->jsonb('payload');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('csv_records');
    }
};
