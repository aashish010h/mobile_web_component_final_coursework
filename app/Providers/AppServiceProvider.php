<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\KnowledgeAsset;
use App\Models\GovernancePolicy;
use App\Models\User;
use App\Observers\AuditObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        KnowledgeAsset::observe(AuditObserver::class);
        GovernancePolicy::observe(AuditObserver::class);
        User::observe(AuditObserver::class);
    }
}
