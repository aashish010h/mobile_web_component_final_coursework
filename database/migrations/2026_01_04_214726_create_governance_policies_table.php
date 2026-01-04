<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('governance_policies', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->longText('content'); // The full legal text of the policy

            // Status: DRAFT (Writing), ACTIVE (Enforced), DEPRECATED (Old)
            $table->string('status')->default('DRAFT');

            $table->date('effective_date')->nullable(); // When it becomes law

            // Who signed this off? (Must be a Supervisor/Council)
            $table->foreignId('approved_by')->nullable()->constrained('users');

            $table->timestamps();
        });

        // OPTIONAL: Link Assets to Policies (as per your UML "adheres to" relationship)
        // This allows you to see which documents belong to which policy.
        if (Schema::hasTable('knowledge_assets')) {
            Schema::table('knowledge_assets', function (Blueprint $table) {
                $table->foreignId('governance_policy_id')->nullable()->constrained('governance_policies')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('knowledge_assets')) {
            Schema::table('knowledge_assets', function (Blueprint $table) {
                $table->dropForeign(['governance_policy_id']);
                $table->dropColumn('governance_policy_id');
            });
        }
        Schema::dropIfExists('governance_policies');
    }
};
