<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('sms_settings')) {
            Schema::table('sms_settings', function (Blueprint $table) {
                if (!Schema::hasColumn('sms_settings', 'created_at')) {
                    $table->timestamp('created_at')->nullable();
                }
                if (!Schema::hasColumn('sms_settings', 'updated_at')) {
                    $table->timestamp('updated_at')->nullable();
                }
                if (!Schema::hasColumn('sms_settings', 'sms_on_reminder')) {
                    $table->boolean('sms_on_reminder')->default(false);
                }
            });
        }

        foreach (['geo_divisions', 'geo_districts', 'geo_upazilas'] as $geoTable) {
            if (Schema::hasTable($geoTable) && !Schema::hasColumn($geoTable, 'updated_at')) {
                Schema::table($geoTable, function (Blueprint $table) {
                    $table->timestamp('updated_at')->nullable();
                });
            }
        }

        if (Schema::hasTable('purchases')) {
            Schema::table('purchases', function (Blueprint $table) {
                if (!Schema::hasColumn('purchases', 'purchase_no')) {
                    $table->string('purchase_no')->nullable();
                }
                if (!Schema::hasColumn('purchases', 'supplier_id')) {
                    $table->uuid('supplier_id')->nullable();
                }
                if (!Schema::hasColumn('purchases', 'date')) {
                    $table->date('date')->nullable();
                }
                if (!Schema::hasColumn('purchases', 'total_amount')) {
                    $table->decimal('total_amount', 12, 2)->default(0);
                }
            });

            try {
                DB::statement('ALTER TABLE purchases MODIFY vendor_id CHAR(36) NULL');
            } catch (\Throwable $e) {
                // keep migration non-fatal for hosts that already have compatible schema
            }

            DB::statement('UPDATE purchases SET purchase_no = purchase_number WHERE purchase_no IS NULL AND purchase_number IS NOT NULL');
            DB::statement('UPDATE purchases SET date = purchase_date WHERE date IS NULL AND purchase_date IS NOT NULL');
            DB::statement('UPDATE purchases SET total_amount = COALESCE(total_amount, total, subtotal, 0)');
        }

        if (Schema::hasTable('sales')) {
            Schema::table('sales', function (Blueprint $table) {
                if (!Schema::hasColumn('sales', 'sale_no')) {
                    $table->string('sale_no')->nullable();
                }
                if (!Schema::hasColumn('sales', 'due_amount')) {
                    $table->decimal('due_amount', 12, 2)->default(0);
                }
            });

            DB::statement('UPDATE sales SET sale_no = invoice_number WHERE sale_no IS NULL AND invoice_number IS NOT NULL');
            DB::statement('UPDATE sales SET due_amount = GREATEST(COALESCE(total,0) - COALESCE(paid_amount,0), 0)');
        }

        if (Schema::hasTable('expenses')) {
            Schema::table('expenses', function (Blueprint $table) {
                if (!Schema::hasColumn('expenses', 'date')) {
                    $table->date('date')->nullable();
                }
            });

            DB::statement('UPDATE expenses SET date = expense_date WHERE date IS NULL AND expense_date IS NOT NULL');
        }

        if (Schema::hasTable('daily_reports')) {
            Schema::table('daily_reports', function (Blueprint $table) {
                if (!Schema::hasColumn('daily_reports', 'date')) {
                    $table->date('date')->nullable();
                }
                if (!Schema::hasColumn('daily_reports', 'total_billed')) {
                    $table->decimal('total_billed', 14, 2)->default(0);
                }
                if (!Schema::hasColumn('daily_reports', 'total_collection')) {
                    $table->decimal('total_collection', 14, 2)->default(0);
                }
                if (!Schema::hasColumn('daily_reports', 'notes')) {
                    $table->text('notes')->nullable();
                }
            });

            DB::statement('UPDATE daily_reports SET date = report_date WHERE date IS NULL AND report_date IS NOT NULL');
            DB::statement('UPDATE daily_reports SET total_billed = COALESCE(total_billed, total_income, 0)');
            DB::statement('UPDATE daily_reports SET total_collection = COALESCE(total_collection, billing_income, 0)');
        }
    }

    public function down(): void
    {
        // no-op: repair migration should not rollback production data structures.
    }
};
