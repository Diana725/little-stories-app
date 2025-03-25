<!DOCTYPE html>
<html>
<head>
    <title>Password Reset</title>
</head>
<body>
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <a href="{{ url('https://sarastories.com/frontend/reset-password?token=' . $user->reset_token) }}">Reset Password</a>
    <p>If you did not request a password reset, please ignore this email.</p>
</body>
</html>
