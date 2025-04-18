<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DnsPropagationController extends Controller
{
    protected $dnsServers = [
        ['ip' => '8.8.8.8', 'location' => 'US - Mountain View, California'],
        ['ip' => '9.9.9.9', 'location' => 'US - Berkeley, California'],
        ['ip' => '149.112.112.112', 'location' => 'US - San Francisco, California'],
        ['ip' => '4.2.2.3', 'location' => 'US - Dallas, Texas'],
        ['ip' => '1.0.0.19', 'location' => 'AU - Brisbane, Queensland'],
        ['ip' => '169.38.73.5', 'location' => 'IN - Chennai'],
        ['ip' => '177.47.128.2', 'location' => 'BR - Rio de Janeiro'],
        ['ip' => '195.186.1.111', 'location' => 'CH - Zurich'],
        ['ip' => '194.25.0.60', 'location' => 'DE - Stuttgart'],
        ['ip' => '210.0.255.216', 'location' => 'HK - Hong Kong'],
        ['ip' => '216.21.128.22', 'location' => 'CA - Vancouver'],
    ];

    public function check(Request $request)
    {
        $request->validate([
            'domain' => 'required|string',
            'type' => 'required|string|in:A,AAAA,CNAME,MX,NS,TXT,SOA,CAA'
        ]);

        $domain = $request->input('domain');
        $type = strtoupper($request->input('type'));
        $digPath = 'C:\\ProgramData\\chocolatey\\bin\\dig.exe';

        $results = [];

        foreach ($this->dnsServers as $server) {
            $cmd = "\"{$digPath}\" @{$server['ip']} {$domain} {$type} +short";
            $output = shell_exec($cmd);

            \Log::info("DIG Command", ['cmd' => $cmd, 'output' => $output]);

            $results[] = [
                'location' => $server['location'],
                'dns' => $server['ip'],
                'result' => $output ? trim($output) : null,
                'status' => $output ? 'success' : 'fail',
            ];
        }

        return response()->json($results);
    }

}