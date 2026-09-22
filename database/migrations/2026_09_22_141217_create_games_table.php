<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();

            $table->string('mode');  // singleplayer, multiplayer
            $table->string('status')->default('waiting');
            $table->unsignedTinyInteger('max_players')->default(4);

            // Shared state: remaining tiles, rules, etc.
            $table->json('state')->nullable();

            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();

            // Records whether final wins/losses have been applied.
            $table->timestamp('stats_recorded_at')->nullable();

            $table->timestamps();
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
