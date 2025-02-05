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
    Schema::create('pages', function (Blueprint $table) {
        $table->id(); // Auto-increment ID
        $table->foreignId('book_id')->constrained('books')->onDelete('cascade'); // Foreign key referencing books table
        $table->integer('page_number'); // Page number
        $table->text('words'); // Words on the page
        $table->string('image'); // URL or path to the page image
        $table->timestamps(); // Created_at and updated_at timestamps
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
