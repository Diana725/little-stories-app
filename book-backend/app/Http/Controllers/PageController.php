<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use App\Models\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function getPagesByBook($bookId)
    {
        return Page::where('book_id', $bookId)->orderBy('page_number')->get();
    }

    public function store(Request $request, $bookId) 
    {
        $request->validate([
            'page_number' => 'required|integer',
            'words' => 'required|string',
            'image' => 'required|file|mimes:jpeg,png,jpg,gif|max:2048', // Ensure it's an image file
        ]);
    
        // Handle the file upload
        if ($request->hasFile('image')) {
            // Store the image in storage/app/public/pages/{bookId}
            $path = $request->file('image')->store("pages/$bookId", 'public'); // Use the 'public' disk
            $filePath = 'storage/' . $path; // Convert to accessible URL path
        }
    
        // Create the page
        $page = Page::create([
            'book_id' => $bookId,
            'page_number' => $request->input('page_number'),
            'words' => $request->input('words'),
            'image' => $filePath, // Save the accessible file path in the database
        ]);
    
        return response()->json($page, 201); // Return the created page
    }    
}

