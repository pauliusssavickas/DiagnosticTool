<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PortCheckController extends Controller
{
    public function check(Request $request)
    {
        // 1. Validate IP & ports
        $request->validate([
            'ip'    => ['required', 'string',
                'regex:/^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}'
                      . '(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/'
            ],
            'ports' => 'required|array',
            'ports.*' => 'integer|min:1|max:65535',
        ]);

        $ip    = $request->input('ip');
        $ports = $request->input('ports');
        $results = [];

        // 2. Loop over each port and call portchecker.io
        foreach ($ports as $port) {
            try {
                $resp = Http::get("https://portchecker.io/api/{$ip}/{$port}");
                // portchecker.io returns plain "true" or "false"
                $body     = trim(strtolower((string)$resp->body()));
                $isOpen   = $body === 'true';
                $results[$port] = $isOpen;
            } catch (\Exception $e) {
                // On error, mark closed
                $results[$port] = false;
            }
        }

        // 3. Return JSON
        return response()->json([
            'ip'      => $ip,
            'results' => $results,
        ]);
    }
}
