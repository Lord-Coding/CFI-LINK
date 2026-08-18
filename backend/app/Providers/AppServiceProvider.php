<?php

namespace App\Providers;

use App\Models\User;
use App\Policies\UserPolicy;
use App\Services\AuditService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Injection du Request dans AuditService pour capturer l'IP
        $this->app->scoped(AuditService::class, function ($app) {
            return new AuditService($app->make(Request::class));
        });

        $this->app->scoped(NotificationService::class, fn() => new NotificationService());
    }

    public function boot(): void
    {
        // Policies
        Gate::policy(User::class, UserPolicy::class);

        // Super admin passe tous les gates
        Gate::before(function (User $user) {
            if ($user->role === 'super_admin') {
                return true;
            }
        });
    }
}
