<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\Bill;
use App\Models\Payment;
use App\Models\SupportTicket;
use App\Models\TicketReply;
use Illuminate\Http\Request;

class MobileTenantPortalController extends Controller
{
    use ApiResponse;

    private function customerId(Request $request): string
    {
        return $request->get('customer_user')->id;
    }

    public function dashboard(Request $request)
    {
        $cid = $this->customerId($request);
        $customer = $request->get('customer_user');

        $unpaidBills = Bill::where('customer_id', $cid)->where('status', 'unpaid')->count();
        $totalDue = Bill::where('customer_id', $cid)->where('status', 'unpaid')->sum('amount');
        $lastPayment = Payment::where('customer_id', $cid)->orderBy('created_at', 'desc')->first();
        $openTickets = SupportTicket::where('customer_id', $cid)
            ->whereNotIn('status', ['closed', 'resolved'])->count();

        return $this->success([
            'customer' => [
                'name' => $customer->name,
                'customer_id' => $customer->customer_id,
                'connection_status' => $customer->connection_status,
                'monthly_bill' => $customer->monthly_bill,
                'photo_url' => $customer->photo_url,
            ],
            'unpaid_bills' => $unpaidBills,
            'total_due' => $totalDue,
            'last_payment' => $lastPayment,
            'open_tickets' => $openTickets,
        ], 'Portal dashboard');
    }

    public function bills(Request $request)
    {
        $query = Bill::where('customer_id', $this->customerId($request))
            ->orderBy('month', 'desc');
        return $this->paginated($query, $request->input('per_page', 12), 'Bills');
    }

    public function payments(Request $request)
    {
        $query = Payment::where('customer_id', $this->customerId($request))
            ->orderBy('created_at', 'desc');
        return $this->paginated($query, $request->input('per_page', 20), 'Payments');
    }

    public function tickets(Request $request)
    {
        $query = SupportTicket::where('customer_id', $this->customerId($request))
            ->orderBy('created_at', 'desc');
        return $this->paginated($query, $request->input('per_page', 20), 'Tickets');
    }

    public function createTicket(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
            'category' => 'nullable|string|max:50',
            'priority' => 'nullable|string|in:low,medium,high',
        ]);

        $customer = $request->get('customer_user');
        $ticket = SupportTicket::create([
            'customer_id' => $customer->id,
            'subject' => $request->subject,
            'message' => $request->message,
            'category' => $request->category ?? 'general',
            'priority' => $request->priority ?? 'medium',
            'sender_type' => 'customer',
            'sender_name' => $customer->name,
            'status' => 'open',
        ]);

        return $this->created($ticket, 'Ticket created');
    }

    public function ticketReply(string $id, Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $customer = $request->get('customer_user');
        $ticket = SupportTicket::where('customer_id', $customer->id)->find($id);
        if (!$ticket) return $this->notFound('Ticket not found');

        $reply = TicketReply::create([
            'ticket_id' => $ticket->id,
            'message' => $request->message,
            'sender_type' => 'customer',
            'sender_name' => $customer->name,
        ]);

        return $this->created($reply, 'Reply sent');
    }

    public function profile(Request $request)
    {
        $customer = $request->get('customer_user');
        return $this->success([
            'id' => $customer->id,
            'customer_id' => $customer->customer_id,
            'name' => $customer->name,
            'phone' => $customer->phone,
            'email' => $customer->email,
            'area' => $customer->area,
            'address' => trim("{$customer->house} {$customer->road} {$customer->village}"),
            'connection_status' => $customer->connection_status,
            'monthly_bill' => $customer->monthly_bill,
            'photo_url' => $customer->photo_url,
            'package_id' => $customer->package_id,
        ], 'Profile');
    }
}
