<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SubscriptionController extends Controller
{
    /**
     * Initiate subscription payment (Step 1)
     */
    public function initiatePayment(Request $request)
{
    $user = auth()->user();

    if (!$user) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    $plan = $request->input('plan');
    if (!in_array($plan, ['monthly', 'yearly'])) {
        return response()->json(['error' => 'Invalid plan selected'], 400);
    }

    // Determine User's Country
    try {
        $ipResponse = Http::get("https://ipinfo.io/json?token=60def6b50597e2");
        $country = $ipResponse->successful() ? $ipResponse->json()['country'] : 'KE';
    } catch (\Exception $e) {
        $country = 'KE'; // Default to Kenya if API fails
    }

    // Default Prices in KES
    $amountKES = $plan === 'monthly' ? 700 : 4200;
    $currency = 'KES';

    // Convert to USD if user is outside Kenya
    if ($country !== 'KE') {
        try {
            $exchangeResponse = Http::get("https://api.exchangerate-api.com/v4/latest/KES");
            $exchangeRate = $exchangeResponse->successful() ? $exchangeResponse->json()['rates']['USD'] : 0.0077; // Default rate if API fails
            $amountUSD = round($amountKES * $exchangeRate, 2);
            $currency = 'USD';
        } catch (\Exception $e) {
            $amountUSD = $amountKES; // Fallback to KES if API fails
        }

        $amount = $amountUSD;
    } else {
        $amount = $amountKES;
    }

    $description = $plan === 'monthly' ? 'Little Stories Monthly Subscription' : 'Little Stories Annual Subscription';

    $apiKey    = env('INTASEND_SECRET_KEY');
    $publicKey = env('INTASEND_PUBLIC_KEY');
    $baseUrl   = 'https://sandbox.intasend.com';

    $apiRef = 'sub_' . $user->id . '_' . time();
    $method = $request->input('method', 'CARD-PAYMENT');
    $phoneNumber = $request->input('phone_number');

    try {
        if ($method === 'CARD-PAYMENT') {
            $firstName = $request->input('first_name');
            $lastName  = $request->input('last_name');

            if (!$firstName || !$lastName) {
                return response()->json(['error' => 'Missing first_name or last_name for card payment'], 400);
            }

            $response = Http::withHeaders([
                'X-IntaSend-Public-API-Key' => $publicKey,
                'Content-Type'  => 'application/json',
            ])->post("$baseUrl/api/v1/checkout/", [
                'first_name'    => $firstName,
                'last_name'     => $lastName,
                'email'         => $user->email,
                'method'        => 'CARD-PAYMENT',
                'amount'        => $amount,
                'currency'      => $currency,
                'api_ref'       => $apiRef,
                'callback_url'  => 'https://6ccf-102-219-208-127.ngrok-free.app/api/subscription/callback',
                'redirect_url'  => route('subscription.callback'),
                'public_key'    => $publicKey,
            ]);

            $data = $response->json();

            if ($response->successful()) {
                return response()->json([
                    'payment_request_sent' => true,
                    'payment_api_response' => $data,
                ]);
            } else {
                return response()->json([
                    'error' => 'Card payment initiation failed',
                    'details' => $data,
                ], $response->status());
            }
        } elseif ($method === 'M-PESA') {
            if (!$phoneNumber) {
                return response()->json(['error' => 'Phone number is required for M-PESA payment'], 400);
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type'  => 'application/json',
            ])->post("$baseUrl/api/v1/payment/mpesa-stk-push/", [
                'currency'      => $currency,
                'amount'        => $amount,
                'phone_number'  => $phoneNumber,
                'email'         => $user->email,
                'api_ref'       => $apiRef,
                'callback_url'  => 'https://6ccf-102-219-208-127.ngrok-free.app/api/subscription/callback',
                'method'        => 'M-PESA',
            ]);

            $data = $response->json();

            if ($response->successful()) {
                return response()->json([
                    'payment_request_sent' => true,
                    'payment_api_response' => $data,
                ]);
            } else {
                return response()->json([
                    'error' => 'M-PESA payment initiation failed',
                    'details' => $data,
                ], $response->status());
            }
        }

        return response()->json(['error' => 'Unsupported payment method'], 400);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Something went wrong during payment initiation',
            'message' => $e->getMessage(),
        ], 500);
    }
}

    /**
     * Handle Payment Callback from IntaSend (Step 2)
     */
    public function paymentCallback(Request $request)
    {
        \Log::info('IntaSend Callback Request', [
            'method' => $request->method(),
            'data' => $request->all()
        ]);
    
        // If this is a GET request (redirect after payment), send user to the frontend success page.
        if ($request->isMethod('get')) {
            // You can also pass along query parameters if needed
            return redirect('https://sarastories.com/frontend/payment-success');
        }
    
        // For POST requests (webhook notifications)...
        if (!isset($request->api_ref)) {
            \Log::error('Invalid callback payload', $request->all());
            return response()->json(['error' => 'Invalid callback payload'], 400);
        }
    
        $parts = explode('_', $request->api_ref);
        $userId = $parts[1] ?? null;
    
        if (!$userId) {
            \Log::error('User ID not found in api_ref', ['api_ref' => $request->api_ref]);
            return response()->json(['error' => 'User ID not found in api_ref'], 400);
        }
    
        $user = User::find($userId);
        if (!$user) {
            \Log::error('User not found', ['user_id' => $userId]);
            return response()->json(['error' => 'User not found'], 404);
        }
    
        // Handle the POST webhook callback
        if ($request->input('state') === 'COMPLETE') {
            $packageType = $user->package_type; // 'monthly' or 'yearly'
            $expiry = $packageType === 'monthly' ? now()->addMonth() : now()->addYear();
    
            $user->update([
                'subscription_status' => 'active',
                'subscription_expiry' => $expiry,
            ]);
    
            \Log::info('Subscription activated for user', ['user_id' => $userId]);
    
            return response()->json([
                'message' => 'Subscription activated successfully',
                'subscription_expiry' => $expiry->toDateTimeString(),
            ]);
        }
    
        \Log::info('Payment not completed', ['status' => $request->input('state'), 'user_id' => $userId]);
        return response()->json([
            'message' => 'Payment not completed',
            'status' => $request->input('state'),
        ]);
    }    

    public function checkStatus(Request $request)
    {
        $user = $request->user(); 

        return response()->json([
            'subscription_status' => $user->subscription_status, 
        ]);
    }
}
