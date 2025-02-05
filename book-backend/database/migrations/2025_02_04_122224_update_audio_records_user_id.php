<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateAudioRecordsUserId extends Migration
{
    public function up()
    {
        // Update the audio_records table
        Schema::table('audio_records', function (Blueprint $table) {
            // Remove the old foreign key constraint if exists
            $table->dropForeign(['user_id']);
            
            // Modify the user_id field to be nullable and not have a foreign key constraint
            $table->foreignId('user_id')->nullable()->change();
        });
    }

    public function down()
    {
        // Rollback changes (if needed)
        Schema::table('audio_records', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });
    }
}