<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. KNOWLEDGE ASSETS
        Schema::create('knowledge_assets', function (Blueprint $table) {
            $table->id();

            // Relationships
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            // Note: We will add 'governance_policy_id' later when you build the Policy module

            // Core Content
            $table->string('title')->index(); // Indexed for search
            $table->string('slug')->unique(); // For SEO-friendly URLs (e.g., /assets/how-to-code)
            $table->text('summary')->nullable(); // Brief description
            $table->longText('content_body')->nullable(); // For rich text articles
            $table->string('file_path')->nullable(); // For uploaded PDFs/Docs

            // Meta & Status
            $table->string('status')->default('DRAFT')->index(); // DRAFT, PUBLISHED, etc.
            $table->boolean('is_encrypted')->default(false);
            $table->string('locale_code', 5)->default('en_GB');
            $table->unsignedBigInteger('view_count')->default(0);

            // Governance/Review Flow
            $table->text('rejection_reason')->nullable(); // Stores why a Supervisor rejected it
            $table->timestamp('published_at')->nullable(); // Separate from created_at

            $table->timestamps();
            $table->softDeletes(); // Never actually delete knowledge, just hide it
        });

        // 2. TAGS (Taxonomy)
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->default('GENERAL'); // e.g., TECHNICAL, HR, COMPLIANCE
            $table->timestamps();

            $table->unique(['name', 'category']); // Prevent duplicate tags in same category
        });

        // 3. PIVOT TABLE (Many-to-Many: Assets <-> Tags)
        Schema::create('knowledge_asset_tag', function (Blueprint $table) {
            $table->id();
            $table->foreignId('knowledge_asset_id')->constrained()->onDelete('cascade');
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_asset_tag');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('knowledge_assets');
    }
};
