<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\KnowledgeAsset;

class DashboardController extends Controller
{
    public function stats()
    {
        // 1. High-Level Counts
        $totalUsers = User::count();
        $totalAssets = KnowledgeAsset::count();
        // Add to stats() method or create a new method
        $leaderboard = User::select('id', 'name', 'points', 'department')
            ->with('badges:id,icon') // Eager load badges
            ->orderByDesc('points')
            ->take(5)
            ->get();
        // 2. Action Items (Governance)
        $pendingReviews = KnowledgeAsset::where('status', 'PENDING_REVIEW')->count();
        $flaggedAssets = KnowledgeAsset::where('status', 'FLAGGED_OUTDATED')->count();

        // 3. Recent Activity (Latest 5 uploads)
        $recentAssets = KnowledgeAsset::with('author:id,name') // Optimize query
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($asset) {
                return [
                    'id' => $asset->id,
                    'title' => $asset->title,
                    'author' => $asset->author->name ?? 'Unknown',
                    'status' => $asset->status,
                    'date' => $asset->created_at->format('d/m/Y H:i'), // UK Format
                ];
            });

        // 4. Asset Distribution (for simple graph/progress bar)
        $publishedCount = KnowledgeAsset::where('status', 'PUBLISHED')->count();
        $draftCount = KnowledgeAsset::where('status', 'DRAFT')->count();

        return response()->json([
            'counts' => [
                'users' => $totalUsers,
                'assets' => $totalAssets,
                'pending' => $pendingReviews,
                'flagged' => $flaggedAssets,
                'published' => $publishedCount,
                'drafts' => $draftCount,
                'leaderboard' => $leaderboard
            ],
            'recent_activity' => $recentAssets
        ]);
    }
}
