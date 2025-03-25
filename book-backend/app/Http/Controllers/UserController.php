<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerifyEmail;
use App\Mail\ResetPassword;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Laravel\Sanctum\PersonalAccessToken;

class UserController extends Controller
{
    // Register user
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'verification_token' => Str::random(64),
        ]);

        // Send verification email (to be implemented with views)
        Mail::to($user->email)->send(new VerifyEmail($user));
        return response()->json(['message' => 'Signup successful! Check your email to verify your account.'], 201);
    }

    // Login user
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        $user = User::where('email', $request->email)->first();
    
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }
    
        // Check if email is verified
        if (is_null($user->email_verified_at)) {
            return response()->json(['message' => 'Your email is not verified. Please check your inbox.'], 403);
        }
    
        $token = $user->createToken('auth_token')->plainTextToken;
        
        return response()->json([
            'token' => $token,
            'user' => $user
        ], 200);
    }
    

    // Email verification
    public function verifyEmail($token)
{
    $user = User::where('verification_token', $token)->first();
    
    if (!$user) {
        return response()->json([
            'message' => 'Invalid or expired verification token.',
            'status' => false
        ], 400);
    }

    $user->email_verified_at = Carbon::now();
    $user->save();
    $user->verification_token = null;

    return response()->json([
        'message' => 'Email verified successfully.',
        'status' => true
    ], 200);
}


    // Password recovery - request reset link
    public function requestPasswordReset(Request $request)
    {
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Email not found'], 404);
        }

        $user->reset_token = Str::random(64);
        $user->save();

        // Send reset email (to be implemented with views)
        Mail::to($user->email)->send(new ResetPassword($user));
        return response()->json(['message' => 'Password reset email sent'], 200);
    }

    // Password reset
    public function resetPassword(Request $request)
    {
        $user = User::where('reset_token', $request->token)->first();
        if (!$user) {
            return response()->json(['message' => 'Invalid token'], 400);
        }

        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->password = Hash::make($request->password);
        $user->reset_token = null;
        $user->save();

        return response()->json(['message' => 'Password reset successfully'], 200);
    }

    // Logout user
    public function logout(Request $request) 
{
    $user = Auth::guard('sanctum')->user(); // Ensure the user is authenticated

    if (!$user) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }

    // Revoke all tokens
    $user->tokens()->delete();

    return response()->json(['message' => 'User logged out successfully'], 200);
}
}
