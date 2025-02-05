<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\AudioController;
use Illuminate\Support\Str;
use App\Models\UserToken;

Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{id}', [BookController::class, 'show']);
Route::get('/books/{id}/pages', [PageController::class, 'getPagesByBook']);
Route::post('/books', [BookController::class, 'store']); // Admin functionality
Route::post('/books/{id}/pages', [PageController::class, 'store']); // Admin functionality

// routes/api.php
Route::get('session/start', function () {
    $token = Str::random(32); // Generate a random unique token

    // Save the token in the user_tokens table
    UserToken::create([
        'token' => $token,
        'user_id' => null, // Initially set to null
    ]);

    return response()->json(['token' => $token]);
});

Route::middleware(App\Http\Middleware\CustomAuth::class)->group(function () {
    Route::post('audio/upload', [AudioController::class, 'uploadAudio']);
    Route::get('audio/{bookId}/{pageNumber}', [AudioController::class, 'getAudio']);
});

