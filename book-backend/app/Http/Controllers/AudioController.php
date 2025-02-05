<?php

// app/Http/Controllers/AudioController.php
namespace App\Http\Controllers;

use App\Models\AudioRecord;
// use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\Book;
use App\Models\UserToken;

class AudioController extends Controller
{
    // Upload audio file
    public function uploadAudio(Request $request)
{
    // Validate the incoming request
    $validator = Validator::make($request->all(), [
        'audio' => 'required|file|mimes:mp3,wav,ogg,webm|max:10240',  // Ensure it's a valid file
        'book_id' => 'required|integer|exists:books,id',
        'page_number' => 'required|integer',
    ]);

    if ($validator->fails()) {
        return response()->json($validator->errors(), 400);
    }

    // Get the token from the request header and remove the Bearer prefix
    $userToken = $request->header('Authorization');
    if (!$userToken) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    $userToken = str_replace('Bearer ', '', $userToken); // Remove Bearer prefix

    // Fetch the user associated with the token
    $userTokenRecord = UserToken::where('token', $userToken)->first();
    if (!$userTokenRecord) {
        return response()->json(['error' => 'Invalid token'], 401);
    }

    // Retrieve the user_id from the UserToken record
    $userId = $userTokenRecord->id;

    // Store the file in the 'storage/app/public/recordings' folder
    $audioFile = $request->file('audio');
    $audioPath = $audioFile->store('recordings', 'public');  

    // Save file path and user_id in the database
    $audioRecord = AudioRecord::create([
        'user_id' => $userId,  // Use the retrieved user_id
        'book_id' => $request->book_id,
        'page_number' => $request->page_number,
        'audio_path' => $audioPath,  
    ]);

    return response()->json([
        'message' => 'Audio uploaded successfully!',
        'audio' => $audioRecord,
        'audio_url' => asset("storage/" . $audioPath), // Correct file retrieval path
    ]);
}

public function getAudio(Request $request, $bookId, $pageNumber)
{
    // Get the token from the request header
    $userToken = $request->header('Authorization');
    if (!$userToken) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    // Remove 'Bearer ' prefix from the token
    $userToken = str_replace('Bearer ', '', $userToken);

    // Find the user from the token
    $userTokenRecord = UserToken::where('token', $userToken)->first();
    if (!$userTokenRecord) {
        return response()->json(['error' => 'Invalid token'], 401);
    }

    $userId = $userTokenRecord->id;

    // Get the audio record for the specified user, book, and page
    $audioRecord = AudioRecord::where('user_id', $userId)
                              ->where('book_id', $bookId)
                              ->where('page_number', $pageNumber)
                              ->first();

    if ($audioRecord) {
        // Generate the full URL for the audio file
        $audioUrl = asset("storage/" . $audioRecord->audio_path);
        
        return response()->json(['audio_url' => $audioUrl]);
    } else {
        return response()->json(['error' => 'Audio not found'], 404);
    }
}

}
