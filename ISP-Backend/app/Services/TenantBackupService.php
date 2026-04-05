<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class TenantBackupService
{
    /**
     * Tables that contain tenant-scoped data (have tenant_id column).
     */
    private function getTenantTables(): array
    {
        $allTables = Schema::getTableListing();
        $tenantTables = [];

        foreach ($allTables as $table) {
            if (Schema::hasColumn($table, 'tenant_id')) {
                $tenantTables[] = $table;
            }
        }

        return $tenantTables;
    }

    /**
     * Create a tenant-specific SQL backup.
     */
    public function create(string $tenantId, string $createdBy = 'system'): array
    {
        $tenant = DB::table('tenants')->where('id', $tenantId)->first();
        if (!$tenant) {
            throw new \Exception("Tenant not found: {$tenantId}");
        }

        $driver = config('database.default');
        $isPostgres = in_array($driver, ['pgsql', 'pgsql_supabase']);
        $q = $isPostgres ? '"' : '`';

        $tables = $this->getTenantTables();
        $timestamp = now()->toIso8601String();

        $sql = "-- Smart ISP Tenant Backup\n";
        $sql .= "-- Tenant: {$tenant->name} ({$tenantId})\n";
        $sql .= "-- Generated: {$timestamp}\n";
        $sql .= "-- Type: tenant\n";
        $sql .= "-- Driver: {$driver}\n\n";

        if (!$isPostgres) {
            $sql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";
        }

        $totalRows = 0;

        foreach ($tables as $table) {
            $rows = DB::table($table)->where('tenant_id', $tenantId)->get();
            if ($rows->isEmpty()) continue;

            $totalRows += $rows->count();
            $sql .= "-- Table: {$table} ({$rows->count()} rows)\n";
            $sql .= "DELETE FROM {$q}{$table}{$q} WHERE {$q}tenant_id{$q} = '{$tenantId}';\n";

            foreach ($rows as $row) {
                $data = (array) $row;
                $cols = implode("{$q}, {$q}", array_keys($data));
                $vals = implode(', ', array_map(function ($v) use ($isPostgres) {
                    if ($v === null) return 'NULL';
                    if (is_bool($v)) return $v ? 'TRUE' : 'FALSE';
                    $escaped = $isPostgres
                        ? str_replace("'", "''", (string) $v)
                        : addslashes((string) $v);
                    return "'" . $escaped . "'";
                }, array_values($data)));
                $sql .= "INSERT INTO {$q}{$table}{$q} ({$q}{$cols}{$q}) VALUES ({$vals});\n";
            }
            $sql .= "\n";
        }

        if (!$isPostgres) {
            $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";
        }

        $dir = storage_path("app/backups/tenants/{$tenantId}");
        if (!is_dir($dir)) mkdir($dir, 0755, true);

        $fileName = "tenant_{$tenantId}_backup_" . now()->format('Ymd_Hi') . '.sql';
        $filePath = "{$dir}/{$fileName}";
        file_put_contents($filePath, $sql);
        $fileSize = filesize($filePath);

        DB::table('backup_logs')->insert([
            'id' => Str::uuid()->toString(),
            'file_name' => $fileName,
            'file_size' => $fileSize,
            'backup_type' => 'tenant',
            'status' => 'completed',
            'created_by' => $createdBy,
            'created_at' => now(),
        ]);

        return [
            'file_name' => $fileName,
            'file_path' => "backups/tenants/{$tenantId}/{$fileName}",
            'size' => $fileSize,
            'total_rows' => $totalRows,
            'tenant_name' => $tenant->name,
            'timestamp' => $timestamp,
        ];
    }

    /**
     * Restore a tenant backup.
     */
    public function restore(string $tenantId, string $filePath): void
    {
        $fullPath = storage_path("app/{$filePath}");
        if (!file_exists($fullPath)) {
            throw new \Exception("Backup file not found: {$filePath}");
        }

        $sql = file_get_contents($fullPath);

        // Validate this is actually for the correct tenant
        if (!str_contains($sql, $tenantId)) {
            throw new \Exception("Backup file does not belong to tenant: {$tenantId}");
        }

        DB::beginTransaction();
        try {
            $lines = explode("\n", $sql);
            foreach ($lines as $line) {
                $trimmed = trim($line);
                if (empty($trimmed) || str_starts_with($trimmed, '--')) continue;
                if (str_starts_with($trimmed, 'SET ')) continue; // skip MySQL-only SET commands on PG
                DB::unprepared($trimmed);
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception("Tenant restore failed: " . $e->getMessage());
        }
    }
}
