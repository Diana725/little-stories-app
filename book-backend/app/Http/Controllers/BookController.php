<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Book;
use App\Models\User; // Ensure this is imported for user model
use Illuminate\Support\Facades\Auth; // To get the authenticated user

class BookController extends Controller
{
    public function index()
    {
        return Book::all();
    }

    public function show($id)
    {
        $user = Auth::user(); // Get the currently authenticated user

        // Check if the user's subscription is active
        if ($user->subscription_status !== 'active') {
            return response()->json([
                'message' => 'Your subscription is inactive. Please subscribe to access this book.',
            ], 403); // 403 Forbidden status
        }

        // If subscription is active, return the book details
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
