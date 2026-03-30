<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class BackupRestoreController extends Controller
{
    public function handle(Request $request)
    {
        $action = $request->input('action', 'create');

        return match ($action) {
            'create' => $this->createBackup($request),
            'create_sql' => $this->createSqlBackup($request),
            'restore' => $this->restoreBackup($request),
            'restore_sql' => $this->restoreSqlBackup($request),
            'delete' => $this->deleteBackup($request),
            'manual_cleanup' => $this->cleanupBackups($request),
            'compare' => $this->compareBackup($request),
            default => response()->json(['error' => 'Invalid action'], 400),
        };
    }

    private function createBackup(Request $request)
    {
        $tables = $this->getAllTables();
        $backupData = ['tables' => []];

        foreach ($tables as $table) {
            $backupData['tables'][$table] = DB::table($table)->get()->toArray();
        }

        $fileName = 'backup_' . now()->format('Y-m-d_His') . '.json';
        $filePath = storage_path("app/backups/{$fileName}");

        if (!is_dir(dirname($filePath))) {
            mkdir(dirname($filePath), 0755, true);
        }

        file_put_contents($filePath, json_encode($backupData, JSON_PRETTY_PRINT));

        // Log backup
        DB::table('backup_logs')->insert([
            'id' => Str::uuid()->toString(),
            'file_name' => $fileName,
            'file_size' => filesize($filePath),
            'backup_type' => 'json',
            'status' => 'completed',
            'created_by' => $request->get('admin_user')?->id ?? 'system',
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'file_name' => $fileName,
            'size' => filesize($filePath),
        ]);
    }

    private function createSqlBackup(Request $request)
    {
        $tables = $this->getAllTables();
        $sql = "-- Smart ISP Backup\n-- Generated: " . now()->toIso8601String() . "\n\n";

        foreach ($tables as $table) {
            $rows = DB::table($table)->get();
            if ($rows->isEmpty()) continue;

            foreach ($rows as $row) {
                $cols = implode('`, `', array_keys((array) $row));
                $vals = implode(', ', array_map(fn($v) => $v === null ? 'NULL' : "'" . addslashes($v) . "'", array_values((array) $row)));
                $sql .= "INSERT INTO `{$table}` (`{$cols}`) VALUES ({$vals});\n";
            }
            $sql .= "\n";
        }

        $fileName = 'backup_' . now()->format('Y-m-d_His') . '.sql';
        $filePath = storage_path("app/backups/{$fileName}");

        if (!is_dir(dirname($filePath))) {
            mkdir(dirname($filePath), 0755, true);
        }

        file_put_contents($filePath, $sql);

        DB::table('backup_logs')->insert([
            'id' => Str::uuid()->toString(),
            'file_name' => $fileName,
            'file_size' => filesize($filePath),
            'backup_type' => 'sql',
            'status' => 'completed',
            'created_by' => $request->get('admin_user')?->id ?? 'system',
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'file_name' => $fileName,
            'size' => filesize($filePath),
        ]);
    }

    private function restoreBackup(Request $request)
    {
        $backupData = $request->input('backup_data');
        if (!$backupData || !isset($backupData['tables'])) {
            return response()->json(['error' => 'Invalid backup data'], 400);
        }

        DB::beginTransaction();
        try {
            foreach ($backupData['tables'] as $table => $rows) {
                if (!Schema::hasTable($table)) continue;
                DB::table($table)->truncate();
                foreach (array_chunk($rows, 100) as $chunk) {
                    DB::table($table)->insert(array_map(fn($r) => (array) $r, $chunk));
                }
            }
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Backup restored successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Restore failed: ' . $e->getMessage()], 500);
        }
    }

    private function restoreSqlBackup(Request $request)
    {
        $sqlContent = $request->input('sql_content');
        if (!$sqlContent) {
            return response()->json(['error' => 'No SQL content provided'], 400);
        }

        DB::beginTransaction();
        try {
            DB::unprepared($sqlContent);
            DB::commit();
            return response()->json(['success' => true, 'message' => 'SQL backup restored']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'SQL restore failed: ' . $e->getMessage()], 500);
        }
    }

    private function deleteBackup(Request $request)
    {
        $fileName = $request->input('file_name');
        $filePath = storage_path("app/backups/{$fileName}");

        if (file_exists($filePath)) {
            unlink($filePath);
        }

        DB::table('backup_logs')->where('file_name', $fileName)->delete();

        return response()->json(['success' => true]);
    }

    private function cleanupBackups(Request $request)
    {
        $backupDir = storage_path('app/backups');
        if (!is_dir($backupDir)) {
            return response()->json(['success' => true, 'deleted' => 0]);
        }

        $files = glob("{$backupDir}/*");
        $deleted = 0;
        $cutoff = now()->subDays(30)->timestamp;

        foreach ($files as $file) {
            if (filemtime($file) < $cutoff) {
                unlink($file);
                $deleted++;
            }
        }

        return response()->json(['success' => true, 'deleted' => $deleted]);
    }

    private function compareBackup(Request $request)
    {
        $tables = $this->getAllTables();
        $counts = [];

        foreach ($tables as $table) {
            $counts[$table] = DB::table($table)->count();
        }

        return response()->json(['success' => true, 'counts' => $counts]);
    }

    private function getAllTables(): array
    {
        $exclude = ['migrations', 'personal_access_tokens', 'password_reset_tokens', 'failed_jobs', 'cache', 'cache_locks', 'sessions', 'jobs', 'job_batches'];
        $tables = Schema::getTableListing();
        return array_values(array_diff($tables, $exclude));
    }
}
