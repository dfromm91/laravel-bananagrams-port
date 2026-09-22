<?php

use App\Http\Controllers\Game\SoloGameController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'game/home')->name('home');
Route::inertia('/rules', 'game/rules')->name('game.rules');
Route::get('/singleplayer', [SoloGameController::class, 'show'])->block()->name('game.singleplayer');
Route::post('/singleplayer/action', [SoloGameController::class, 'action'])->middleware('throttle:120,1')->block()->name('game.singleplayer.action');
Route::inertia('/bananagrams', 'game/setup')->name('game.setup');
Route::inertia('/profile', 'game/profile')->middleware('auth')->name('game.profile');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
