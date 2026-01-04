<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Check if a user with this email already exists to prevent duplicates
        if (User::where('email', 'admin@admin.com')->exists()) {
            $this->command->info('Admin user already exists. Skipping...');
            return;
        }

        // Create the user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@admin.com',
            'role' => 'ADMIN',
            'password' => Hash::make('password'),  // Hash the password 'adminadmin' before saving it to the database
            'email_verified_at' => now(),
        ]);

        \App\Models\Badge::insert([
            ['name' => 'Novice Contributor', 'icon' => '🥉', 'points_required' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Knowledge Expert',   'icon' => '🥈', 'points_required' => 50, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Governance Master',  'icon' => '🥇', 'points_required' => 100, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Legend',             'icon' => '👑', 'points_required' => 500, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $this->command->info('Admin user created successfully!');
    }
}
