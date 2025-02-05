<?php

// database/migrations/xxxx_xx_xx_create_audio_records_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAudioRecordsTable extends Migration
{
    public function up()
    {
        Schema::create('audio_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Link to users table
            $table->foreignId('book_id')->constrained()->onDelete('cascade'); // Link to books
            $table->foreignId('page_number')->nullable(); // Optional: store page number if relevant
            $table->string('audio_path'); // Path to the stored audio file
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('audio_records');
    }
}
