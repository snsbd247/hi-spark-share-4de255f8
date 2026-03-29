

# Accounting Calculation Audit & Fix Plan

## Issues Found

After thorough code review and database schema inspection, here are the calculation and data integrity issues:

### 1. Chart of Accounts - Parent accounts don't aggregate children
**Problem**: Parent accounts only show their own transaction totals. They should show the sum of all children's transactions too.
**Fix**: After computing per-account totals, walk the tree bottom-up to accumulate children's debit/credit into parent accounts.

### 2. Ledger Statement - Opening balance hardcoded to 0
**Problem**: `LedgerStatement.tsx` line 122 shows `{fmt(0)}` for opening balance instead of computing it from pre-period transactions (like Trial Balance does).
**Fix**: Query transactions before `dateFrom` to compute proper opening balance, and use it as the starting point for running balance.

### 3. Balance Sheet - No date filtering
**Problem**: Balance Sheet has an `asOf` date variable but fetches ALL transactions regardless. Should only include transactions up to `asOf` date.
**Fix**: Filter transactions with `.lte("date", asOf + "T23:59:59")` and allow the user to change the date.

### 4. Cash Flow - Hardcoded account codes
**Problem**: Uses hardcoded `["1101", "1102", "1103", "1104"]` for cash accounts. If user has different codes, it breaks.
**Fix**: Query accounts of type `asset` with codes starting with `110` or names containing "Cash"/"Bank", or use a setting.

### 5. Journal Entries - Each line gets different reference
**Problem**: `JournalEntries.tsx` uses `JE-${Date.now()}` per line. Since `Date.now()` can differ between async calls, paired entries may get different references.
**Fix**: Generate journal reference once before the loop.

### 6. Expense deletion doesn't reverse ledger
**Problem**: When an expense is deleted from `Expenses.tsx`, the corresponding transaction entries in the `transactions` table are NOT removed, causing permanent accounting imbalance.
**Fix**: When deleting an expense, also find and delete related transaction entries by reference pattern, and reverse account balance updates.

### 7. Transaction insert uses non-existent columns
**Problem**: The migration file shows columns like `amount`, `category`, `journal_ref`, `reference_type`, `reference_id`, `customer_id`, `vendor_id` - but the **actual database** only has: `id, date, description, debit, credit, account_id, reference, type, created_by, created_at`. Code inserting `category`, `amount`, `journal_ref` etc. silently fails or gets ignored.
**Fix**: Remove references to non-existent columns across the codebase. Use only actual columns.

---

## Implementation Plan

### Step 1: Fix Chart of Accounts parent aggregation
- In `ChartOfAccounts.tsx`, after computing per-account totals, recursively aggregate children's debit/credit into parents.

### Step 2: Fix Ledger Statement opening balance
- In `LedgerStatement.tsx`, add a query for transactions before `dateFrom` to compute opening balance.
- Use opening balance as starting point for running balance.
- Display correct opening balance in the summary card.

### Step 3: Fix Balance Sheet date filtering
- Make `asOf` editable with an input.
- Filter transactions by `<= asOf` date.

### Step 4: Fix Cash Flow account detection
- Query all asset accounts with code starting "110" or "11" dynamically instead of hardcoding.

### Step 5: Fix Journal Entry reference consistency
- Generate `journalRef` once before the loop in `JournalEntries.tsx`.

### Step 6: Fix Expense deletion ledger reversal
- When deleting expense, also delete matching transactions and reverse account balances.

### Step 7: Clean up non-existent column references
- Audit all transaction inserts/queries to only use columns that exist (`id, date, description, debit, credit, account_id, reference, type, created_by, created_at`).
- Remove `category`, `amount`, `journal_ref`, `reference_type`, `reference_id`, `customer_id`, `vendor_id` from queries.

**Files to modify**: `ChartOfAccounts.tsx`, `LedgerStatement.tsx`, `BalanceSheet.tsx`, `CashFlowStatement.tsx`, `JournalEntries.tsx`, `Expenses.tsx`, `AllTransactions.tsx`, `ledger.ts`, `ChequeRegister.tsx`, `Daybook.tsx`

