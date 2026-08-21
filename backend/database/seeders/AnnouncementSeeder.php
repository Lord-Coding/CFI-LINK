<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@cfi-ciras.org')->first();
        $dir   = User::where('email', 'directeur@cfi-ciras.org')->first();

        Announcement::create([
            'title'       => 'Bienvenue sur CFI-LINK !',
            'content'     => "La plateforme académique du CFI-CIRAS est désormais en ligne. Consultez vos cours, notes, présences et communiquez avec vos professeurs directement depuis cette interface.",
            'author_id'   => $admin?->id,
            'priority'    => 'normal',
            'target_role' => 'all',
            'pinned'      => true,
        ]);

        Announcement::create([
            'title'       => 'Début des cours — Semestre 1 2024/2025',
            'content'     => "Les cours du premier semestre débutent le 1er octobre 2024. Consultez votre emploi du temps sur la plateforme. Toute absence non justifiée dans les 48h sera comptabilisée.",
            'author_id'   => $dir?->id,
            'priority'    => 'important',
            'target_role' => 'all',
            'pinned'      => true,
        ]);

        Announcement::create([
            'title'       => 'Rappel : Paiement de la scolarité',
            'content'     => "Le paiement des frais de scolarité du mois d'octobre est dû avant le 15 octobre 2024. Tout retard entraînera un blocage temporaire de l'accès à la plateforme. Contactez le service comptabilité pour tout arrangement.",
            'author_id'   => $dir?->id,
            'priority'    => 'urgent',
            'target_role' => 'etudiant_concours',
            'pinned'      => false,
        ]);

        Announcement::create([
            'title'       => 'Réunion pédagogique — Corps enseignant',
            'content'     => "Une réunion pédagogique se tiendra le vendredi 4 octobre 2024 à 14h00 en salle de conférence. Présence obligatoire pour tous les enseignants. Ordre du jour : organisation du semestre, modalités d'évaluation.",
            'author_id'   => $dir?->id,
            'priority'    => 'normal',
            'target_role' => 'professeur',
            'pinned'      => false,
        ]);
    }
}
