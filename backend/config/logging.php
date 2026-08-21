<?php

use Monolog\Handler\NullHandler;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\SyslogUdpHandler;
use Monolog\Processor\PsrLogMessageProcessor;

return [

    /*
    |--------------------------------------------------------------------------
    | Default Log Channel
    |--------------------------------------------------------------------------
    | En développement : stack → single (fichier laravel.log)
    | En production    : stack → daily + slack (via LOG_STACK=daily,slack)
    |                    ou     stack → daily + sentry (si Sentry installé)
    */
    'default' => env('LOG_CHANNEL', 'stack'),

    'deprecations' => [
        'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),
        'trace'   => env('LOG_DEPRECATIONS_TRACE', false),
    ],

    'channels' => [

        /*
        |----------------------------------------------------------------------
        | Stack par défaut
        | Configurer LOG_STACK dans .env :
        |   dev  → single
        |   prod → daily,slack   ou   daily,sentry
        |----------------------------------------------------------------------
        */
        'stack' => [
            'driver'            => 'stack',
            'channels'          => explode(',', (string) env('LOG_STACK', 'single')),
            'ignore_exceptions' => false,
        ],

        /*
        |----------------------------------------------------------------------
        | Fichier unique (développement)
        |----------------------------------------------------------------------
        */
        'single' => [
            'driver'               => 'single',
            'path'                 => storage_path('logs/laravel.log'),
            'level'                => env('LOG_LEVEL', 'debug'),
            'replace_placeholders' => true,
        ],

        /*
        |----------------------------------------------------------------------
        | Rotation quotidienne — 30 jours (production recommandée)
        | LOG_STACK=daily
        |----------------------------------------------------------------------
        */
        'daily' => [
            'driver'               => 'daily',
            'path'                 => storage_path('logs/cfi-link.log'),
            'level'                => env('LOG_LEVEL', 'warning'),
            'days'                 => env('LOG_DAILY_DAYS', 30),
            'replace_placeholders' => true,
        ],

        /*
        |----------------------------------------------------------------------
        | Slack — alertes critiques en production
        | LOG_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
        | LOG_STACK=daily,slack
        |----------------------------------------------------------------------
        */
        'slack' => [
            'driver'               => 'slack',
            'url'                  => env('LOG_SLACK_WEBHOOK_URL'),
            'username'             => env('LOG_SLACK_USERNAME', 'CFI-LINK Prod'),
            'emoji'                => ':red_circle:',
            'level'                => env('LOG_SLACK_LEVEL', 'critical'),
            'replace_placeholders' => true,
        ],

        /*
        |----------------------------------------------------------------------
        | Sentry — suivi des erreurs en production (optionnel)
        | Installation : composer require sentry/sentry-laravel
        | Puis : php artisan sentry:publish
        | LOG_STACK=daily,sentry  +  SENTRY_LARAVEL_DSN=https://...
        |----------------------------------------------------------------------
        */
        'sentry' => [
            'driver' => 'sentry',
            'level'  => env('LOG_SENTRY_LEVEL', 'error'),
            // Driver "sentry" activé seulement si le package sentry/sentry-laravel est installé
        ],

        /*
        |----------------------------------------------------------------------
        | Canal structuré JSON — pour les agrégateurs (Datadog, Logtail, etc.)
        | LOG_STACK=json_file
        |----------------------------------------------------------------------
        */
        'json_file' => [
            'driver'    => 'monolog',
            'level'     => env('LOG_LEVEL', 'warning'),
            'handler'   => StreamHandler::class,
            'formatter' => Monolog\Formatter\JsonFormatter::class,
            'handler_with' => [
                'stream' => storage_path('logs/cfi-link-json.log'),
            ],
            'processors' => [PsrLogMessageProcessor::class],
        ],

        /*
        |----------------------------------------------------------------------
        | Stderr — Docker / conteneurs (stdout/stderr → système de logs)
        |----------------------------------------------------------------------
        */
        'stderr' => [
            'driver'    => 'monolog',
            'level'     => env('LOG_LEVEL', 'debug'),
            'handler'   => StreamHandler::class,
            'handler_with' => ['stream' => 'php://stderr'],
            'formatter' => env('LOG_STDERR_FORMATTER'),
            'processors' => [PsrLogMessageProcessor::class],
        ],

        'syslog'    => ['driver' => 'syslog',   'level' => env('LOG_LEVEL', 'debug'), 'facility' => env('LOG_SYSLOG_FACILITY', LOG_USER), 'replace_placeholders' => true],
        'errorlog'  => ['driver' => 'errorlog', 'level' => env('LOG_LEVEL', 'debug'), 'replace_placeholders' => true],
        'null'      => ['driver' => 'monolog',  'handler' => NullHandler::class],
        'emergency' => ['path'   => storage_path('logs/laravel.log')],

    ],

];
