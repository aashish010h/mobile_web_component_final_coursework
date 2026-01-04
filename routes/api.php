<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CsvImportController;
use App\Http\Controllers\CsvUploadController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FileController;
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

Route::prefix('csv')->middleware('auth:sanctum')->group(function () {
    Route::get('/list', [CsvUploadController::class, 'index']);
    Route::post('/upload', [CsvUploadController::class, 'upload']);
});


Route::middleware(['auth:sanctum'])->group(function () {

    // 1. ADMIN ONLY (User Management)
    Route::middleware(['role:ADMIN'])->group(function () {
        Route::apiResource('users', UserController::class);
    });

    // 2. GOVERNANCE COUNCIL & ADMIN (Policy Approval)
    // By listing both, EITHER role can access.
    Route::middleware(['role:ADMIN,GOVERNANCE_COUNCIL'])->group(function () {
        Route::post('/policies/approve', [PolicyController::class, 'approve']);
    });
});


Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard-stats', [DashboardController::class, 'stats']);
    // ====================================================
    // 1. OPEN ACCESS (All Authenticated Users)
    // ====================================================
    // Everyone needs to search and view content
    Route::get('/assets', [KnowledgeAssetController::class, 'index']);
    Route::get('/assets/{id}', [KnowledgeAssetController::class, 'show']);
    Route::get('/assets/{id}/download', [KnowledgeAssetController::class, 'download']);

    // Everyone can draft content (Contribution Model)
    Route::post('/assets', [KnowledgeAssetController::class, 'store']);


    // ====================================================
    // 2. AUTHOR / CONTRIBUTOR ACCESS
    // ====================================================
    // Updating: The Controller handles the "Owner Check" logic internally
    // so we allow access, but the code ensures you only edit your own work.
    Route::put('/assets/{id}', [KnowledgeAssetController::class, 'update']);


    // ====================================================
    // 3. SUPERVISOR & GOVERNANCE (Approval Flow)
    // ====================================================
    // Only these roles can flip a status to "PUBLISHED" or "REJECTED"
    // You need to add this 'review' method to your Controller (see below)
    Route::patch('/assets/{id}/review', [KnowledgeAssetController::class, 'review'])
        ->middleware('role:SUPERVISOR,ADMIN,GOVERNANCE_COUNCIL');


    // ====================================================
    // 4. ADMIN ONLY (Destructive Actions)
    // ====================================================
    // No one else should be able to wipe data from the DB
    Route::delete('/assets/{id}', [KnowledgeAssetController::class, 'destroy'])
        ->middleware('role:ADMIN');
});
