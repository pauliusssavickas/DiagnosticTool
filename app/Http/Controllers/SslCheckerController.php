<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SslCheckerController extends Controller
{

    public function check(Request $request)
    {
        $domain = $request->query('domain');
        if (! $domain || ! filter_var($domain, FILTER_VALIDATE_DOMAIN, FILTER_FLAG_HOSTNAME)) {
            return response()->json(['error' => 'Invalid domain'], 400);
        }

        try {
            
            $response = Http::get("https://ssl-checker.io/api/v1/check/{$domain}");

            if (! $response->successful()) {
                return response()->json([
                    'error' => 'SSL API request failed',
                ], $response->status());
            }

            $data = $response->json();

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred: ' . $e->getMessage(),
            ], 500);
        }
    }
}
