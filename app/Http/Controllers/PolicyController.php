<?php

namespace App\Http\Controllers;

use App\Models\GovernancePolicy;
use Illuminate\Http\Request;

class PolicyController extends Controller
{
    public function index()
    {
        return GovernancePolicy::with('approver:id,name,role')
            ->orderBy('status') // Active first usually
            ->latest()
            ->get();
    }

    /**
     * Create Draft (Admin/Council Only)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'effective_date' => 'nullable|date',
        ]);

        $policy = GovernancePolicy::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'status' => 'DRAFT', // Always starts as draft
            'effective_date' => $validated['effective_date'],
        ]);

        return response()->json($policy, 201);
    }

    /**
     * Show single policy
     */
    public function show($id)
    {
        return GovernancePolicy::with(['approver', 'assets'])->findOrFail($id);
    }

    /**
     * PUBLISH (Enforce the policy)
     * Only GOVERNANCE_COUNCIL or ADMIN should do this.
     */
    public function publish(Request $request, $id)
    {
        // 1. Strict Role Check
        if (!in_array($request->user()->role, ['ADMIN', 'GOVERNANCE_COUNCIL'])) {
            return response()->json(['message' => 'Only the Governance Council can enact laws.'], 403);
        }

        $policy = GovernancePolicy::findOrFail($id);

        $policy->update([
            'status' => 'ACTIVE',
            'approved_by' => $request->user()->id, // Digital Signature
            'effective_date' => $request->input('effective_date', now()),
        ]);

        return response()->json(['message' => 'Policy is now ACTIVE.', 'data' => $policy]);
    }

    /**
     * Deprecate (Retire a policy)
     */
    public function deprecate(Request $request, $id)
    {
        if (!in_array($request->user()->role, ['ADMIN', 'GOVERNANCE_COUNCIL'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $policy = GovernancePolicy::findOrFail($id);
        $policy->update(['status' => 'DEPRECATED']);

        return response()->json(['message' => 'Policy marked as deprecated.']);
    }
}
