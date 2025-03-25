<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Http\Middleware\CorsMiddleware;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Register the CorsMiddleware globally
        $this->app['router']->aliasMiddleware('cors', CorsMiddleware::class);

        // Apply it to all routes
        $this->app['router']->pushMiddlewareToGroup('web', CorsMiddleware::class);
        $this->app['router']->pushMiddlewareToGroup('api', CorsMiddleware::class);
    }

    // other methods...
}
