<?php

namespace App\Http\Controllers;

use App\Models\AudioRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AudioController extends Controller
{
    public function uploadAudio(Request $request)
{
    $validator = Validator::make($request->all(), [
        'audio' => 'required|file|max:10240',
        'book_id' => 'required|integer|exists:books,id',
        'page_number' => 'required|integer',
    ]);

    if ($validator->fails()) {
        return response()->json($validator->errors(), 400);
    }

    $user = auth()->user();

    if (!$user) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    // Check if the audio record already exists
    $existingAudio = AudioRecord::where('user_id', $user->id)
        ->where('book_id', $request->book_id)
        ->where('page_number', $request->page_number)
        ->first();

    // Upload the new audio file
    $audioFile = $request->file('audio');
    $audioPath = $audioFile->store('recordings', 'public');

    if ($existingAudio) {
        // DELETE the old file
        if ($existingAudio->audio_path) {
            \Storage::disk('public')->delete($existingAudio->audio_path);
        }

        // Update the existing record
        $existingAudio->update([
            'audio_path' => $audioPath,
        ]);

        return response()->json([
            'message' => 'Audio updated successfully!',
            'audio' => $existingAudio,
            'audio_url' => asset("storage/" . $audioPath),
        ]);
    } else {
        // Create a new record
        $audioRecord = AudioRecord::create([
            'user_id' => $user->id,
            'book_id' => $request->book_id,
            'page_number' => $request->page_number,
            'audio_path' => $audioPath,
        ]);

        return response()->json([
            'message' => 'Audio uploaded successfully!',
            'audio' => $audioRecord,
            'audio_url' => asset("storage/" . $audioPath),
        ]);
    }
}

    public function getAudio(Request $request, $bookId, $pageNumber)
    {
        // Get the authenticated user via Sanctum token
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Find the audio record
        $audioRecord = AudioRecord::where('user_id', $user->id)
            ->where('book_id', $bookId)
            ->where('page_number', $pageNumber)
            ->first();

        if ($audioRecord) {
            return response()->json([
                'audio_url' => asset("book-backend/public/storage/" . $audioRecord->audio_path)
            ]);
        }

        return response()->json(['error' => 'Audio not found'], 404);
    }
}
