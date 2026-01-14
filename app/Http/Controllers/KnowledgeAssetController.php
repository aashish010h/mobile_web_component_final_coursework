<?php

namespace App\Http\Controllers;

use App\Models\KnowledgeAsset;
use App\Http\Resources\KnowledgeAssetResource;
use App\Models\AuditLog;
use App\Models\Notification;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class KnowledgeAssetController extends Controller
{
    public function index(Request $request)
    {
        $query = KnowledgeAsset::with(['author', 'tags', 'policy']);

        // 1. Unified Search (Title, Summary, OR Tags)
        $query->when($request->search, function ($q, $search) {
            $q->where(function ($sub) use ($search) {
                $sub->where('title', 'like', "%{$search}%")
                    ->orWhere('summary', 'like', "%{$search}%")
                    // Check for tags matching the search string
                    ->orWhereHas('tags', function ($t) use ($search) {
                        $t->where('name', 'like', "%{$search}%");
                    });
            });
        });

        // 2. Filter by Status
        // Standardizing to a simple column check to avoid "hasRole" errors
        $isAdmin = auth()->check() && (auth()->user()->role === 'ADMIN');

        if (!$request->status && !$isAdmin) {
            //$query->where('status', 'PUBLISHED');
        } else {
            $query->when($request->status, function ($q, $status) {
                $q->where('status', $status);
            });
        }

        // 3. Keep the specific tag_id filter 
        // This is useful if they click a specific tag badge in the UI
        $query->when($request->tag_id, function ($q, $tagId) {
            $q->whereHas('tags', function ($t) use ($tagId) {
                $t->where('tags.id', $tagId);
            });
        });

        return KnowledgeAssetResource::collection(
            $query->latest()->paginate(10)->withQueryString()
        );
    }

    /**
     * Create a new Asset
     */
    public function store(Request $request, GamificationService $gamification)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'required|string|max:500',
            'content_body' => 'nullable|string',
            'tags' => 'nullable|array', // Can be IDs or Strings
            'file' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx|max:10240',
            'governance_policy_id' => 'nullable|exists:governance_policies,id',
        ]);

        DB::beginTransaction();
        try {
            $filePath = null;
            if ($request->hasFile('file')) {
                $filePath = $request->file('file')->store('assets', 'public');
            }

            $asset = KnowledgeAsset::create([
                'author_id' => auth()->id(),
                'title' => $validated['title'],
                'slug' => Str::slug($validated['title']) . '-' . time(),
                'summary' => $validated['summary'],
                'content_body' => $validated['content_body'] ?? null,
                'file_path' => $filePath,
                'governance_policy_id' => $request->governance_policy_id,
                'status' => 'DRAFT',
            ]);

            // --- ENHANCED TAG LOGIC ---
            if (!empty($request->tags)) {
                $tagIds = [];
                foreach ($request->tags as $tagInput) {
                    // If it's numeric, assume it's an existing ID
                    if (is_numeric($tagInput)) {
                        $tagIds[] = $tagInput;
                    } else {
                        // If it's a string, find or create the tag
                        $newTag = \App\Models\Tag::firstOrCreate(
                            ['name' => trim($tagInput)],
                            ['category' => 'GENERAL'] // Default category
                        );
                        $tagIds[] = $newTag->id;
                    }
                }
                $asset->tags()->sync($tagIds);
            }

            $gamification->awardPoints(auth()->user(), 10, 'ASSET_UPLOAD');

            AuditLog::create([
                'user_id'     => Auth::id(),
                'action'      => 'ASSET_CREATE',
                'target_type' => KnowledgeAsset::class,
                'target_id'   => $asset->id,
                'ip_address'  => $request->ip()
            ]);

            Notification::create([
                'user_id' => auth()->id(),
                'type'    => 'success',
                'message' => "Successfully uploaded asset: {$asset->title}. It is currently in DRAFT.",
                'is_read' => false,
            ]);

            DB::commit();
            return new KnowledgeAssetResource($asset);
        } catch (\Exception $e) {
            DB::rollBack();
            if (isset($filePath)) Storage::disk('public')->delete($filePath);
            return response()->json(['message' => 'Asset creation failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Show Single Asset
     */
    public function show($id)
    {
        $asset = KnowledgeAsset::with(['author', 'tags', 'policy'])->findOrFail($id);

        // Increment View Count (simple implementation)
        $asset->increment('view_count');

        return new KnowledgeAssetResource($asset);
    }

    /**
     * Update Asset
     */
    public function update(Request $request, $id)
    {
        $asset = KnowledgeAsset::findOrFail($id);
        $user = auth()->user();

        if ($asset->author_id !== $user->id && !in_array($user->role, ['SUPERVISOR', 'ADMIN'])) {
            return response()->json(['message' => 'Unauthorized Access'], 403);
        }

        // 2. STATUS PROTECTION: Is the user trying to change the Status?
        if ($request->has('status') && $request->status !== $asset->status) {

            // Only Admin and Supervisor can change status (Approve/Publish)
            if (!in_array($user->role, ['ADMIN', 'SUPERVISOR'])) {
                return response()->json([
                    'message' => 'Forbidden. Only Supervisors or Admins can change the status.',
                    'error_code' => 'STATUS_CHANGE_DENIED'
                ], 403);
            }
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'summary' => 'sometimes|string|max:500',
            'tags' => 'array',
            'status' => 'sometimes|in:DRAFT,PENDING_REVIEW,PUBLISHED,ARCHIVED',
            'file' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        DB::beginTransaction();

        try {
            // 1. Handle New File Upload
            if ($request->hasFile('file')) {
                // Delete old file to save space
                if ($asset->file_path) {
                    Storage::disk('public')->delete($asset->file_path);
                }
                $asset->file_path = $request->file('file')->store('assets', 'public');
            }

            // 2. Update Basic Fields
            $asset->update($request->except(['file', 'tags']));

            // 3. Update Tags
            if ($request->has('tags')) {
                $asset->tags()->sync($validated['tags']);
            }
            AuditLog::create([
                'user_id'     => Auth::id(),
                'action'      => 'ASSET_UPDATE',
                'target_type' => KnowledgeAsset::class,
                'target_id'   => $asset->id,
                'ip_address'  => $request->ip()
            ]);

            Notification::create([
                'user_id' => auth()->id(),
                'type'    => 'success',
                'message' => "Updated asset: {$asset->title}.",
                'is_read' => false,
            ]);
            DB::commit();
            return new KnowledgeAssetResource($asset);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Update failed'], 500);
        }
    }

    /**
     * Delete (Soft Delete)
     */
    public function destroy(Request $request, $id)
    {
        $asset = KnowledgeAsset::findOrFail($id);

        if (auth()->user()->role !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $asset->delete(); // Soft delete (file remains in storage)

        AuditLog::create([
            'user_id'     => Auth::id(),
            'action'      => 'ASSET_DELETE',
            'target_type' => KnowledgeAsset::class,
            'target_id'   => $asset->id,
            'ip_address'  => $request->ip()
        ]);

        return response()->json(['message' => 'Asset archived successfully']);
    }

    /**
     * Download File
     */
    public function download(Request $request, $id)
    {
        $asset = KnowledgeAsset::findOrFail($id);

        if (!$asset->file_path || !Storage::disk('public')->exists($asset->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }
        AuditLog::create([
            'user_id'     => Auth::id(),
            'action'      => 'ASSET_DOWNLOAD',
            'target_type' => KnowledgeAsset::class,
            'target_id'   => $asset->id,
            'ip_address'  => $request->ip()
        ]);
        return Storage::disk('public')->download($asset->file_path, $asset->title . '.' . pathinfo($asset->file_path, PATHINFO_EXTENSION));
    }
}
