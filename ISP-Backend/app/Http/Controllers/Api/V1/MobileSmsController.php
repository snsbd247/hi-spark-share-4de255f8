<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Services\SmsService;
use App\Models\SmsLog;
use Illuminate\Http\Request;

class MobileSmsController extends Controller
{
    use ApiResponse;

    public function send(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'message' => 'required|string|max:640',
        ]);

        try {
            $sms = app(SmsService::class);
            $result = $sms->send($request->phone, $request->message);
            return $this->success($result, 'SMS sent');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function sendBulk(Request $request)
    {
        $request->validate([
            'phones' => 'required|array|min:1',
            'phones.*' => 'string',
            'message' => 'required|string|max:640',
        ]);

        try {
            $sms = app(SmsService::class);
            $result = $sms->sendBulk($request->phones, $request->message);
            return $this->success($result, 'Bulk SMS sent');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function balance()
    {
        try {
            $sms = app(SmsService::class);
            $balance = $sms->checkBalance();
            return $this->success(['balance' => $balance], 'SMS balance');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function logs(Request $request)
    {
        $query = SmsLog::orderBy('created_at', 'desc');

        if ($phone = $request->input('phone')) {
            $query->where('recipients', 'like', "%{$phone}%");
        }

        return $this->paginated($query, $request->input('per_page', 20), 'SMS logs');
    }
}
