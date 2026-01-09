<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Check if the user's role is in the list of allowed roles
        if (! in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Access Denied: You do not have the required permissions.',
                'error_code' => 'FORBIDDEN_ACCESS', // predictable code for frontend checks
                'required_roles' => $roles          // (Optional) Helps you debug
            ], 403);
        }

        return $next($request);
    }
}
