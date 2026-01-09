<?php

namespace App\Observers;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditObserver
{
    public function created(Model $model)
    {
        $this->log($model, 'CREATED', ['new' => $model->getAttributes()]);
    }

    public function updated(Model $model)
    {
        // Only log what actually changed
        $changes = $model->getChanges();
        $original = $model->getOriginal();

        // Filter original to only show keys that changed
        $oldValues = array_intersect_key($original, $changes);

        $this->log($model, 'UPDATED', [
            'old' => $oldValues,
            'new' => $changes
        ]);
    }

    public function deleted(Model $model)
    {
        $this->log($model, 'DELETED', ['old' => $model->getAttributes()]);
    }

    // Helper function to insert the log
    protected function log(Model $model, string $action, array $details)
    {
        AuditLog::create([
            'user_id'     => Auth::id(), // Current logged in user
            'action'      => $action,
            'target_type' => get_class($model), // e.g., App\Models\KnowledgeAsset
            'target_id'   => $model->id,
            'details'     => $details,
            'ip_address'  => Request::ip(),
        ]);
    }
}
