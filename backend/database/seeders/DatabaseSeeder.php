<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\ConcoursCode;
use App\Models\ValidationCode;
use App\Models\Semester;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Utilisateurs ───────────────────────────────────────
        $superAdmin = User::create([
            'nom_complet' => 'Super Administrateur',
            'email'       => 'admin@cfi-ciras.org',
            'password'    => Hash::make('Lord@123@admin'),
            'role'        => 'super_admin',
            'is_active'   => true,
        ]);

        $admin = User::create([
            'nom_complet' => 'Dr. Michel Fouda',
            'email'       => 'directeur@cfi-ciras.org',
            'password'    => Hash::make('Dir@2024'),
            'role'        => 'admin',
            'is_active'   => true,
        ]);

        $prof1 = User::create([
            'nom_complet' => 'Dr. Owona',
            'email'       => 'owona@cfi-ciras.org',
            'password'    => Hash::make('Prof@2024'),
            'role'        => 'professeur',
            'is_active'   => true,
            'specialite'  => 'Informatique',
            'grade'       => 'Maître de Conférences',
        ]);

        $prof2 = User::create([
            'nom_complet' => 'Prof. Mbarga',
            'email'       => 'mbarga@cfi-ciras.org',
            'password'    => Hash::make('Prof@2024'),
            'role'        => 'professeur',
            'is_active'   => true,
            'specialite'  => 'Algorithmique',
            'grade'       => 'Professeur Titulaire',
        ]);

        User::create([
            'nom_complet' => 'Mme. Ngo Bassa',
            'email'       => 'secretariat@cfi-ciras.org',
            'password'    => Hash::make('Staff@2024'),
            'role'        => 'membre_administratif',
            'is_active'   => true,
            'service'     => 'Scolarité',
            'staff_role'  => 'responsable_scolarite',
        ]);

        $etud1 = User::create([
            'nom_complet' => 'Jean Kamga',
            'email'       => 'jean.kamga@etud.cfi-ciras.org',
            'password'    => Hash::make('Etud@2024'),
            'role'        => 'etudiant_concours',
            'is_active'   => true,
            'filiere'     => 'LIC',
            'annee'       => 'L1',
        ]);

        $etud2 = User::create([
            'nom_complet' => 'Paul Essomba',
            'email'       => 'paul.essomba@etud.cfi-ciras.org',
            'password'    => Hash::make('Etud@2024'),
            'role'        => 'etudiant_concours',
            'is_active'   => true,
            'filiere'     => 'LIC',
            'annee'       => 'L3',
            'option_lic'  => 'GL',
        ]);

        $etud3 = User::create([
            'nom_complet' => 'Sophie Ateba',
            'email'       => 'sophie.ateba@gmail.com',
            'password'    => Hash::make('Etud@2024'),
            'role'        => 'etudiant_externe',
            'is_active'   => true,
            'filiere'     => 'LAP',
            'annee'       => 'L2',
        ]);

        User::create([
            'nom_complet'     => 'Boris Ndongo',
            'email'           => 'boris.ndongo@gmail.com',
            'password'        => Hash::make('Etud@2024'),
            'role'            => 'etudiant_externe',
            'is_active'       => false,
            'filiere'         => 'LIC',
            'annee'           => 'L2',
            'payment_blocked' => true,
        ]);

        // ── 2. Codes concours ─────────────────────────────────────
        ConcoursCode::create(['code'=>'CONC-ABC123','nom_complet'=>'Jean Kamga',   'filiere'=>'LIC','annee'=>'L1',            'used'=>true, 'used_by'=>$etud1->id]);
        ConcoursCode::create(['code'=>'CONC-DEF456','nom_complet'=>'Marie Nkoulou','filiere'=>'LAP','annee'=>'L1',            'used'=>false]);
        ConcoursCode::create(['code'=>'CONC-GHI789','nom_complet'=>'Paul Essomba', 'filiere'=>'LIC','annee'=>'L3','option_lic'=>'GL','used'=>true,'used_by'=>$etud2->id]);

        // ── 3. Codes validation ───────────────────────────────────
        ValidationCode::create(['code'=>'EXT-XYZ001','used'=>true, 'used_by'=>$etud3->id,'expires_at'=>now()->addDays(30)]);
        ValidationCode::create(['code'=>'EXT-XYZ002','used'=>false,                       'expires_at'=>now()->addDays(30)]);

        // ── 4. Semestres ──────────────────────────────────────────
        Semester::create(['name'=>'Semestre 1','year'=>'2024-2025','start_date'=>'2024-10-01','end_date'=>'2025-01-31','is_active'=>true, 'type'=>'S1']);
        Semester::create(['name'=>'Semestre 2','year'=>'2024-2025','start_date'=>'2025-02-01','end_date'=>'2025-06-30','is_active'=>false,'type'=>'S2']);
        Semester::create(['name'=>'Semestre 3','year'=>'2024-2025','start_date'=>'2024-10-01','end_date'=>'2025-01-31','is_active'=>false,'type'=>'S3']);
        Semester::create(['name'=>'Semestre 4','year'=>'2024-2025','start_date'=>'2025-02-01','end_date'=>'2025-06-30','is_active'=>false,'type'=>'S4']);
        Semester::create(['name'=>'Semestre 5','year'=>'2024-2025','start_date'=>'2024-10-01','end_date'=>'2025-01-31','is_active'=>false,'type'=>'S5']);
        Semester::create(['name'=>'Semestre 6','year'=>'2024-2025','start_date'=>'2025-02-01','end_date'=>'2025-06-30','is_active'=>false,'type'=>'S6']);

        // ── 5. Cours, leçons, emplois du temps, annonces, bibliothèque ──
        $this->call([
            CourseSeeder::class,
            ScheduleSeeder::class,
            AnnouncementSeeder::class,
            LibrarySeeder::class,
        ]);
    }
}
