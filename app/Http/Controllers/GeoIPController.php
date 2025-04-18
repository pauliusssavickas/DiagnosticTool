<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GeoIPController extends Controller
{
    public function lookup(Request $request)
{
    $request->validate([
        'ip' => [
            'required',
            'string',
            'regex:/^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/'
        ]
    ]);

    $ip = $request->input('ip');
    $apiKey = env('IP2WHOIS_API_KEY');

    try {
        $response = Http::get("https://api.ip2location.io/", [
            'key' => $apiKey,
            'ip' => $ip
        ]);

        if ($response->successful()) {
            return response()->json($response->json());
        }

        return response()->json([
            'error' => 'Failed to retrieve IP geolocation info',
            'details' => $response->body()
        ], $response->status());
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Internal server error',
            'message' => $e->getMessage()
        ], 500);
    }
}

}
