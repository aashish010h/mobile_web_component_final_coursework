<?php

namespace App\Http\Controllers;

use App\Http\Requests\Login\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || ! Hash::check($request->password, $user->password)) {

            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);

            AuditLog::create([
                'user_id'    => $user->id ?? null, // Unknown user
                'action'     => 'LOGIN_FAILED',
                'ip_address' => $request->ip(),
                'details'    => [
                    'email_attempted' => $request->email,
                    'browser' => $request->userAgent()
                ]
            ]);
        }

        $token = $user->createToken('AuthToken')->plainTextToken;

        AuditLog::create([
            'user_id'    => $user->id,
            'action'     => 'LOGIN_SUCCESS',
            'ip_address' => $request->ip(),
            'details'    => ['browser' => $request->userAgent()]
        ]);

        return response()->json([
            'user' => $user->only('id', 'name', 'email'),
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function getUser(Request $request)
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request): JsonResponse
    {
        // Revoke the token currently used for the request
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
