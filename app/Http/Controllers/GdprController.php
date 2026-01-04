<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\User;

class GdprController extends Controller
{
    public function exportData(Request $request)
    {
        $user = auth()->user();

        // Load all related data
        // We use 'load' to fetch relationships efficiently
        $user->load([
            'badges',
            'pointHistories',
            // If you have a 'assets' relationship for authored content:
            // 'assets' 
        ]);

        $data = [
            'identity' => [
                'name' => $user->name,
                'email' => $user->email,
                'joined_at' => $user->created_at,
                'role' => $user->role,
                'department' => $user->department,
            ],
            'gamification' => [
                'current_points' => $user->points,
                'badges_earned' => $user->badges->pluck('name'),
                'history' => $user->pointHistories
            ],
            // 'authored_content' => $user->assets // Uncomment if relation exists
        ];

        // Return as a downloadable JSON file
        return response()->json($data, 200, [
            'Content-Disposition' => 'attachment; filename="my-data-export.json"',
        ]);
    }

    /**
     * RIGHT TO BE FORGOTTEN
     * Anonymize the user instead of deleting
     */
    public function requestErasure(Request $request)
    {
        $user = auth()->user();

        // 1. Security Check: Admins cannot delete themselves (safety)
        if ($user->role === 'ADMIN') {
            return response()->json(['message' => 'Admins cannot be anonymized. Demote yourself first.'], 403);
        }

        DB::transaction(function () use ($user) {
            // 2. Scramble PII (Personally Identifiable Information)
            $randomString = Str::random(8);

            $user->update([
                'name' => 'Deleted User ' . $user->id,
                'email' => 'deleted_' . $user->id . '_' . $randomString . '@anonymized.local', // Unique fake email
                'department' => null,
                'is_active' => false,
                'password' => bcrypt(Str::random(32)), // Lock them out forever
                // We keep the ID and Role so audit logs ("User 5 deleted asset X") stay valid
            ]);

            // 3. Optional: Revoke tokens
            $user->tokens()->delete();
        });

        return response()->json(['message' => 'Account anonymized successfully. You are now logged out.']);
    }
}
