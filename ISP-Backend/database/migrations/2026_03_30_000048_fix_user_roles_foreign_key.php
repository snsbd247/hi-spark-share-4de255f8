<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Fix: user_roles foreign key may reference 'profiles' instead of 'users'
        if (Schema::hasTable('user_roles')) {
            // Drop old foreign key (try both possible names)
            Schema::table('user_roles', function (Blueprint $table) {
                // MySQL foreign key naming convention
                $possibleKeys = ['user_roles_user_id_foreign'];
                foreach ($possibleKeys as $key) {
                    try {
                        $table->dropForeign($key);
                    } catch (\Exception $e) {
                        // Already dropped or doesn't exist
                    }
                }
            });

            // Re-create foreign key pointing to 'users' table
            Schema::table('user_roles', function (Blueprint $table) {
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }

        // Also fix custom_roles foreign key if needed
        if (Schema::hasTable('user_roles') && Schema::hasTable('custom_roles')) {
            Schema::table('user_roles', function (Blueprint $table) {
                try {
                    $table->dropForeign('user_roles_custom_role_id_foreign');
                } catch (\Exception $e) {
                    // doesn't exist
                }
            });

            if (Schema::hasColumn('user_roles', 'custom_role_id')) {
                Schema::table('user_roles', function (Blueprint $table) {
                    $table->foreign('custom_role_id')->references('id')->on('custom_roles')->onDelete('set null');
                });
            }
        }
    }

    public function down(): void
    {
        // no-op
    }
};
