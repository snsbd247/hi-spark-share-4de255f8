<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // ── SaaS Plans ──────────────────────────────────────
        if (!Schema::hasTable('saas_plans')) {
            Schema::create('saas_plans', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('name');                       // Basic, Pro, Enterprise
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->decimal('price_monthly', 10, 2)->default(0);
                $table->decimal('price_yearly', 10, 2)->default(0);
                $table->integer('max_customers')->default(100);
                $table->integer('max_users')->default(5);
                $table->integer('max_routers')->default(2);
                $table->boolean('has_accounting')->default(false);
                $table->boolean('has_hr')->default(false);
                $table->boolean('has_inventory')->default(false);
                $table->boolean('has_sms')->default(true);
                $table->boolean('has_custom_domain')->default(false);
                $table->json('features')->nullable();          // extra feature flags
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // ── Subscriptions ───────────────────────────────────
        if (!Schema::hasTable('subscriptions')) {
            Schema::create('subscriptions', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('tenant_id')->index();
                $table->uuid('plan_id')->index();
                $table->string('billing_cycle')->default('monthly'); // monthly, yearly
                $table->date('start_date');
                $table->date('end_date');
                $table->string('status')->default('active'); // active, expired, suspended, cancelled
                $table->decimal('amount', 10, 2)->default(0);
                $table->string('payment_method')->nullable();
                $table->string('transaction_id')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();

                $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
                $table->foreign('plan_id')->references('id')->on('saas_plans')->onDelete('restrict');
            });
        }

        // ── Super Admin table (separate from tenant users) ──
        if (!Schema::hasTable('super_admins')) {
            Schema::create('super_admins', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('name');
                $table->string('email')->unique();
                $table->string('username')->unique();
                $table->string('password_hash');
                $table->string('status')->default('active');
                $table->integer('failed_attempts')->default(0);
                $table->timestamp('locked_until')->nullable();
                $table->string('two_factor_secret')->nullable();  // 2FA ready
                $table->boolean('two_factor_enabled')->default(false);
                $table->timestamp('last_login_at')->nullable();
                $table->string('last_login_ip')->nullable();
                $table->timestamps();
            });
        }

        // ── Super Admin Sessions ────────────────────────────
        if (!Schema::hasTable('super_admin_sessions')) {
            Schema::create('super_admin_sessions', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('super_admin_id')->index();
                $table->string('session_token')->unique();
                $table->string('ip_address')->default('');
                $table->string('browser')->default('');
                $table->string('status')->default('active');
                $table->timestamps();

                $table->foreign('super_admin_id')->references('id')->on('super_admins')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('super_admin_sessions');
        Schema::dropIfExists('super_admins');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('saas_plans');
    }
};
