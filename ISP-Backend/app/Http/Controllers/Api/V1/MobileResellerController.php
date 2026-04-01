<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\Customer;
use App\Models\Bill;
use App\Models\Payment;
use Illuminate\Http\Request;

class MobileResellerController extends Controller
{
    use ApiResponse;

    /**
     * Reseller dashboard — scoped to their assigned customers/areas
     */
    public function dashboard(Request $request)
    {
        $admin = $request->get('admin_user');

        // For now, resellers see overall stats (scope by area if field exists)
        $customers = Customer::count();
        $currentMonth = now()->format('Y-m');
        $billed = Bill::where('month', $currentMonth)->sum('amount');
        $collected = Bill::where('month', $currentMonth)->where('status', 'paid')->sum('amount');

        return $this->success([
            'total_customers' => $customers,
            'current_month' => $currentMonth,
            'billed' => $billed,
            'collected' => $collected,
            'due' => $billed - $collected,
        ], 'Reseller dashboard');
    }

    public function customers(Request $request)
    {
        $query = Customer::select('id', 'customer_id', 'name', 'phone', 'area', 'monthly_bill', 'connection_status')
            ->orderBy('name');

        if ($area = $request->input('area')) {
            $query->where('area', $area);
        }

        return $this->paginated($query, $request->input('per_page', 20));
    }

    public function collectPayment(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|uuid|exists:customers,id',
            'amount' => 'required|numeric|min:1',
            'bill_id' => 'nullable|uuid|exists:bills,id',
        ]);

        $payment = Payment::create([
            'customer_id' => $request->customer_id,
            'amount' => $request->amount,
            'payment_method' => 'cash',
            'bill_id' => $request->bill_id,
            'transaction_id' => 'R-' . now()->format('ymdHis'),
            'status' => 'completed',
        ]);

        // Mark bill paid if linked
        if ($request->bill_id) {
            Bill::where('id', $request->bill_id)->update([
                'status' => 'paid',
                'paid_date' => now()->toDateString(),
            ]);
        }

        return $this->created($payment, 'Payment collected');
    }
}
