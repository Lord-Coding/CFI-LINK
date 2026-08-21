<?php

namespace Database\Seeders;

use App\Models\LibraryItem;
use App\Models\User;
use Illuminate\Database\Seeder;

class LibrarySeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@cfi-ciras.org')->first();

        $items = [
            ['title'=>'Algorithmes et structures de données','author'=>'Thomas H. Cormen et al.','category'=>'book','filiere'=>'LIC','description'=>"L'ouvrage de référence sur les algorithmes. Indispensable pour LIC L2 et L3.",'file_type'=>'pdf','size'=>'15 MB'],
            ['title'=>'Introduction aux bases de données','author'=>'Ramez Elmasri','category'=>'book','filiere'=>'LIC','description'=>"Concepts fondamentaux des bases de données relationnelles et SQL.",'file_type'=>'pdf','size'=>'12 MB'],
            ['title'=>'Réseaux et Télécommunications','author'=>'Andrew S. Tanenbaum','category'=>'book','filiere'=>'LIC','description'=>"Référence sur les architectures réseau, protocoles TCP/IP et sécurité.",'file_type'=>'pdf','size'=>'18 MB'],
            ['title'=>'Droit administratif camerounais','author'=>'Pr. Momo Claude','category'=>'book','filiere'=>'LAP','description'=>"Ouvrage fondamental sur le droit administratif appliqué au contexte camerounais.",'file_type'=>'pdf','size'=>'8 MB'],
            ['title'=>'Gestion des organisations publiques','author'=>'Dr. Fouda Michel','category'=>'manual','filiere'=>'LAP','description'=>"Manuel de gestion adapté aux organisations du secteur public africain.",'file_type'=>'pdf','size'=>'6 MB'],
            ['title'=>"Impact de l'IA sur l'enseignement en Afrique",'author'=>'Nkoulou Jean','category'=>'thesis','filiere'=>'LIC','description'=>"Mémoire de master sur les opportunités et défis de l'IA dans l'éducation africaine.",'file_type'=>'pdf','size'=>'4 MB'],
            ['title'=>'Guide de rédaction administrative','author'=>'Administration CFI-CIRAS','category'=>'guide','filiere'=>null,'description'=>"Guide pratique pour la rédaction des documents administratifs officiels.",'file_type'=>'doc','size'=>'2 MB'],
            ['title'=>'Sécurité informatique : principes et pratiques','author'=>'William Stallings','category'=>'book','filiere'=>'LIC','description'=>"Cryptographie, sécurité réseau, protection des systèmes d'information.",'file_type'=>'pdf','size'=>'10 MB'],
            ['title'=>'Introduction aux finances publiques','author'=>'M. Biya Robert','category'=>'manual','filiere'=>'LAP','description'=>"Budget de l'État, comptabilité publique et gestion des fonds publics.",'file_type'=>'pdf','size'=>'5 MB'],
            ['title'=>"Développement mobile avec Ionic",'author'=>'Josh Morony','category'=>'guide','filiere'=>'LIC','description'=>"Guide complet pour créer des applications mobiles cross-platform avec Ionic et Angular.",'file_type'=>'pdf','size'=>'7 MB'],
            ['title'=>'Méthodes de recherche en sciences sociales','author'=>'Quivy & Van Campenhoudt','category'=>'book','filiere'=>null,'description'=>"Manuel de méthodologie de recherche applicable à tous les domaines de sciences sociales.",'file_type'=>'pdf','size'=>'9 MB'],
            ['title'=>"Digitalisation de l'administration publique au Cameroun",'author'=>'Atangana Martin','category'=>'article','filiere'=>'LAP','description'=>"Article scientifique sur les enjeux de la transformation numérique dans l'administration camerounaise.",'file_type'=>'pdf','size'=>'1 MB'],
        ];

        foreach ($items as $item) {
            LibraryItem::create(array_merge($item, ['added_by' => $admin?->id, 'downloads' => rand(0, 50)]));
        }
    }
}
