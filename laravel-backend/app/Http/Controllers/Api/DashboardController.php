<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\MerchantPayment;
use App\Models\MikrotikRouter;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Transaction;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $currentMonth = now()->format('Y-m');
        $today = now()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();
        $monthEnd = now()->endOfMonth()->toDateString();

        // ── Customer Stats ──────────────────────────────
        $totalCustomers = Customer::count();
        $activeCustomers = Customer::where('status', 'active')->count();
        $suspendedCustomers = Customer::where('status', 'suspended')->count();
        $inactiveCustomers = Customer::where('status', 'inactive')->count();
        $onlineCustomers = Customer::where('connection_status', 'online')->count();
        $offlineCustomers = Customer::where('connection_status', 'offline')->count();

        // New customers this month
        $newCustomersMonth = Customer::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // ── Billing Stats ───────────────────────────────
        $totalBills = Bill::where('month', $currentMonth)->count();
        $paidBills = Bill::where('month', $currentMonth)->where('status', 'paid')->count();
        $unpaidBills = Bill::where('month', $currentMonth)->where('status', 'unpaid')->count();
        $overdueBills = Bill::where('month', $currentMonth)
            ->where('status', 'unpaid')
            ->where('due_date', '<', $today)
            ->count();

        $totalBilled = (float) Bill::where('month', $currentMonth)->sum('amount');
        $totalCollection = (float) Bill::where('month', $currentMonth)
            ->where('status', 'paid')
            ->sum('amount');
        $totalDue = (float) Bill::where('month', $currentMonth)
            ->where('status', 'unpaid')
            ->sum('amount');

        // ── Payment Stats ───────────────────────────────
        $todayCollection = (float) Payment::where('status', 'completed')
            ->whereDate('paid_at', $today)
            ->sum('amount');

        $monthCollection = (float) Payment::where('status', 'completed')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount');

        // Payment method breakdown
        $paymentByMethod = Payment::where('status', 'completed')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->selectRaw('payment_method, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('payment_method')
            ->get();

        // ── Merchant Payment Stats ──────────────────────
        $merchantTotal = (float) MerchantPayment::whereDate('payment_date', '>=', $monthStart)
            ->whereDate('payment_date', '<=', $monthEnd)
            ->sum('amount');
        $merchantMatched = (float) MerchantPayment::where('status', 'matched')
            ->whereDate('payment_date', '>=', $monthStart)
            ->whereDate('payment_date', '<=', $monthEnd)
            ->sum('amount');
        $merchantUnmatched = MerchantPayment::where('status', 'unmatched')
            ->count();

        // ── Router Stats ────────────────────────────────
        $totalRouters = MikrotikRouter::count();
        $activeRouters = MikrotikRouter::where('status', 'active')->count();

        // ── Sales & Purchase Stats ──────────────────────
        $totalSales = (float) Sale::whereBetween('sale_date', [$monthStart, $monthEnd])
            ->where('status', '!=', 'cancelled')
            ->sum('total');
        $totalPurchases = (float) Purchase::whereBetween('purchase_date', [$monthStart, $monthEnd])
            ->sum('total');
        $salesProfit = (float) SaleItem::whereHas('sale', function ($q) use ($monthStart, $monthEnd) {
            $q->whereBetween('sale_date', [$monthStart, $monthEnd])->where('status', '!=', 'cancelled');
        })->sum('profit');

        // ── Expense Stats ───────────────────────────────
        $totalExpenses = (float) Expense::where('status', 'approved')
            ->whereBetween('expense_date', [$monthStart, $monthEnd])
            ->sum('amount');

        // ── Low Stock ───────────────────────────────────
        $lowStockCount = Product::where('is_active', true)
            ->whereColumn('stock_quantity', '<=', 'low_stock_alert')
            ->count();

        // ── Collection Target ───────────────────────────
        $collectionTarget = $totalBilled > 0 ? round(($totalCollection / $totalBilled) * 100, 1) : 0;

        // ── Revenue Trend (last 6 months) ───────────────
        $revenueTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = now()->subMonths($i);
            $month = $m->format('Y-m');
            $label = $m->format('M Y');
            $collection = (float) Payment::where('status', 'completed')
                ->whereMonth('paid_at', $m->month)
                ->whereYear('paid_at', $m->year)
                ->sum('amount');
            $billed = (float) Bill::where('month', $month)->sum('amount');
            $revenueTrend[] = [
                'month' => $label,
                'collection' => $collection,
                'billed' => $billed,
            ];
        }

        return response()->json([
            // Customers
            'total_customers' => $totalCustomers,
            'active_customers' => $activeCustomers,
            'suspended_customers' => $suspendedCustomers,
            'inactive_customers' => $inactiveCustomers,
            'online_customers' => $onlineCustomers,
            'offline_customers' => $offlineCustomers,
            'new_customers_month' => $newCustomersMonth,

            // Billing
            'total_bills' => $totalBills,
            'paid_bills' => $paidBills,
            'unpaid_bills' => $unpaidBills,
            'overdue_bills' => $overdueBills,
            'total_billed' => $totalBilled,
            'total_collection' => $totalCollection,
            'total_due' => $totalDue,
            'collection_target' => $collectionTarget,

            // Payments
            'today_collection' => $todayCollection,
            'month_collection' => $monthCollection,
            'payment_by_method' => $paymentByMethod,

            // Merchant
            'merchant_total' => $merchantTotal,
            'merchant_matched' => $merchantMatched,
            'merchant_unmatched' => $merchantUnmatched,

            // Routers
            'total_routers' => $totalRouters,
            'active_routers' => $activeRouters,

            // Sales/Purchase/Expense
            'total_sales' => $totalSales,
            'total_purchases' => $totalPurchases,
            'sales_profit' => $salesProfit,
            'total_expenses' => $totalExpenses,
            'low_stock_count' => $lowStockCount,

            // Trend
            'revenue_trend' => $revenueTrend,
            'current_month' => $currentMonth,
        ]);
    }
}
