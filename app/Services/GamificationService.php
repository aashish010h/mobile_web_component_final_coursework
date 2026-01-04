<?php

namespace App\Services;

use App\Models\User;
use App\Models\Badge;
use Illuminate\Support\Facades\DB;

class GamificationService
{
    /**
     * Award points to a user and check for new badges.
     */
    public function awardPoints(User $user, int $points, string $actionType)
    {
        DB::transaction(function () use ($user, $points, $actionType) {

            // 1. Log the history
            $user->pointHistories()->create([
                'action_type' => $actionType,
                'points_awarded' => $points,
            ]);

            // 2. Update User Total (Fast read for leaderboard)
            $user->increment('points', $points);

            // 3. Check for Badges (The Hook)
            $this->checkForNewBadges($user);
        });
    }

    private function checkForNewBadges(User $user)
    {
        // Get all badges the user qualifies for BUT doesn't have yet
        $newBadges = Badge::where('points_required', '<=', $user->points)
            ->whereDoesntHave('users', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->get();

        foreach ($newBadges as $badge) {
            $user->badges()->attach($badge->id);
            // In a real app, you would send a notification here
        }
    }
}
