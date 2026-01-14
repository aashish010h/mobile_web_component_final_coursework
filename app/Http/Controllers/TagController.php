<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index()
    {
        // Returns all tags. You can add ->where('category', 'GENERAL') if needed.
        return response()->json(Tag::orderBy('name', 'asc')->get());
    }
}
