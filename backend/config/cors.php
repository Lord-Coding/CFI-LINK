<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',    // Vite dev
        'https://localhost:5173',   // Vite dev HTTPS
        'http://localhost:3000',
        'https://localhost:3000',
        'http://localhost',
        'capacitor://localhost',    // Capacitor iOS
        'http://localhost:8100',    // Ionic serve
        // Production : ajouter le domaine réel ci-dessous
        // 'https://cfi-ciras.org',
        // 'https://www.cfi-ciras.org',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
