<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    
    public function __construct($user)
    {
        $this->user = $user;
    }

    public function build()
{
    return $this->subject('Verify Your Email')
        ->view('emails.verify-email')
        ->with([
            'verificationLink' => 'https://sarastories.com/frontend/verify-email?token=' . $this->user->verification_token
        ]);
}

}
