<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class WhoisController extends Controller
{
    public function lookup(Request $request)
    {
        // Define validation rules
        $validator = Validator::make($request->all(), [
            'domain' => [
                'required',
                'string',
                'regex:/^(?!:\/\/)(?=.{1,253}$)(?:(?:[a-zA-Z0-9_](?:[a-zA-Z0-9-_]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})$/'
            ],
        ]);

        // Handle validation failure
        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid domain format.',
                'details' => $validator->errors()
            ], 422);
        }

        $domain = $request->query('domain');
        $apiKey = env('IP2WHOIS_API_KEY');

        try {
            $response = Http::get('https://api.ip2whois.com/v2', [
                'key' => $apiKey,
                'domain' => $domain,
            ]);

            if ($response->successful()) {
                return response()->json($response->json());
            } else {
                return response()->json(['error' => 'Failed to fetch WHOIS data'], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unexpected error: ' . $e->getMessage()], 500);
        }
    }
}
