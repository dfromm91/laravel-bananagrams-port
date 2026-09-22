<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GamePagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_game_pages_render(): void
    {
        foreach (['/' => 'home', '/rules' => 'rules', '/singleplayer' => 'singleplayer', '/bananagrams' => 'setup'] as $url => $page) {
            $this->get($url)->assertOk()->assertInertia(fn (Assert $inertia) => $inertia->component('game/'.$page));
        }
    }

    public function test_profile_requires_authentication(): void
    {
        $this->get('/profile')->assertRedirect('/login');
        $this->actingAs(User::factory()->create())->get('/profile')->assertOk()
            ->assertInertia(fn (Assert $inertia) => $inertia->component('game/profile'));
    }
}
