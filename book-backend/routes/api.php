<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\AudioController;
use Illuminate\Support\Str;
use App\Models\UserToken;
use App\Models\User;
use Carbon\Carbon;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SubscriptionController;

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::post('/logout', [UserController::class, 'logout'])->middleware('auth:sanctum');


// Email verification
Route::get('/verify-email', function (Request $request) {
    $token = $request->query('token');

    if (!$token) {
        return response()->json(['success' => false, 'message' => 'No token provided'], 400);
    }

    $user = User::where('verification_token', $token)->first();

    // Check if the user is already verified
    if (!$user && User::whereNotNull('email_verified_at')->whereNull('verification_token')->exists()) {
        return response()->json(['success' => true, 'message' => 'Email already verified.']);
    }

    if (!$user) {
        return response()->json(['success' => false, 'message' => 'Invalid or expired link.'], 400);
    }

    // Mark email as verified
    $user->email_verified_at = now();
    $user->verification_token = null; // Clear the token after verification
    $user->save();

    return response()->json(['success' => true, 'message' => 'Email verified successfully']);
});


// Password recovery
Route::post('/password/request-reset', [UserController::class, 'requestPasswordReset']);
Route::post('/password/reset', [UserController::class, 'resetPassword']);

Route::get('/books', [BookController::class, 'index']);

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

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/books/{id}', [BookController::class, 'show']);

    Route::post('audio/upload', [AudioController::class, 'uploadAudio']);
    Route::get('audio/{bookId}/{pageNumber}', [AudioController::class, 'getAudio']);
    Route::post('/subscription/initiate', [SubscriptionController::class, 'initiatePayment']);

    Route::get('/user/subscription-status', [SubscriptionController::class, 'checkStatus']);
});

Route::match(['get', 'post'], '/subscription/callback', [SubscriptionController::class, 'paymentCallback'])->name('subscription.callback');
