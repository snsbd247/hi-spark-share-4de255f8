<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class FullBackupService
{
    /**
     * Create a full SQL backup of the entire database.
     * Supports both PostgreSQL and MySQL.
     */
    public function create(string $createdBy = 'system'): array
    {
        $driver = config('database.default');
        $isPostgres = in_array($driver, ['pgsql', 'pgsql_supabase']);

        $tables = $this->getAllTables();
        $timestamp = now()->toIso8601String();

        $sql = "-- Smart ISP Full Backup\n";
        $sql .= "-- Generated: {$timestamp}\n";
        $sql .= "-- Type: full\n";
        $sql .= "-- Driver: {$driver}\n";
        $sql .= "-- Tables: " . count($tables) . "\n\n";

        if (!$isPostgres) {
            $sql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";
        }

        $totalRows = 0;

        foreach ($tables as $table) {
            $result = $this->exportTable($table, $isPostgres);
            $sql .= $result['sql'];
            $totalRows += $result['rows'];
        }

        if (!$isPostgres) {
            $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";
        }

        $fileName = 'full_backup_' . now()->format('Ymd_Hi') . '.sql';
        $dir = storage_path('app/backups/full');
        if (!is_dir($dir)) mkdir($dir, 0755, true);

        $filePath = "{$dir}/{$fileName}";
        file_put_contents($filePath, $sql);
        $fileSize = filesize($filePath);

        // Log
        DB::table('backup_logs')->insert([
            'id' => Str::uuid()->toString(),
            'file_name' => $fileName,
            'file_size' => $fileSize,
            'backup_type' => 'full',
            'status' => 'completed',
            'created_by' => $createdBy,
            'created_at' => now(),
        ]);

        return [
            'file_name' => $fileName,
            'file_path' => "backups/full/{$fileName}",
            'size' => $fileSize,
            'total_rows' => $totalRows,
            'tables_count' => count($tables),
            'timestamp' => $timestamp,
        ];
    }

    /**
     * Restore from a full SQL backup file path.
     */
    public function restore(string $filePath): void
    {
        $fullPath = storage_path("app/{$filePath}");
        if (!file_exists($fullPath)) {
            throw new \Exception("Backup file not found: {$filePath}");
        }

        $sql = file_get_contents($fullPath);

        DB::beginTransaction();
        try {
            // Split into individual statements and execute
            $statements = $this->splitStatements($sql);
            foreach ($statements as $stmt) {
                $stmt = trim($stmt);
                if (empty($stmt) || str_starts_with($stmt, '--')) continue;
                DB::unprepared($stmt);
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception("Restore failed: " . $e->getMessage());
        }
    }

    /**
     * Verify backup file integrity.
     */
    public function verify(string $filePath): array
    {
        $fullPath = storage_path("app/{$filePath}");
        if (!file_exists($fullPath)) {
            return ['valid' => false, 'error' => 'File not found'];
        }

        $content = file_get_contents($fullPath);
        $hasHeader = str_contains($content, '-- Smart ISP');
        $hasInserts = str_contains($content, 'INSERT INTO');
        $size = filesize($fullPath);
        $lines = substr_count($content, "\n");

        // Count tables
        preg_match_all('/-- Table: (\S+)/', $content, $tableMatches);
        $tableCount = count($tableMatches[1] ?? []);

        return [
            'valid' => $hasHeader && $size > 100,
            'has_header' => $hasHeader,
            'has_data' => $hasInserts,
            'size' => $size,
            'lines' => $lines,
            'tables' => $tableCount,
        ];
    }

    /**
     * Delete a backup file.
     */
    public function deleteFile(string $filePath): bool
    {
        $fullPath = storage_path("app/{$filePath}");
        if (file_exists($fullPath)) {
            unlink($fullPath);
            return true;
        }
        return false;
    }

    private function exportTable(string $table, bool $isPostgres): array
    {
        $rows = DB::table($table)->get();
        if ($rows->isEmpty()) {
            return ['sql' => "-- Table: {$table} (0 rows)\n\n", 'rows' => 0];
        }

        $q = $isPostgres ? '"' : '`';
        $sql = "-- Table: {$table} ({$rows->count()} rows)\n";

        if ($isPostgres) {
            $sql .= "DELETE FROM {$q}{$table}{$q};\n";
        } else {
            $sql .= "TRUNCATE TABLE {$q}{$table}{$q};\n";
        }

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

        return ['sql' => $sql . "\n", 'rows' => $rows->count()];
    }

    private function splitStatements(string $sql): array
    {
        $lines = explode("\n", $sql);
        $statements = [];
        $current = '';

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (empty($trimmed) || str_starts_with($trimmed, '--')) continue;
            $current .= $line . "\n";
            if (str_ends_with($trimmed, ';')) {
                $statements[] = rtrim($current, "\n;") . ';';
                $current = '';
            }
        }

        if (trim($current)) {
            $statements[] = $current;
        }

        return $statements;
    }

    private function getAllTables(): array
    {
        $exclude = [
            'migrations', 'personal_access_tokens', 'password_reset_tokens',
            'failed_jobs', 'cache', 'cache_locks', 'sessions', 'jobs', 'job_batches',
        ];
        return array_values(array_diff(Schema::getTableListing(), $exclude));
    }
}
