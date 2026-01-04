<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validate Input (Strict)
        // 'confirmed' looks for password_confirmation field automatically
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => [
                'required',
                'string',
                Rule::in(['EMPLOYEE', 'SUPERVISOR', 'ADMIN', 'KNOWLEDGE_CHAMPION', 'GOVERNANCE_COUNCIL'])
            ],
            'department' => ['nullable', 'string', 'max:100'],
        ]);

        // 2. Create User
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']), // NEVER forget Hash::make
            'role' => $validated['role'],
            'department' => $validated['department'] ?? null,
            'is_active' => true,
            'locale' => 'en_GB', // Enforcing your UK requirement
        ]);

        // 3. Return 201 Created
        return response()->json([
            'message' => 'User created successfully',
            'data' => $user
        ], 201);
    }
    public function index(Request $request)
    {
        $query = User::query();

        // Search by Name or Email
        $query->when($request->input('search'), function ($q, $search) {
            $q->where(function ($subQ) use ($search) {
                $subQ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        });

        // Filter by Role
        $query->when($request->input('role'), function ($q, $role) {
            $q->where('role', $role);
        });

        // Filter by Status (Active/Inactive)
        $query->when($request->has('is_active'), function ($q) {
            // "true" string from React needs parsing
            $isActive = filter_var(request('is_active'), FILTER_VALIDATE_BOOLEAN);
            $q->where('is_active', $isActive);
        });

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');

        // Prevent sorting by sensitive or non-existent columns
        $allowedSorts = ['name', 'email', 'role', 'created_at', 'is_active'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Pagination (10 per page default)
        return response()->json($query->paginate($request->input('per_page', 10)));
    }

    public function show(User $user)
    {
        return $user; // Laravel automatically converts to JSON
    }
    /**
     * Update user role or status.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            // Unique check must ignore the CURRENT user's ID
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', 'string'],
            'department' => ['nullable', 'string'],
            'is_active' => ['boolean'], // or ['in:0,1'] if sending strings
            // Password is OPTIONAL ('nullable')
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        // Only hash password if it was actually provided
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            // Remove it from the array so we don't overwrite with null
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json(['message' => 'User updated', 'user' => $user]);
    }

    /**
     * Soft delete the user.
     */
    public function destroy(User $user)
    {
        // prevent admin from deleting themselves
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete your own account'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deactivated successfully']);
    }
}
