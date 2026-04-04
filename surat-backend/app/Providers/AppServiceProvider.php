<?php

namespace App\Providers;

use App\Services\AuditService;
use App\Services\ExportService;
use App\Services\GapRequestService;
use App\Services\NumberingService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * Semua service layer didaftarkan sebagai singleton agar instance yang sama
     * dipakai sepanjang siklus request — menghindari multiple instantiation yang
     * tidak perlu dan memastikan konsistensi state (terutama untuk NumberingService).
     */
    public function register(): void
    {
        $this->app->singleton(NumberingService::class);
        $this->app->singleton(AuditService::class);
        $this->app->singleton(GapRequestService::class);
        $this->app->singleton(ExportService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
