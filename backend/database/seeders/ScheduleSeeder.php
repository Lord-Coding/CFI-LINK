<?php

namespace Database\Seeders;

use App\Models\ScheduleEntry;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $entries = [
            // ── LIC L1 ──
            ['day'=>'Lundi',    'hour'=>'07:30','subject'=>"Intro Informatique",      'room'=>'A101','teacher'=>'Dr. Owona',   'filiere'=>'LIC','annee'=>'L1','color'=>'bg-primary/10 border-primary/30 text-primary'],
            ['day'=>'Lundi',    'hour'=>'10:00','subject'=>'Algo & Prog C',            'room'=>'A102','teacher'=>'Prof. Mbarga','filiere'=>'LIC','annee'=>'L1','color'=>'bg-success/10 border-success/30 text-success'],
            ['day'=>'Mardi',    'hour'=>'07:30','subject'=>'Maths Informatique',       'room'=>'A103','teacher'=>'Dr. Talla',   'filiere'=>'LIC','annee'=>'L1','color'=>'bg-warning/10 border-warning/30 text-warning'],
            ['day'=>'Mardi',    'hour'=>'10:00','subject'=>'Anglais technique',        'room'=>'A104','teacher'=>'Mme. Fotso',  'filiere'=>'LIC','annee'=>'L1','color'=>'bg-info/10 border-info/30 text-info'],
            ['day'=>'Mercredi', 'hour'=>'07:30','subject'=>'Architecture ordinateurs', 'room'=>'A101','teacher'=>'Prof. Essomba','filiere'=>'LIC','annee'=>'L1','color'=>'bg-primary/10 border-primary/30 text-primary'],
            ['day'=>'Jeudi',    'hour'=>'07:30','subject'=>'Prog Web HTML/CSS',        'room'=>'Labo','teacher'=>'M. Tabi',     'filiere'=>'LIC','annee'=>'L1','color'=>'bg-success/10 border-success/30 text-success'],
            ['day'=>'Vendredi', 'hour'=>'07:30','subject'=>'Stats & Probas',           'room'=>'A102','teacher'=>'Dr. Fouda',   'filiere'=>'LIC','annee'=>'L1','color'=>'bg-warning/10 border-warning/30 text-warning'],
            // ── LIC L2 ──
            ['day'=>'Lundi',    'hour'=>'07:30','subject'=>'Algo avancée',             'room'=>'B201','teacher'=>'Prof. Mbarga','filiere'=>'LIC','annee'=>'L2','color'=>'bg-primary/10 border-primary/30 text-primary'],
            ['day'=>'Lundi',    'hour'=>'10:00','subject'=>'Base de données',          'room'=>'Labo','teacher'=>'Dr. Nkoulou', 'filiere'=>'LIC','annee'=>'L2','color'=>'bg-success/10 border-success/30 text-success'],
            ['day'=>'Mardi',    'hour'=>'07:30','subject'=>'Réseaux informatiques',    'room'=>'B202','teacher'=>'Prof. Essomba','filiere'=>'LIC','annee'=>'L2','color'=>'bg-warning/10 border-warning/30 text-warning'],
            ['day'=>'Mardi',    'hour'=>'10:00','subject'=>'POO Java',                 'room'=>'Labo','teacher'=>'Dr. Owona',   'filiere'=>'LIC','annee'=>'L2','color'=>'bg-info/10 border-info/30 text-info'],
            ['day'=>'Mercredi', 'hour'=>'07:30','subject'=>"Systèmes d'exploitation", 'room'=>'B201','teacher'=>'Prof. Manga',  'filiere'=>'LIC','annee'=>'L2','color'=>'bg-primary/10 border-primary/30 text-primary'],
            ['day'=>'Jeudi',    'hour'=>'07:30','subject'=>'Prog Web JS/PHP',          'room'=>'Labo','teacher'=>'M. Tabi',     'filiere'=>'LIC','annee'=>'L2','color'=>'bg-success/10 border-success/30 text-success'],
            ['day'=>'Vendredi', 'hour'=>'07:30','subject'=>'Analyse numérique',        'room'=>'B202','teacher'=>'Dr. Talla',   'filiere'=>'LIC','annee'=>'L2','color'=>'bg-warning/10 border-warning/30 text-warning'],
            // ── LIC L3 GL ──
            ['day'=>'Lundi',    'hour'=>'07:30','subject'=>'Génie Logiciel',           'room'=>'C301','teacher'=>'Prof. Manga',  'filiere'=>'LIC','annee'=>'L3','option_lic'=>'GL','color'=>'bg-primary/10 border-primary/30 text-primary'],
            ['day'=>'Mardi',    'hour'=>'07:30','subject'=>'Conception UML',           'room'=>'C302','teacher'=>'Dr. Owona',   'filiere'=>'LIC','annee'=>'L3','option_lic'=>'GL','color'=>'bg-success/10 border-success/30 text-success'],
            ['day'=>'Mercredi', 'hour'=>'07:30','subject'=>'Dev Mobile',               'room'=>'Labo','teacher'=>'M. Tabi',     'filiere'=>'LIC','annee'=>'L3','option_lic'=>'GL','color'=>'bg-warning/10 border-warning/30 text-warning'],
            ['day'=>'Jeudi',    'hour'=>'07:30','subject'=>'Tests & Qualité',          'room'=>'C301','teacher'=>'Prof. Manga',  'filiere'=>'LIC','annee'=>'L3','option_lic'=>'GL','color'=>'bg-info/10 border-info/30 text-info'],
            ['day'=>'Vendredi', 'hour'=>'07:30','subject'=>'IA',                       'room'=>'C302','teacher'=>'Dr. Nkoulou', 'filiere'=>'LIC','annee'=>'L3','option_lic'=>'GL','color'=>'bg-primary/10 border-primary/30 text-primary'],
            // ── LIC L3 SR ──
            ['day'=>'Lundi',    'hour'=>'07:30','subject'=>'Admin système',            'room'=>'C303','teacher'=>'Dr. Owona',   'filiere'=>'LIC','annee'=>'L3','option_lic'=>'SR','color'=>'bg-primary/10 border-primary/30 text-primary'],
            ['day'=>'Mardi',    'hour'=>'07:30','subject'=>'Sécurité réseaux',         'room'=>'C304','teacher'=>'Prof. Essomba','filiere'=>'LIC','annee'=>'L3','option_lic'=>'SR','color'=>'bg-success/10 border-success/30 text-success'],
            ['day'=>'Mercredi', 'hour'=>'07:30','subject'=>'Cloud & Virtualisation',   'room'=>'C303','teacher'=>'Dr. Owona',   'filiere'=>'LIC','annee'=>'L3','option_lic'=>'SR','color'=>'bg-warning/10 border-warning/30 text-warning'],
            ['day'=>'Jeudi',    'hour'=>'07:30','subject'=>'Télécoms',                 'room'=>'C304','teacher'=>'Prof. Essomba','filiere'=>'LIC','annee'=>'L3','option_lic'=>'SR','color'=>'bg-info/10 border-info/30 text-info'],
            // ── LAP L1 ──
            ['day'=>'Lundi',    'hour'=>'07:30','subject'=>'Droit administratif',      'room'=>'D101','teacher'=>'Me. Atangana','filiere'=>'LAP','annee'=>'L1','color'=>'bg-primary/10 border-primary/30 text-primary'],
            ['day'=>'Lundi',    'hour'=>'10:00','subject'=>'Intro management',         'room'=>'D102','teacher'=>'Dr. Fouda',   'filiere'=>'LAP','annee'=>'L1','color'=>'bg-success/10 border-success/30 text-success'],
            ['day'=>'Mardi',    'hour'=>'07:30','subject'=>'Économie générale',        'room'=>'D101','teacher'=>'M. Biya',     'filiere'=>'LAP','annee'=>'L1','color'=>'bg-warning/10 border-warning/30 text-warning'],
            ['day'=>'Mercredi', 'hour'=>'07:30','subject'=>'Anglais administratif',    'room'=>'D103','teacher'=>'Mme. Fotso',  'filiere'=>'LAP','annee'=>'L1','color'=>'bg-info/10 border-info/30 text-info'],
            ['day'=>'Jeudi',    'hour'=>'07:30','subject'=>'Sociologie organisations', 'room'=>'D102','teacher'=>'Dr. Fouda',   'filiere'=>'LAP','annee'=>'L1','color'=>'bg-primary/10 border-primary/30 text-primary'],
            // ── LAP L2 ──
            ['day'=>'Lundi',    'hour'=>'07:30','subject'=>'Gestion organisations',    'room'=>'D201','teacher'=>'Dr. Fouda',   'filiere'=>'LAP','annee'=>'L2','color'=>'bg-primary/10 border-primary/30 text-primary'],
            ['day'=>'Mardi',    'hour'=>'07:30','subject'=>'Comptabilité publique',    'room'=>'D202','teacher'=>'M. Biya',     'filiere'=>'LAP','annee'=>'L2','color'=>'bg-success/10 border-success/30 text-success'],
            ['day'=>'Mercredi', 'hour'=>'07:30','subject'=>'Droit constitutionnel',    'room'=>'D201','teacher'=>'Me. Atangana','filiere'=>'LAP','annee'=>'L2','color'=>'bg-warning/10 border-warning/30 text-warning'],
            ['day'=>'Jeudi',    'hour'=>'07:30','subject'=>'GRH',                      'room'=>'D202','teacher'=>'Dr. Fouda',   'filiere'=>'LAP','annee'=>'L2','color'=>'bg-info/10 border-info/30 text-info'],
            ['day'=>'Vendredi', 'hour'=>'07:30','subject'=>'Finances publiques',       'room'=>'D203','teacher'=>'M. Biya',     'filiere'=>'LAP','annee'=>'L2','color'=>'bg-primary/10 border-primary/30 text-primary'],
            // ── LAP L3 ──
            ['day'=>'Lundi',    'hour'=>'07:30','subject'=>'Administration publique',  'room'=>'D301','teacher'=>'Me. Atangana','filiere'=>'LAP','annee'=>'L3','color'=>'bg-primary/10 border-primary/30 text-primary'],
            ['day'=>'Mardi',    'hour'=>'07:30','subject'=>'Politique économique',     'room'=>'D302','teacher'=>'M. Biya',     'filiere'=>'LAP','annee'=>'L3','color'=>'bg-success/10 border-success/30 text-success'],
            ['day'=>'Mercredi', 'hour'=>'07:30','subject'=>'Droit marchés publics',   'room'=>'D301','teacher'=>'Me. Atangana','filiere'=>'LAP','annee'=>'L3','color'=>'bg-warning/10 border-warning/30 text-warning'],
            ['day'=>'Jeudi',    'hour'=>'07:30','subject'=>'Management stratégique',   'room'=>'D302','teacher'=>'Dr. Fouda',   'filiere'=>'LAP','annee'=>'L3','color'=>'bg-info/10 border-info/30 text-info'],
        ];

        foreach ($entries as $e) {
            ScheduleEntry::create($e);
        }
    }
}
