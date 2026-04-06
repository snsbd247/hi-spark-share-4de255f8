-- Financial tables: remove anon write access
DROP POLICY IF EXISTS "anon_access" ON public.payments;
CREATE POLICY "anon_select_payments" ON public.payments FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.bills;
CREATE POLICY "anon_select_bills" ON public.bills FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.expenses;
CREATE POLICY "anon_select_expenses" ON public.expenses FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.expense_heads;
CREATE POLICY "anon_select_expense_heads" ON public.expense_heads FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.income_heads;
CREATE POLICY "anon_select_income_heads" ON public.income_heads FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.other_heads;
CREATE POLICY "anon_select_other_heads" ON public.other_heads FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.accounts;
CREATE POLICY "anon_select_accounts" ON public.accounts FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.transactions;
CREATE POLICY "anon_select_transactions" ON public.transactions FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.salary_sheets;
CREATE POLICY "anon_select_salary_sheets" ON public.salary_sheets FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.loans;
CREATE POLICY "anon_select_loans" ON public.loans FOR SELECT TO anon USING (true);

-- Inventory/Supply chain
DROP POLICY IF EXISTS "anon_access" ON public.products;
CREATE POLICY "anon_select_products" ON public.products FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.product_serials;
CREATE POLICY "anon_select_product_serials" ON public.product_serials FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.purchases;
CREATE POLICY "anon_select_purchases" ON public.purchases FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.purchase_items;
CREATE POLICY "anon_select_purchase_items" ON public.purchase_items FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.sales;
CREATE POLICY "anon_select_sales" ON public.sales FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.sale_items;
CREATE POLICY "anon_select_sale_items" ON public.sale_items FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.suppliers;
CREATE POLICY "anon_select_suppliers" ON public.suppliers FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.supplier_payments;
CREATE POLICY "anon_select_supplier_payments" ON public.supplier_payments FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.inventory_logs;
CREATE POLICY "anon_select_inventory_logs" ON public.inventory_logs FOR SELECT TO anon USING (true);

-- Employee/HR tables
DROP POLICY IF EXISTS "anon_access" ON public.employees;
CREATE POLICY "anon_select_employees" ON public.employees FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.employee_education;
CREATE POLICY "anon_select_employee_education" ON public.employee_education FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.employee_emergency_contacts;
CREATE POLICY "anon_select_employee_emergency_contacts" ON public.employee_emergency_contacts FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.employee_experience;
CREATE POLICY "anon_select_employee_experience" ON public.employee_experience FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.employee_provident_fund;
CREATE POLICY "anon_select_employee_provident_fund" ON public.employee_provident_fund FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.employee_salary_structure;
CREATE POLICY "anon_select_employee_salary_structure" ON public.employee_salary_structure FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.employee_savings_fund;
CREATE POLICY "anon_select_employee_savings_fund" ON public.employee_savings_fund FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.attendance;
CREATE POLICY "anon_select_attendance" ON public.attendance FOR SELECT TO anon USING (true);

-- Network infrastructure
DROP POLICY IF EXISTS "anon_access" ON public.fiber_cables;
CREATE POLICY "anon_select_fiber_cables" ON public.fiber_cables FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.fiber_cores;
CREATE POLICY "anon_select_fiber_cores" ON public.fiber_cores FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.fiber_olts;
CREATE POLICY "anon_select_fiber_olts" ON public.fiber_olts FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.fiber_onus;
CREATE POLICY "anon_select_fiber_onus" ON public.fiber_onus FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.fiber_pon_ports;
CREATE POLICY "anon_select_fiber_pon_ports" ON public.fiber_pon_ports FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.fiber_splitters;
CREATE POLICY "anon_select_fiber_splitters" ON public.fiber_splitters FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.fiber_splitter_outputs;
CREATE POLICY "anon_select_fiber_splitter_outputs" ON public.fiber_splitter_outputs FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.core_connections;
CREATE POLICY "anon_select_core_connections" ON public.core_connections FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.network_nodes;
CREATE POLICY "anon_select_network_nodes" ON public.network_nodes FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.network_links;
CREATE POLICY "anon_select_network_links" ON public.network_links FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.olts;
CREATE POLICY "anon_select_olts" ON public.olts FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.onus;
CREATE POLICY "anon_select_onus" ON public.onus FOR SELECT TO anon USING (true);

-- Other operational tables
DROP POLICY IF EXISTS "anon_access" ON public.customer_devices;
CREATE POLICY "anon_select_customer_devices" ON public.customer_devices FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.customer_ledger;
CREATE POLICY "anon_select_customer_ledger" ON public.customer_ledger FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.support_tickets;
CREATE POLICY "anon_select_support_tickets" ON public.support_tickets FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.ticket_replies;
CREATE POLICY "anon_select_ticket_replies" ON public.ticket_replies FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.coupons;
CREATE POLICY "anon_select_coupons" ON public.coupons FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.billing_config;
CREATE POLICY "anon_select_billing_config" ON public.billing_config FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.categories;
CREATE POLICY "anon_select_categories" ON public.categories FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.daily_reports;
CREATE POLICY "anon_select_daily_reports" ON public.daily_reports FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.designations;
CREATE POLICY "anon_select_designations" ON public.designations FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.domains;
CREATE POLICY "anon_select_domains" ON public.domains FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.notifications;
CREATE POLICY "anon_select_notifications" ON public.notifications FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.online_sessions;
CREATE POLICY "anon_select_online_sessions" ON public.online_sessions FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.packages;
CREATE POLICY "anon_select_packages" ON public.packages FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.reminder_logs;
CREATE POLICY "anon_select_reminder_logs" ON public.reminder_logs FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.sms_settings;
CREATE POLICY "anon_select_sms_settings" ON public.sms_settings FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.sms_templates;
CREATE POLICY "anon_select_sms_templates" ON public.sms_templates FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.system_settings;
CREATE POLICY "anon_select_system_settings" ON public.system_settings FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.tenants;
CREATE POLICY "anon_select_tenants" ON public.tenants FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.zones;
CREATE POLICY "anon_select_zones" ON public.zones FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_access" ON public.activity_logs;
CREATE POLICY "anon_select_activity_logs" ON public.activity_logs FOR SELECT TO anon USING (true);