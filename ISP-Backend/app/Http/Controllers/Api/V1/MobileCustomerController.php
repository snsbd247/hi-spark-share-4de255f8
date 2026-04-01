<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\Customer;
use App\Models\CustomerLedger;
use Illuminate\Http\Request;

class MobileCustomerController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Customer::query();

        if ($s = $request->input('search')) {
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('customer_id', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('pppoe_username', 'like', "%{$s}%");
            });
        }
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }
        if ($area = $request->input('area')) {
            $query->where('area', $area);
        }
        if ($request->input('connection_status')) {
            $query->where('connection_status', $request->input('connection_status'));
        }

        $query->orderBy('created_at', 'desc');

        return $this->paginated($query, $request->input('per_page', 20));
    }

    public function show(string $id)
    {
        $customer = Customer::find($id);
        if (!$customer) return $this->notFound('Customer not found');
        return $this->success($customer);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'customer_id' => 'required|string|max:50|unique:customers,customer_id',
            'phone' => 'required|string|max:20',
            'area' => 'required|string|max:255',
            'monthly_bill' => 'required|numeric|min:0',
        ]);

        $customer = Customer::create($request->only(
            (new Customer)->getFillable()
        ));

        return $this->created($customer, 'Customer created');
    }

    public function update(string $id, Request $request)
    {
        $customer = Customer::find($id);
        if (!$customer) return $this->notFound('Customer not found');

        $customer->update($request->only(
            (new Customer)->getFillable()
        ));

        return $this->success($customer->fresh(), 'Customer updated');
    }

    public function ledger(string $id, Request $request)
    {
        $customer = Customer::find($id);
        if (!$customer) return $this->notFound('Customer not found');

        $query = CustomerLedger::where('customer_id', $id)->orderBy('date', 'desc');
        return $this->paginated($query, $request->input('per_page', 50), 'Ledger entries');
    }

    public function areas()
    {
        $areas = Customer::select('area')
            ->distinct()
            ->orderBy('area')
            ->pluck('area');

        return $this->success($areas, 'Area list');
    }

    public function stats()
    {
        $total = Customer::count();
        $active = Customer::where('connection_status', 'active')->count();
        $suspended = Customer::where('connection_status', 'suspended')->count();

        return $this->success([
            'total' => $total,
            'active' => $active,
            'suspended' => $suspended,
            'inactive' => $total - $active - $suspended,
        ], 'Customer stats');
    }
}
