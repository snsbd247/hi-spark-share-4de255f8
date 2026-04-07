
DO $$
DECLARE
  tbl text;
  tbl_list text[] := ARRAY[
    'accounts','activity_logs','admin_login_logs','admin_sessions','attendance',
    'audit_logs','backup_logs','billing_config','bills','categories',
    'core_connections','coupons','custom_roles','customer_bandwidth_usages',
    'customer_devices','customer_ledger','customer_reseller_migrations',
    'customer_sessions','customers','daily_reports','demo_requests',
    'designations','domains','employee_education','employee_emergency_contacts',
    'employee_experience','employee_provident_fund','employee_salary_structure',
    'employee_savings_fund','employees','expense_heads','expenses','faqs',
    'fiber_cables','fiber_cores','fiber_olts','fiber_onus','fiber_pon_ports',
    'fiber_splitter_outputs','fiber_splitters','general_settings','geo_districts',
    'geo_divisions','geo_upazilas','impersonations','income_heads','inventory_logs',
    'ip_pools','landing_sections','loans','login_histories','merchant_payments',
    'mikrotik_routers','modules','network_links','network_nodes','notifications',
    'olts','online_sessions','onus','other_heads','packages','payment_gateways',
    'payments','permissions','plan_modules','product_serials','products','profiles',
    'purchase_items','purchases','reminder_logs','reseller_commissions',
    'reseller_package_commissions','reseller_packages','reseller_sessions',
    'reseller_wallet_transactions','reseller_zones','resellers','role_permissions',
    'saas_plans','salary_sheets','sale_items','sales','sms_logs','sms_settings',
    'sms_templates','sms_transactions','sms_wallets','smtp_settings',
    'subscription_invoices','subscriptions','super_admin_sessions','super_admins',
    'supplier_payments','suppliers','support_tickets','system_settings',
    'tenant_company_info','tenants','ticket_replies','transactions','user_roles','zones'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbl_list LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon', tbl);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', tbl);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO service_role', tbl);
  END LOOP;
END $$;
