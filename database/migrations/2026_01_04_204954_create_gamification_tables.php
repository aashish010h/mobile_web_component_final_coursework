<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add 'points' column to users for fast leaderboard queries
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('points')->default(0)->after('department');
        });

        // 2. BADGES (The Trophies)
        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('icon')->default('🏆'); // Simple emoji or URL
            $table->integer('points_required')->default(0); // Auto-award threshold
            $table->timestamps();
        });

        // 3. USER_BADGES (Who has what)
        Schema::create('user_badge', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('badge_id')->constrained()->onDelete('cascade');
            $table->timestamp('awarded_at')->useCurrent();
        });

        // 4. POINT_HISTORY (Audit trail of gamification)
        Schema::create('point_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('action_type'); // e.g., 'UPLOAD_ASSET', 'REVIEW_ASSET'
            $table->integer('points_awarded');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('point_histories');
        Schema::dropIfExists('user_badge');
        Schema::dropIfExists('badges');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('points');
        });
    }
};
