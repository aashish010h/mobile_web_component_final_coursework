<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        // 1. Start the query
        $query = AuditLog::query();

        // 2. Eager Load 'user' to get the name/role (avoids N+1 problem)
        // We select specific fields to keep the response light
        $query->with(['user:id,name,email,role']);

        // 3. Optional: Simple Search Filter
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        // 4. Get paginated results (20 per page), sorted by newest first
        $logs = $query->latest()->paginate(20);

        return response()->json($logs);
    }
}
