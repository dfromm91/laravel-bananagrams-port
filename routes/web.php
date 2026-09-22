<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'game/home')->name('home');
Route::inertia('/rules', 'game/rules')->name('game.rules');
Route::inertia('/singleplayer', 'game/singleplayer')->name('game.singleplayer');
Route::inertia('/bananagrams', 'game/setup')->name('game.setup');
Route::inertia('/profile', 'game/profile')->middleware('auth')->name('game.profile');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
