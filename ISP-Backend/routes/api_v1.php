<?php

use App\Http\Controllers\Api\V1\MobileAuthController;
use App\Http\Controllers\Api\V1\MobileCustomerController;
use App\Http\Controllers\Api\V1\MobileBillingController;
use App\Http\Controllers\Api\V1\MobileReportController;
use App\Http\Controllers\Api\V1\MobileSmsController;
use App\Http\Controllers\Api\V1\MobileTenantPortalController;
use App\Http\Controllers\Api\V1\MobileResellerController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Mobile API v1 Routes
|--------------------------------------------------------------------------
| Prefix: /api/v1
| These routes are separate from the web admin API and designed for
| Flutter/mobile app consumption with standardized JSON responses.
|--------------------------------------------------------------------------
*/

// ── Health ───────────────────────────────────────────────────
Route::get('/health', fn() => response()->json([
    'success' => true,
    'message' => 'API v1 operational',
    'data' => [
        'version' => '1.0.0',
        'timestamp' => now()->toIso8601String(),
    ],
]));

// ══════════════════════════════════════════════════════════════
// ─── PUBLIC AUTH ROUTES ──────────────────────────────────────
// ══════════════════════════════════════════════════════════════
Route::prefix('admin')->group(function () {
    Route::post('/login', [MobileAuthController::class, 'adminLogin'])
        ->middleware('throttle:10,1');
});

Route::prefix('tenant')->group(function () {
    Route::post('/login', [MobileAuthController::class, 'tenantLogin'])
        ->middleware('throttle:10,1');
});

// ══════════════════════════════════════════════════════════════
// ─── ADMIN PROTECTED ROUTES (/api/v1/admin/*) ───────────────
// ══════════════════════════════════════════════════════════════
Route::prefix('admin')->middleware(['admin.auth', 'check.subscription'])->group(function () {

    // Auth
    Route::post('/logout', [MobileAuthController::class, 'adminLogout']);
    Route::get('/me', [MobileAuthController::class, 'adminMe']);
    Route::post('/refresh', [MobileAuthController::class, 'refreshToken']);

    // Dashboard & Reports
    Route::get('/dashboard', [MobileReportController::class, 'dashboard']);
    Route::get('/reports/monthly', [MobileReportController::class, 'monthly']);
    Route::get('/reports/collection', [MobileReportController::class, 'collectionSummary']);

    // Customers
    Route::get('/customers', [MobileCustomerController::class, 'index']);
    Route::get('/customers/stats', [MobileCustomerController::class, 'stats']);
    Route::get('/customers/areas', [MobileCustomerController::class, 'areas']);
    Route::get('/customers/{id}', [MobileCustomerController::class, 'show']);
    Route::post('/customers', [MobileCustomerController::class, 'store']);
    Route::put('/customers/{id}', [MobileCustomerController::class, 'update']);
    Route::get('/customers/{id}/ledger', [MobileCustomerController::class, 'ledger']);

    // Bills
    Route::get('/bills', [MobileBillingController::class, 'bills']);
    Route::get('/bills/summary', [MobileBillingController::class, 'billSummary']);
    Route::get('/bills/{id}', [MobileBillingController::class, 'billShow']);
    Route::post('/bills', [MobileBillingController::class, 'billStore']);
    Route::put('/bills/{id}', [MobileBillingController::class, 'billUpdate']);
    Route::post('/bills/generate', [MobileBillingController::class, 'billGenerate']);

    // Payments
    Route::get('/payments', [MobileBillingController::class, 'payments']);
    Route::post('/payments', [MobileBillingController::class, 'paymentStore']);

    // Merchant Payments
    Route::get('/merchant-payments', [MobileBillingController::class, 'merchantPayments']);
    Route::post('/merchant-payments/{id}/match', [MobileBillingController::class, 'merchantMatch']);

    // SMS
    Route::post('/sms/send', [MobileSmsController::class, 'send']);
    Route::post('/sms/send-bulk', [MobileSmsController::class, 'sendBulk']);
    Route::get('/sms/balance', [MobileSmsController::class, 'balance']);
    Route::get('/sms/logs', [MobileSmsController::class, 'logs']);
});

// ══════════════════════════════════════════════════════════════
// ─── TENANT/CUSTOMER PORTAL ROUTES (/api/v1/tenant/*) ───────
// ══════════════════════════════════════════════════════════════
Route::prefix('tenant')->middleware('customer.auth')->group(function () {

    Route::post('/logout', [MobileAuthController::class, 'tenantLogout']);
    Route::get('/dashboard', [MobileTenantPortalController::class, 'dashboard']);
    Route::get('/bills', [MobileTenantPortalController::class, 'bills']);
    Route::get('/payments', [MobileTenantPortalController::class, 'payments']);
    Route::get('/tickets', [MobileTenantPortalController::class, 'tickets']);
    Route::post('/tickets', [MobileTenantPortalController::class, 'createTicket']);
    Route::post('/tickets/{id}/reply', [MobileTenantPortalController::class, 'ticketReply']);
    Route::get('/profile', [MobileTenantPortalController::class, 'profile']);
});

// ══════════════════════════════════════════════════════════════
// ─── RESELLER ROUTES (/api/v1/reseller/*) ────────────────────
// ══════════════════════════════════════════════════════════════
Route::prefix('reseller')->middleware(['admin.auth', 'check.subscription'])->group(function () {

    Route::get('/dashboard', [MobileResellerController::class, 'dashboard']);
    Route::get('/customers', [MobileResellerController::class, 'customers']);
    Route::post('/collect-payment', [MobileResellerController::class, 'collectPayment']);
});
