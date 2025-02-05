<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserToken extends Model
{
    use HasFactory;

    protected $fillable = ['token', 'user_id'];  // You can also add 'user_id' if you want to link tokens to users

    // If you want to define the relationship to the User model, you can do it like this:
    // public function user() {
    //     return $this->belongsTo(User::class);
    // }
}
