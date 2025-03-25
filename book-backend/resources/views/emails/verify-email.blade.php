<!DOCTYPE html>
<html>
<head>
    <title>Email Verification</title>
</head>
<body>
    <p>Hello {{ $user->name }},</p>
    <p>Thank you for registering with Little Stories! Please verify your email by clicking the button below:</p>
    <a href="{{ $verificationLink }}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">
        Verify Email
    </a>
    <p>If you didn't create an account, please ignore this email.</p>
</body>
</html>
