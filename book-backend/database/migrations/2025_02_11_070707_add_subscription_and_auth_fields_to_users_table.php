<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('subscription_status', ['active', 'inactive', 'expired'])->default('inactive');
            $table->dateTime('subscription_expiry')->nullable();
            $table->string('verification_token')->nullable();
            $table->string('reset_token')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['subscription_status', 'subscription_expiry', 'verification_token', 'reset_token']);
        });
    }
};
