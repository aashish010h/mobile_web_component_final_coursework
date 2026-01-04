<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CsvImportController;
use App\Http\Controllers\CsvUploadController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\GdprController;
use App\Http\Controllers\KnowledgeAssetController;
use App\Http\Controllers\PolicyController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']); // token login

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'getUser']); // get current user
    Route::post('/logout', [AuthController::class, 'logout']); // logout
});


/*
|--------------------------------------------------------------------------
| Public Routes (No Login Required)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Login Required)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum'])->group(function () {

    // --- 1. COMMON AREA (All Logged-in Users) ---
    // Dashboard & GDPR
    Route::get('/dashboard-stats', [DashboardController::class, 'stats']);
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('gdpr')->group(function () {
        Route::get('/export', [GdprController::class, 'exportData']);
        Route::post('/erasure', [GdprController::class, 'requestErasure']);
    });

    // Read Access (Assets & Policies)
    Route::get('/assets', [KnowledgeAssetController::class, 'index']);
    Route::get('/assets/{id}', [KnowledgeAssetController::class, 'show']);
    Route::get('/assets/{id}/download', [KnowledgeAssetController::class, 'download']);

    Route::get('/policies', [PolicyController::class, 'index']);
    Route::get('/policies/{id}', [PolicyController::class, 'show']);

    // Contribution (Drafting)
    // Any user can upload a draft. 
    Route::post('/assets', [KnowledgeAssetController::class, 'store']);

    // Modification (Self-Service)
    // NOTE: Authorization for "Is this my file?" happens inside the Controller
    Route::put('/assets/{id}', [KnowledgeAssetController::class, 'update']);


    // --- 2. SUPERVISOR ZONE (Approvals) ---
    // Allowed: Supervisors, Admins, Council
    Route::middleware(['role:SUPERVISOR,ADMIN,GOVERNANCE_COUNCIL'])->group(function () {
        // The "Review" button to Approve/Reject assets
        Route::patch('/assets/{id}/review', [KnowledgeAssetController::class, 'review']);
    });


    // --- 3. LEGISLATIVE ZONE (Governance Council) ---
    // Allowed: Governance Council, Admin
    Route::middleware(['role:ADMIN,GOVERNANCE_COUNCIL'])->group(function () {
        // Create, Enact (Publish), and Deprecate Laws
        Route::post('/policies', [PolicyController::class, 'store']);
        Route::patch('/policies/{id}/publish', [PolicyController::class, 'publish']);
        Route::patch('/policies/{id}/deprecate', [PolicyController::class, 'deprecate']);
    });


    // --- 4. DANGER ZONE (Admin Only) ---
    // Allowed: Admin only
    Route::middleware(['role:ADMIN'])->group(function () {
        // User Management
        Route::apiResource('users', UserController::class);

        // Hard Deletes (Only Admins can wipe data)
        Route::delete('/assets/{id}', [KnowledgeAssetController::class, 'destroy']);
    });
});
