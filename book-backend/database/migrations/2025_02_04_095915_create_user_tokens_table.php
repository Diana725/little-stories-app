<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('user_tokens', function (Blueprint $table) {
        $table->id();
        $table->string('token')->unique();
        $table->unsignedBigInteger('user_id')->nullable();  // Optional if you want to link it to an existing user
        $table->timestamps();
    });
}

public function down()
{
    Schema::dropIfExists('user_tokens');
}

};
