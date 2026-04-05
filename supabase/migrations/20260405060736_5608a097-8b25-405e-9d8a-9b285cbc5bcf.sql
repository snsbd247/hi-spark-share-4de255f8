-- Delete customer-related data first (child tables)
DELETE FROM customer_bandwidth_usages;
DELETE FROM customer_reseller_migrations;
DELETE FROM customer_sessions;
DELETE FROM customer_ledger;
DELETE FROM customer_devices;
DELETE FROM merchant_payments;
DELETE FROM fiber_onus;
DELETE FROM bills;

-- Delete customers
DELETE FROM customers;

-- Delete reseller-related data
DELETE FROM reseller_zones;

-- Delete resellers
DELETE FROM resellers;

-- Delete tenant-related child data
DELETE FROM subscriptions;
DELETE FROM packages;
DELETE FROM domains;
DELETE FROM impersonations;
DELETE FROM accounts;
DELETE FROM expenses;
DELETE FROM expense_heads;
DELETE FROM income_heads;
DELETE FROM categories;
DELETE FROM employees;
DELETE FROM designations;
DELETE FROM attendance;
DELETE FROM loans;
DELETE FROM employee_salary_structure;
DELETE FROM employee_provident_fund;
DELETE FROM employee_savings_fund;
DELETE FROM employee_education;
DELETE FROM employee_experience;
DELETE FROM employee_emergency_contacts;
DELETE FROM daily_reports;
DELETE FROM activity_logs;
DELETE FROM login_histories;
DELETE FROM ip_pools;
DELETE FROM mikrotik_routers;
DELETE FROM inventory_logs;
DELETE FROM billing_config;
DELETE FROM fiber_splitter_outputs;
DELETE FROM fiber_splitters;
DELETE FROM fiber_cores;
DELETE FROM core_connections;
DELETE FROM fiber_cables;
DELETE FROM fiber_pon_ports;
DELETE FROM fiber_olts;
DELETE FROM general_settings;

-- Finally delete tenants
DELETE FROM tenants;