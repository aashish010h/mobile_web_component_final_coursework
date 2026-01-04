<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Badge;
use App\Models\GovernancePolicy;
use App\Models\Tag;
use App\Models\KnowledgeAsset;
use App\Models\PointHistory;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ===================================================
        // 1. SYSTEM SETUP (Badges & Tags)
        // ===================================================
        $this->command->info('1. Seeding Gamification & Taxonomy...');

        $badges = [
            ['name' => 'Novice Contributor', 'icon' => '🥉', 'points_required' => 10],
            ['name' => 'Knowledge Expert',   'icon' => '🥈', 'points_required' => 50],
            ['name' => 'Governance Master',  'icon' => '🥇', 'points_required' => 100],
            ['name' => 'Legend',             'icon' => '👑', 'points_required' => 500],
        ];
        foreach ($badges as $b) {
            Badge::firstOrCreate(['name' => $b['name']], $b);
        }

        $tags = [
            ['name' => 'HR Policy', 'category' => 'Human Resources'],
            ['name' => 'IT Security', 'category' => 'Technology'],
            ['name' => 'Academic Regs', 'category' => 'Governance'],
            ['name' => 'Health & Safety', 'category' => 'Compliance'],
            ['name' => 'GDPR', 'category' => 'Legal'],
        ];
        foreach ($tags as $t) {
            Tag::firstOrCreate(['name' => $t['name']], $t);
        }


        // ===================================================
        // 2. USER HIERARCHY
        // ===================================================
        $this->command->info('2. Seeding Users...');

        $users = [
            'admin' => User::firstOrCreate(['email' => 'admin@uwl.ac.uk'], [
                'name' => 'System Admin',
                'role' => 'ADMIN',
                'department' => 'IT Services',
                'password' => Hash::make('password'),
                'points' => 120
            ]),
            'supervisor' => User::firstOrCreate(['email' => 'sarah.supervisor@uwl.ac.uk'], [
                'name' => 'Sarah Supervisor',
                'role' => 'SUPERVISOR',
                'department' => 'Human Resources',
                'password' => Hash::make('password'),
                'points' => 350
            ]),
            'champion' => User::firstOrCreate(['email' => 'david.champ@uwl.ac.uk'], [
                'name' => 'David Champion',
                'role' => 'KNOWLEDGE_CHAMPION',
                'department' => 'Academic Quality',
                'password' => Hash::make('password'),
                'points' => 600
            ]),
            'council' => User::firstOrCreate(['email' => 'emma.council@uwl.ac.uk'], [
                'name' => 'Emma Council',
                'role' => 'GOVERNANCE_COUNCIL',
                'department' => 'Executive Office',
                'password' => Hash::make('password'),
                'points' => 50
            ]),
            'employee' => User::firstOrCreate(['email' => 'john.doe@uwl.ac.uk'], [
                'name' => 'John Doe',
                'role' => 'EMPLOYEE',
                'department' => 'Finance',
                'password' => Hash::make('password'),
                'points' => 15
            ]),
        ];


        // ===================================================
        // 3. GOVERNANCE POLICIES (The "Laws")
        // ===================================================
        $this->command->info('3. Seeding Governance Policies...');

        $policies = [
            'gdpr' => GovernancePolicy::firstOrCreate(['title' => 'Data Protection Act 2026'], [
                'content' => '<h1>Data Protection Policy</h1><p>All user data must be encrypted. Users have the right to be forgotten.</p>',
                'status' => 'ACTIVE',
                'effective_date' => now()->subMonths(6),
                'approved_by' => $users['council']->id,
            ]),
            'remote' => GovernancePolicy::firstOrCreate(['title' => 'Flexible Working Policy'], [
                'content' => '<h1>Remote Work</h1><p>Employees may work from home 3 days a week.</p>',
                'status' => 'ACTIVE',
                'effective_date' => now()->subMonths(1),
                'approved_by' => $users['council']->id,
            ]),
            'draft_ai' => GovernancePolicy::firstOrCreate(['title' => 'AI Usage Guidelines (Draft)'], [
                'content' => '<h1>AI Ethics</h1><p>Draft regulations on using ChatGPT for coursework.</p>',
                'status' => 'DRAFT',
                'approved_by' => null, // Not approved yet
            ]),
        ];


        // ===================================================
        // 4. KNOWLEDGE ASSETS (Linked to Policies)
        // ===================================================
        $this->command->info('4. Seeding Knowledge Assets...');

        // Asset 1: Linked to GDPR Policy
        $asset1 = KnowledgeAsset::create([
            'title' => 'How to Encrypt Student Emails',
            'slug' => 'encrypt-student-emails-' . rand(1000, 9999),
            'summary' => 'Step-by-step guide to using Outlook Encryption.',
            'content_body' => '<p>Click Options > Encrypt...</p>',
            'status' => 'PUBLISHED',
            'author_id' => $users['champion']->id,
            'governance_policy_id' => $policies['gdpr']->id, // <--- LINKED HERE
            'view_count' => 150,
            'created_at' => now()->subDays(20),
        ]);
        $asset1->tags()->sync(Tag::whereIn('name', ['IT Security', 'GDPR'])->pluck('id'));

        // Asset 2: Linked to Remote Work Policy
        $asset2 = KnowledgeAsset::create([
            'title' => 'VPN Setup for Remote Access',
            'slug' => 'vpn-setup-' . rand(1000, 9999),
            'summary' => 'Required software to access internal servers from home.',
            'status' => 'PUBLISHED',
            'author_id' => $users['admin']->id,
            'governance_policy_id' => $policies['remote']->id, // <--- LINKED HERE
            'view_count' => 89,
            'created_at' => now()->subDays(15),
        ]);
        $asset2->tags()->sync(Tag::where('name', 'IT Security')->pluck('id'));

        // Asset 3: Draft (No policy link yet)
        KnowledgeAsset::create([
            'title' => 'My Personal Notes',
            'slug' => 'personal-notes-' . rand(1000, 9999),
            'summary' => 'Just some thoughts.',
            'status' => 'DRAFT',
            'author_id' => $users['employee']->id,
            'created_at' => now(),
        ]);


        // ===================================================
        // 5. GAMIFICATION HISTORY
        // ===================================================
        $this->command->info('5. Seeding Point History...');

        // Give the Champion some history so the GDPR export looks good
        if (class_exists(PointHistory::class)) {
            PointHistory::create([
                'user_id' => $users['champion']->id,
                'action_type' => 'ASSET_UPLOAD',
                'points_awarded' => 10,
                'created_at' => now()->subDays(20),
            ]);
            PointHistory::create([
                'user_id' => $users['champion']->id,
                'action_type' => 'ASSET_REVIEW',
                'points_awarded' => 5,
                'created_at' => now()->subDays(18),
            ]);

            // Assign badges based on points
            $legendBadge = Badge::where('name', 'Legend')->first();
            $users['champion']->badges()->syncWithoutDetaching([$legendBadge->id]);
        }

        $this->command->info('---------------------------------------');
        $this->command->info('✅ FULL SYSTEM SEED COMPLETE');
        $this->command->info('---------------------------------------');
    }
}
