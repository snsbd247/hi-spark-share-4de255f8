<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SmsSetting;
use Illuminate\Support\Facades\Http;

class SmsBalanceController extends Controller
{
    public function check()
    {
        $settings = SmsSetting::first();

        if (!$settings || !$settings->api_url) {
            return response()->json(['balance' => null, 'error' => 'SMS not configured']);
        }

        try {
            $response = Http::get($settings->api_url, [
                'api_key'   => $settings->api_key,
                'action'    => 'balance',
                'type'      => 'sms',
            ]);

            return response()->json([
                'balance'  => $response->json('balance') ?? $response->body(),
                'provider' => $settings->provider ?? 'default',
            ]);
        } catch (\Exception $e) {
            return response()->json(['balance' => null, 'error' => $e->getMessage()]);
        }
    }
}
