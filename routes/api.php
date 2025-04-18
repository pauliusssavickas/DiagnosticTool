<?php

use App\Http\Controllers\WhoisController;
use App\Http\Controllers\DnsPropagationController;
use App\Http\Controllers\GeoIPController;
use App\Http\Controllers\PortCheckController;
use App\Http\Controllers\SslCheckerController;

Route::get('/whois', [WhoisController::class, 'lookup']);
Route::get('/dns-propagation', [DnsPropagationController::class, 'check']);
Route::get('/geoip', [GeoIPController::class, 'lookup']);
Route::post('/portcheck', [PortCheckController::class, 'check']);
Route::get('/ssl-check', [SslCheckerController::class, 'check']);