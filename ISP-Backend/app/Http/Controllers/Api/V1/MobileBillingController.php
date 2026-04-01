<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\Bill;
use App\Models\Payment;
use App\Models\MerchantPayment;
use Illuminate\Http\Request;

class MobileBillingController extends Controller
{
    use ApiResponse;

    // ── Bills ────────────────────────────────────────────

    public function bills(Request $request)
    {
        $query = Bill::with('customer:id,name,customer_id,phone,area');

        if ($month = $request->input('month')) {
            $query->where('month', $month);
        }
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }
        if ($customerId = $request->input('customer_id')) {
            $query->where('customer_id', $customerId);
        }

        $query->orderBy('created_at', 'desc');
        return $this->paginated($query, $request->input('per_page', 20));
    }

    public function billShow(string $id)
    {
        $bill = Bill::with('customer:id,name,customer_id,phone,area,monthly_bill')->find($id);
        if (!$bill) return $this->notFound('Bill not found');
        return $this->success($bill);
    }

    public function billStore(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|uuid|exists:customers,id',
            'month' => 'required|string',
            'amount' => 'required|numeric|min:0',
        ]);

        $bill = Bill::create($request->only(['customer_id', 'month', 'amount', 'due_date', 'status']));
        return $this->created($bill, 'Bill created');
    }

    public function billUpdate(string $id, Request $request)
    {
        $bill = Bill::find($id);
        if (!$bill) return $this->notFound('Bill not found');
        $bill->update($request->only(['amount', 'status', 'due_date', 'paid_date']));
        return $this->success($bill->fresh(), 'Bill updated');
    }

    public function billGenerate(Request $request)
    {
        $request->validate(['month' => 'required|string']);

        $billing = app(\App\Services\BillingService::class);
        $result = $billing->generateMonthlyBills($request->month);

        return $this->success($result, 'Bills generated');
    }

    public function billSummary(Request $request)
    {
        $month = $request->input('month', now()->format('Y-m'));

        $total = Bill::where('month', $month)->sum('amount');
        $paid = Bill::where('month', $month)->where('status', 'paid')->sum('amount');
        $unpaid = Bill::where('month', $month)->where('status', 'unpaid')->sum('amount');
        $count = Bill::where('month', $month)->count();
        $paidCount = Bill::where('month', $month)->where('status', 'paid')->count();

        return $this->success([
            'month' => $month,
            'total_amount' => $total,
            'paid_amount' => $paid,
            'unpaid_amount' => $unpaid,
            'total_bills' => $count,
            'paid_bills' => $paidCount,
            'collection_rate' => $count > 0 ? round(($paidCount / $count) * 100, 1) : 0,
        ], 'Bill summary');
    }

    // ── Payments ─────────────────────────────────────────

    public function payments(Request $request)
    {
        $query = Payment::with('customer:id,name,customer_id,phone');

        if ($customerId = $request->input('customer_id')) {
            $query->where('customer_id', $customerId);
        }
        if ($method = $request->input('payment_method')) {
            $query->where('payment_method', $method);
        }

        $query->orderBy('created_at', 'desc');
        return $this->paginated($query, $request->input('per_page', 20));
    }

    public function paymentStore(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|uuid|exists:customers,id',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string',
        ]);

        $payment = Payment::create($request->only([
            'customer_id', 'amount', 'payment_method',
            'bill_id', 'transaction_id', 'month', 'status',
        ]));

        return $this->created($payment, 'Payment recorded');
    }

    // ── Merchant Payments ────────────────────────────────

    public function merchantPayments(Request $request)
    {
        $query = MerchantPayment::query();

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $query->orderBy('created_at', 'desc');
        return $this->paginated($query, $request->input('per_page', 20));
    }

    public function merchantMatch(string $id, Request $request)
    {
        $request->validate([
            'bill_id' => 'required|uuid|exists:bills,id',
            'customer_id' => 'required|uuid|exists:customers,id',
        ]);

        $mp = MerchantPayment::find($id);
        if (!$mp) return $this->notFound('Merchant payment not found');

        $mp->update([
            'matched_bill_id' => $request->bill_id,
            'matched_customer_id' => $request->customer_id,
            'status' => 'matched',
        ]);

        return $this->success($mp->fresh(), 'Payment matched');
    }
}
