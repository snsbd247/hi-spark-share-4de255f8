
-- Insert test customer
INSERT INTO customers (customer_id, name, phone, area, package_id, monthly_bill, status, connection_status, tenant_id, father_name, email, installation_date, pppoe_username, pppoe_password)
SELECT 'C-1001', 'মোঃ রাশেদুল ইসলাম', '01712345678', 'মিরপুর', p.id, 500, 'active', 'active', '656a739b-fc57-459d-8402-4e62e3b8d983', 'আব্দুল করিম', 'rashid@test.com', '2026-01-15', 'rashid_pppoe', 'pass123'
FROM packages p WHERE p.name = 'Basic 10Mbps' LIMIT 1;

-- Insert test designation
INSERT INTO designations (name, description, status, tenant_id)
VALUES ('Manager', 'Office Manager', 'active', '656a739b-fc57-459d-8402-4e62e3b8d983');

-- Insert test employee
INSERT INTO employees (employee_id, name, phone, email, salary, status, tenant_id, joining_date, designation_id)
SELECT 'EMP-001', 'কামরুল হাসান', '01898765432', 'kamrul@test.com', 15000, 'active', '656a739b-fc57-459d-8402-4e62e3b8d983', '2025-06-01', d.id
FROM designations d WHERE d.name = 'Manager' AND d.tenant_id = '656a739b-fc57-459d-8402-4e62e3b8d983' LIMIT 1;

-- Insert test product
INSERT INTO products (name, sku, category, unit, buy_price, sell_price, stock, status, tenant_id, brand, model)
VALUES ('ONU Router', 'ONU-001', 'network', 'piece', 800, 1200, 50, 'active', '656a739b-fc57-459d-8402-4e62e3b8d983', 'TP-Link', 'XN020-G3');

-- Insert test expense
INSERT INTO expenses (category, amount, date, description, payment_method, status, tenant_id)
VALUES ('utility', 2500, '2026-04-01', 'বিদ্যুৎ বিল - এপ্রিল', 'cash', 'active', '656a739b-fc57-459d-8402-4e62e3b8d983');

-- Insert test expense head
INSERT INTO expense_heads (name, description, status, tenant_id)
VALUES ('Electricity', 'Monthly electricity bills', 'active', '656a739b-fc57-459d-8402-4e62e3b8d983');

-- Insert test support ticket
INSERT INTO support_tickets (ticket_id, customer_id, subject, category, status, priority, tenant_id)
SELECT 'TKT-001', c.id, 'ইন্টারনেট স্লো', 'technical', 'open', 'high', '656a739b-fc57-459d-8402-4e62e3b8d983'
FROM customers c WHERE c.customer_id = 'C-1001' LIMIT 1;

-- Insert test bill
INSERT INTO bills (customer_id, month, amount, paid_amount, discount, status)
SELECT c.id, '2026-04', 500, 0, 0, 'unpaid'
FROM customers c WHERE c.customer_id = 'C-1001' LIMIT 1;

-- Insert test supplier
INSERT INTO suppliers (name, phone, email, address, status, tenant_id)
VALUES ('নেটওয়ার্ক সলিউশন', '01511223344', 'network@supplier.com', 'ঢাকা', 'active', '656a739b-fc57-459d-8402-4e62e3b8d983');
