<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index()
    {
        return Book::all();
    }

    public function show($id)
    {
        return Book::with('pages')->findOrFail($id);
    }

    public function store(Request $request)
{
    $request->validate([
        'title' => 'required|string|max:255',
        'cover_image' => 'required|file|mimes:jpeg,png,jpg,gif|max:2048', // Ensure it's an image file
    ]);

    // Handle the file upload
    if ($request->hasFile('cover_image')) {
        $path = $request->file('cover_image')->store('books', 'public'); // Save image in storage/app/public/books
        $filePath = 'storage/' . $path; // Convert to accessible path
    }

    // Create the book
    $book = Book::create([
        'title' => $request->input('title'),
        'cover_image' => $filePath, // Save the accessible file path
    ]);

    return response()->json($book, 201); // Return the created book
}

}
