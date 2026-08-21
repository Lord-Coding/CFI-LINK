<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $owona   = User::where('email', 'owona@cfi-ciras.org')->first();
        $mbarga  = User::where('email', 'mbarga@cfi-ciras.org')->first();

        $courses = [
            // LIC L1
            ['id_ext'=>'lic-l1-1','name'=>"Introduction à l'informatique",       'filiere'=>'LIC','annee'=>'L1','hours'=>40,'semester'=>'S1','teacher_id'=>$owona?->id, 'description'=>"Bases de l'informatique, systèmes d'exploitation et logiciels."],
            ['id_ext'=>'lic-l1-2','name'=>'Algorithmique & Programmation C',      'filiere'=>'LIC','annee'=>'L1','hours'=>50,'semester'=>'S1','teacher_id'=>$mbarga?->id,'description'=>'Algorithmes fondamentaux et programmation en langage C.'],
            ['id_ext'=>'lic-l1-3','name'=>"Mathématiques pour l'informatique",    'filiere'=>'LIC','annee'=>'L1','hours'=>45,'semester'=>'S1'],
            ['id_ext'=>'lic-l1-4','name'=>'Anglais technique',                    'filiere'=>'LIC','annee'=>'L1','hours'=>25,'semester'=>'S1'],
            ['id_ext'=>'lic-l1-5','name'=>'Architecture des ordinateurs',         'filiere'=>'LIC','annee'=>'L1','hours'=>35,'semester'=>'S2'],
            ['id_ext'=>'lic-l1-6','name'=>'Programmation Web (HTML/CSS)',          'filiere'=>'LIC','annee'=>'L1','hours'=>35,'semester'=>'S2'],
            ['id_ext'=>'lic-l1-7','name'=>'Statistiques & Probabilités',           'filiere'=>'LIC','annee'=>'L1','hours'=>30,'semester'=>'S2'],
            // LIC L2
            ['id_ext'=>'lic-l2-1','name'=>'Algorithmique avancée',                'filiere'=>'LIC','annee'=>'L2','hours'=>45,'semester'=>'S3','teacher_id'=>$mbarga?->id,'description'=>'Structures de données avancées, complexité algorithmique et programmation dynamique.'],
            ['id_ext'=>'lic-l2-2','name'=>'Base de données',                      'filiere'=>'LIC','annee'=>'L2','hours'=>40,'semester'=>'S3','description'=>'Modélisation, SQL avancé, normalisation et administration de bases de données.'],
            ['id_ext'=>'lic-l2-3','name'=>'Réseaux informatiques',                'filiere'=>'LIC','annee'=>'L2','hours'=>50,'semester'=>'S3'],
            ['id_ext'=>'lic-l2-4','name'=>'Programmation Orientée Objet (Java)',  'filiere'=>'LIC','annee'=>'L2','hours'=>45,'semester'=>'S3','teacher_id'=>$owona?->id],
            ['id_ext'=>'lic-l2-5','name'=>"Systèmes d'exploitation",              'filiere'=>'LIC','annee'=>'L2','hours'=>40,'semester'=>'S4'],
            ['id_ext'=>'lic-l2-6','name'=>'Programmation Web (JS/PHP)',            'filiere'=>'LIC','annee'=>'L2','hours'=>40,'semester'=>'S4'],
            ['id_ext'=>'lic-l2-7','name'=>'Analyse numérique',                    'filiere'=>'LIC','annee'=>'L2','hours'=>30,'semester'=>'S4'],
            // LIC L3 GL
            ['id_ext'=>'lic-l3-gl-1','name'=>'Génie Logiciel',                   'filiere'=>'LIC','annee'=>'L3','option_lic'=>'GL','hours'=>60,'semester'=>'S5'],
            ['id_ext'=>'lic-l3-gl-2','name'=>'Conception UML & Design Patterns', 'filiere'=>'LIC','annee'=>'L3','option_lic'=>'GL','hours'=>45,'semester'=>'S5','teacher_id'=>$owona?->id],
            ['id_ext'=>'lic-l3-gl-3','name'=>'Développement Mobile',             'filiere'=>'LIC','annee'=>'L3','option_lic'=>'GL','hours'=>40,'semester'=>'S6'],
            ['id_ext'=>'lic-l3-gl-4','name'=>'Tests & Qualité logicielle',        'filiere'=>'LIC','annee'=>'L3','option_lic'=>'GL','hours'=>35,'semester'=>'S6'],
            ['id_ext'=>'lic-l3-gl-5','name'=>"Projet de fin d'études (GL)",      'filiere'=>'LIC','annee'=>'L3','option_lic'=>'GL','hours'=>80,'semester'=>'S6'],
            // LIC L3 SR
            ['id_ext'=>'lic-l3-sr-1','name'=>'Administration système',            'filiere'=>'LIC','annee'=>'L3','option_lic'=>'SR','hours'=>55,'semester'=>'S5','teacher_id'=>$owona?->id],
            ['id_ext'=>'lic-l3-sr-2','name'=>'Sécurité des réseaux',              'filiere'=>'LIC','annee'=>'L3','option_lic'=>'SR','hours'=>50,'semester'=>'S5'],
            ['id_ext'=>'lic-l3-sr-3','name'=>'Cloud & Virtualisation',            'filiere'=>'LIC','annee'=>'L3','option_lic'=>'SR','hours'=>40,'semester'=>'S6','teacher_id'=>$owona?->id],
            ['id_ext'=>'lic-l3-sr-4','name'=>'Télécommunications',               'filiere'=>'LIC','annee'=>'L3','option_lic'=>'SR','hours'=>45,'semester'=>'S6'],
            ['id_ext'=>'lic-l3-sr-5','name'=>"Projet de fin d'études (SR)",      'filiere'=>'LIC','annee'=>'L3','option_lic'=>'SR','hours'=>80,'semester'=>'S6'],
            // LIC L3 partagé
            ['id_ext'=>'lic-l3-s-1','name'=>'Intelligence Artificielle',          'filiere'=>'LIC','annee'=>'L3','hours'=>40,'semester'=>'S5'],
            ['id_ext'=>'lic-l3-s-2','name'=>'Droit du numérique',                 'filiere'=>'LIC','annee'=>'L3','hours'=>25,'semester'=>'S6'],
            // LAP L1
            ['id_ext'=>'lap-l1-1','name'=>'Droit administratif',                  'filiere'=>'LAP','annee'=>'L1','hours'=>40,'semester'=>'S1','description'=>"Principes du droit administratif, actes administratifs et contentieux."],
            ['id_ext'=>'lap-l1-2','name'=>'Introduction au management',           'filiere'=>'LAP','annee'=>'L1','hours'=>35,'semester'=>'S1'],
            ['id_ext'=>'lap-l1-3','name'=>'Économie générale',                    'filiere'=>'LAP','annee'=>'L1','hours'=>30,'semester'=>'S1'],
            ['id_ext'=>'lap-l1-4','name'=>'Anglais administratif',                'filiere'=>'LAP','annee'=>'L1','hours'=>25,'semester'=>'S2'],
            ['id_ext'=>'lap-l1-5','name'=>'Sociologie des organisations',          'filiere'=>'LAP','annee'=>'L1','hours'=>30,'semester'=>'S2'],
            // LAP L2
            ['id_ext'=>'lap-l2-1','name'=>'Gestion des organisations',            'filiere'=>'LAP','annee'=>'L2','hours'=>35,'semester'=>'S3'],
            ['id_ext'=>'lap-l2-2','name'=>'Comptabilité publique',                'filiere'=>'LAP','annee'=>'L2','hours'=>40,'semester'=>'S3'],
            ['id_ext'=>'lap-l2-3','name'=>'Droit constitutionnel',                'filiere'=>'LAP','annee'=>'L2','hours'=>35,'semester'=>'S3'],
            ['id_ext'=>'lap-l2-4','name'=>'Gestion des ressources humaines',      'filiere'=>'LAP','annee'=>'L2','hours'=>30,'semester'=>'S4'],
            ['id_ext'=>'lap-l2-5','name'=>'Finances publiques',                   'filiere'=>'LAP','annee'=>'L2','hours'=>35,'semester'=>'S4'],
            // LAP L3
            ['id_ext'=>'lap-l3-1','name'=>'Administration publique',              'filiere'=>'LAP','annee'=>'L3','hours'=>45,'semester'=>'S5'],
            ['id_ext'=>'lap-l3-2','name'=>'Politique économique',                 'filiere'=>'LAP','annee'=>'L3','hours'=>40,'semester'=>'S5'],
            ['id_ext'=>'lap-l3-3','name'=>'Droit des marchés publics',            'filiere'=>'LAP','annee'=>'L3','hours'=>35,'semester'=>'S6'],
            ['id_ext'=>'lap-l3-4','name'=>'Management stratégique',               'filiere'=>'LAP','annee'=>'L3','hours'=>40,'semester'=>'S6'],
            ['id_ext'=>'lap-l3-5','name'=>"Projet de fin d'études (LAP)",         'filiere'=>'LAP','annee'=>'L3','hours'=>80,'semester'=>'S6'],
        ];

        $courseMap = [];
        foreach ($courses as $data) {
            $ext = $data['id_ext'];
            unset($data['id_ext']);
            $course = Course::create($data);
            $courseMap[$ext] = $course->id;
        }

        // ── Leçons ──────────────────────────────────────────────
        $lessons = [
            // Algorithmique avancée (lic-l2-1)
            ['course_ext'=>'lic-l2-1','title'=>"Introduction aux structures avancées",     'type'=>'video',   'duration'=>'45 min','locked'=>false,'order'=>1],
            ['course_ext'=>'lic-l2-1','title'=>"Supports de cours — Chapitre 1",           'type'=>'document','duration'=>'15 min','locked'=>false,'order'=>2],
            ['course_ext'=>'lic-l2-1','title'=>"Arbres binaires de recherche",              'type'=>'video',   'duration'=>'50 min','locked'=>false,'order'=>3],
            ['course_ext'=>'lic-l2-1','title'=>"Quiz — Arbres & Graphes",                  'type'=>'quiz',    'duration'=>'20 min','locked'=>false,'order'=>4,
             'quiz_data'=>json_encode([
                ['id'=>'q1','question'=>"Quelle est la complexité d'un BFS ?",'options'=>['O(n)','O(n log n)','O(V+E)','O(n²)'],'correctIndex'=>2],
                ['id'=>'q2','question'=>'Algorithme pour le plus court chemin ?','options'=>['DFS','BFS','Dijkstra','Bubble Sort'],'correctIndex'=>2],
                ['id'=>'q3','question'=>'Structure LIFO ?','options'=>['File','Pile','Liste','Arbre'],'correctIndex'=>1],
             ])],
            ['course_ext'=>'lic-l2-1','title'=>"Graphes : parcours & plus courts chemins", 'type'=>'video',   'duration'=>'55 min','locked'=>false,'order'=>5],
            ['course_ext'=>'lic-l2-1','title'=>"Tables de hachage",                        'type'=>'video',   'duration'=>'40 min','locked'=>false,'order'=>6],
            ['course_ext'=>'lic-l2-1','title'=>"Programmation dynamique",                  'type'=>'video',   'duration'=>'60 min','locked'=>false,'order'=>7],
            ['course_ext'=>'lic-l2-1','title'=>"Quiz — Programmation dynamique",           'type'=>'quiz',    'duration'=>'25 min','locked'=>false,'order'=>8,
             'quiz_data'=>json_encode([
                ['id'=>'q4','question'=>'La programmation dynamique résout des problèmes à...','options'=>['Structure linéaire','Sous-problèmes chevauchants','Problèmes indépendants','Graphes uniquement'],'correctIndex'=>1],
             ])],
            ['course_ext'=>'lic-l2-1','title'=>"Algorithmes de tri avancés",               'type'=>'video',   'duration'=>'50 min','locked'=>false,'order'=>9],
            ['course_ext'=>'lic-l2-1','title'=>"Complexité NP",                            'type'=>'video',   'duration'=>'55 min','locked'=>true, 'order'=>10],
            ['course_ext'=>'lic-l2-1','title'=>"Examen final — Algorithmique",             'type'=>'exam',    'duration'=>'2h',    'locked'=>true, 'order'=>11],
            // Base de données (lic-l2-2)
            ['course_ext'=>'lic-l2-2','title'=>"Modèle relationnel",         'type'=>'video',   'duration'=>'40 min','locked'=>false,'order'=>1],
            ['course_ext'=>'lic-l2-2','title'=>"SQL — Les fondamentaux",     'type'=>'video',   'duration'=>'50 min','locked'=>false,'order'=>2],
            ['course_ext'=>'lic-l2-2','title'=>"Quiz — SQL Basics",          'type'=>'quiz',    'duration'=>'15 min','locked'=>false,'order'=>3,
             'quiz_data'=>json_encode([
                ['id'=>'q5','question'=>'Que fait SELECT * ?','options'=>['Sélectionne tout','Crée une table','Supprime des données','Rien'],'correctIndex'=>0],
             ])],
            ['course_ext'=>'lic-l2-2','title'=>"Jointures et sous-requêtes", 'type'=>'video',   'duration'=>'45 min','locked'=>false,'order'=>4],
            ['course_ext'=>'lic-l2-2','title'=>"Normalisation (1NF-3NF)",    'type'=>'video',   'duration'=>'55 min','locked'=>false,'order'=>5],
            ['course_ext'=>'lic-l2-2','title'=>"Supports — Normalisation",   'type'=>'document','duration'=>'20 min','locked'=>false,'order'=>6],
            ['course_ext'=>'lic-l2-2','title'=>"Examen final — BDD",         'type'=>'exam',    'duration'=>'2h',    'locked'=>true, 'order'=>7],
            // Droit administratif (lap-l1-1)
            ['course_ext'=>'lap-l1-1','title'=>"Introduction au droit administratif", 'type'=>'video','duration'=>'35 min','locked'=>false,'order'=>1],
            ['course_ext'=>'lap-l1-1','title'=>"L'organisation administrative",       'type'=>'video','duration'=>'45 min','locked'=>false,'order'=>2],
            ['course_ext'=>'lap-l1-1','title'=>"Les actes administratifs",            'type'=>'video','duration'=>'50 min','locked'=>false,'order'=>3],
            ['course_ext'=>'lap-l1-1','title'=>"Quiz — Actes administratifs",         'type'=>'quiz', 'duration'=>'15 min','locked'=>false,'order'=>4,
             'quiz_data'=>json_encode([
                ['id'=>'q6','question'=>'Un acte administratif unilatéral est ?','options'=>['Une décision','Un contrat','Une loi','Un traité'],'correctIndex'=>0],
             ])],
            ['course_ext'=>'lap-l1-1','title'=>"Le service public",                   'type'=>'video','duration'=>'40 min','locked'=>false,'order'=>5],
            ['course_ext'=>'lap-l1-1','title'=>"Le contentieux administratif",        'type'=>'video','duration'=>'55 min','locked'=>false,'order'=>6],
            ['course_ext'=>'lap-l1-1','title'=>"Examen final — Droit admin",          'type'=>'exam', 'duration'=>'2h',    'locked'=>true, 'order'=>7],
        ];

        foreach ($lessons as $l) {
            $ext = $l['course_ext'];
            unset($l['course_ext']);
            if (isset($courseMap[$ext])) {
                Lesson::create(array_merge($l, ['course_id' => $courseMap[$ext]]));
            }
        }
    }
}
