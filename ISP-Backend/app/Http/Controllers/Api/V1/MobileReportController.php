<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\Bill;
use App\Models\Payment;
use App\Models\Customer;
use App\Models\Expense;
use Illuminate\Http\Request;

class MobileReportController extends Controller
{
    use ApiResponse;

    public function dashboard()
    {
        $currentMonth = now()->format('Y-m');
        $totalCustomers = Customer::count();
        $activeCustomers = Customer::where('connection_status', 'active')->count();

        $totalBilled = Bill::where('month', $currentMonth)->sum('amount');
        $totalCollected = Bill::where('month', $currentMonth)->where('status', 'paid')->sum('amount');
        $totalExpense = Expense::whereMonth('date', now()->month)
            ->whereYear('date', now()->year)->sum('amount');

        $recentPayments = Payment::with('customer:id,name,customer_id')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return $this->success([
            'total_customers' => $totalCustomers,
            'active_customers' => $activeCustomers,
            'current_month' => $currentMonth,
            'total_billed' => $totalBilled,
            'total_collected' => $totalCollected,
            'total_expense' => $totalExpense,
            'net_income' => $totalCollected - $totalExpense,
            'collection_rate' => $totalBilled > 0
                ? round(($totalCollected / $totalBilled) * 100, 1) : 0,
            'recent_payments' => $recentPayments,
        ], 'Dashboard data');
    }

    public function monthly(Request $request)
    {
        $months = [];
        for ($i = 0; $i < 6; $i++) {
            $month = now()->subMonths($i)->format('Y-m');
            $billed = Bill::where('month', $month)->sum('amount');
            $collected = Bill::where('month', $month)->where('status', 'paid')->sum('amount');
            $months[] = [
                'month' => $month,
                'billed' => $billed,
                'collected' => $collected,
                'rate' => $billed > 0 ? round(($collected / $billed) * 100, 1) : 0,
            ];
        }

        return $this->success($months, 'Monthly report');
    }

    public function collectionSummary(Request $request)
    {
        $month = $request->input('month', now()->format('Y-m'));

        $byMethod = Payment::selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
            ->whereRaw("DATE_FORMAT(created_at, '%Y-%m') = ?", [$month])
            ->groupBy('payment_method')
            ->get();

        return $this->success([
            'month' => $month,
            'by_method' => $byMethod,
        ], 'Collection summary');
    }
}
