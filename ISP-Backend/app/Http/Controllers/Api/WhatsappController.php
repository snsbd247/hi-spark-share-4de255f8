<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WhatsappService;
use Illuminate\Http\Request;

class WhatsappController extends Controller
{
    public function __construct(protected WhatsappService $whatsappService) {}

    public function send(Request $request)
    {
        $request->validate([
            'to'          => 'required|string',
            'message'     => 'required|string|max:4096',
            'customer_id' => 'nullable|uuid',
            'bill_id'     => 'nullable|uuid',
        ]);

        $result = $this->whatsappService->send(
            $request->to,
            $request->message,
            $request->customer_id,
            $request->bill_id
        );

        return response()->json($result);
    }

    public function sendBulk(Request $request)
    {
        $request->validate([
            'phones'  => 'required|array|min:1',
            'phones.*'=> 'string',
            'message' => 'required|string|max:4096',
        ]);

        $results = [];
        foreach ($request->phones as $phone) {
            $results[] = $this->whatsappService->send($phone, $request->message);
        }

        return response()->json([
            'success' => true,
            'sent'    => count(array_filter($results, fn($r) => $r['success'] ?? false)),
            'total'   => count($results),
        ]);
    }
}
