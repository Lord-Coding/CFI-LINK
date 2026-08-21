<?php

return [

    'default' => env('BROADCAST_CONNECTION', 'reverb'),

    'connections' => [

        /*
        |--------------------------------------------------------------
        | Laravel Reverb — WebSocket natif (pas besoin de Pusher)
        |--------------------------------------------------------------
        */
        'reverb' => [
            'driver'   => 'reverb',
            'key'      => env('REVERB_APP_KEY', 'cfi-link-key'),
            'secret'   => env('REVERB_APP_SECRET', 'cfi-link-secret'),
            'app_id'   => env('REVERB_APP_ID', 'cfi-link'),
            'options'  => [
                'host'    => env('REVERB_HOST', '127.0.0.1'),
                'port'    => env('REVERB_PORT', 8080),
                'scheme'  => env('REVERB_SCHEME', 'http'),
                'useTLS'  => env('REVERB_SCHEME', 'http') === 'https',
            ],
            'client_options' => [],
        ],

        /*
        |--------------------------------------------------------------
        | Pusher (fallback optionnel)
        |--------------------------------------------------------------
        */
        'pusher' => [
            'driver'  => 'pusher',
            'key'     => env('PUSHER_APP_KEY'),
            'secret'  => env('PUSHER_APP_SECRET'),
            'app_id'  => env('PUSHER_APP_ID'),
            'options' => [
                'host'    => env('PUSHER_HOST') ?: 'api-'.env('PUSHER_APP_CLUSTER', 'mt1').'.pusher.com',
                'port'    => env('PUSHER_PORT', 443),
                'scheme'  => env('PUSHER_SCHEME', 'https'),
                'useTLS'  => true,
            ],
        ],

        'log'  => ['driver' => 'log'],
        'null' => ['driver' => 'null'],
    ],

];
