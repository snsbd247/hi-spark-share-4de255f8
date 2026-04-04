-- 1. Add tenant_id to custom_roles for per-tenant role management
ALTER TABLE public.custom_roles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- 2. Create landing_sections table for dynamic landing page CMS
CREATE TABLE IF NOT EXISTS public.landing_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type TEXT NOT NULL, -- hero, feature, pricing, testimonial, faq, footer, stat
  sort_order INT NOT NULL DEFAULT 0,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  link_url TEXT,
  link_text TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_landing_sections_type ON public.landing_sections(section_type, sort_order);

-- 3. Seed default landing sections 
INSERT INTO public.landing_sections (section_type, sort_order, title, subtitle, description, icon, is_active, metadata) VALUES
-- Hero
('hero', 0, 'Your ISP Business, Fully Automated', '#1 ISP Billing Platform in Bangladesh', 'Billing, MikroTik integration, SMS, accounting, HR — all in one powerful SaaS platform. Get your ISP running in minutes, not months.', NULL, true, '{"badge": "🚀 #1 ISP Billing Platform in Bangladesh", "cta_primary": "Start Free Trial", "cta_secondary": "Watch Demo"}'),
-- Stats
('stat', 0, '500+', 'ISPs Active', NULL, 'Wifi', true, '{}'),
('stat', 1, '50K+', 'Customers Managed', NULL, 'Users', true, '{}'),
('stat', 2, '99.9%', 'Uptime', NULL, 'Server', true, '{}'),
('stat', 3, '৳2Cr+', 'Bills Processed', NULL, 'Receipt', true, '{}'),
-- Features
('feature', 0, 'Automated Billing', NULL, 'Auto-generate monthly bills, send reminders, mark payments, and print branded invoices — all hands-free.', 'CreditCard', true, '{}'),
('feature', 1, 'MikroTik Integration', NULL, 'Sync PPPoE users, auto-suspend on overdue, manage bandwidth profiles directly from the dashboard.', 'Router', true, '{}'),
('feature', 2, 'SMS & Notifications', NULL, 'Send bill reminders, payment confirmations, and custom messages via integrated SMS gateway.', 'MessageSquare', true, '{}'),
('feature', 3, 'Advanced Analytics', NULL, 'Real-time revenue, collection rates, customer growth, and financial reporting at your fingertips.', 'BarChart3', true, '{}'),
('feature', 4, 'Double-Entry Accounting', NULL, 'Full chart of accounts, journal entries, trial balance, profit & loss — complete ERP accounting.', 'Shield', true, '{}'),
('feature', 5, 'HR & Payroll', NULL, 'Employee management, attendance tracking, salary sheets, loan management — built right in.', 'Users', true, '{}'),
('feature', 6, 'Customer Portal', NULL, 'Customers can view bills, make payments, and submit support tickets from their own portal.', 'Globe', true, '{}'),
('feature', 7, 'Inventory Management', NULL, 'Track products, serial numbers, ONU devices, and manage supplier purchases.', 'Package', true, '{}'),
('feature', 8, 'Support & Ticketing', NULL, 'Built-in helpdesk with customer ticket management, replies, and status tracking.', 'MessageSquare', true, '{}'),
('feature', 9, 'Auto Disconnect', NULL, 'Automatically suspend overdue customers via MikroTik integration.', 'Wifi', true, '{}'),
('feature', 10, 'FTTH/Fiber Management', NULL, 'Manage OLTs, splitters, fiber cores, and ONUs with visual topology mapping.', 'Server', true, '{}'),
('feature', 11, 'Multi-Tenant SaaS', NULL, 'White-label solution with custom domains, branding, and isolated data per ISP.', 'Zap', true, '{}'),
-- Testimonials
('testimonial', 0, 'রাকিব হাসান', 'SpeedNet BD', 'Smart ISP আমাদের বিলিং সময় ৮০% কমিয়ে দিয়েছে। এখন সব কিছু অটোমেটেড।', NULL, true, '{"avatar": "R"}'),
('testimonial', 1, 'তানভীর আহমেদ', 'FastLink ISP', 'MikroTik ইন্টিগ্রেশন অসাধারণ! এখন আর ম্যানুয়ালি ইউজার অ্যাড করতে হয় না।', NULL, true, '{"avatar": "T"}'),
('testimonial', 2, 'সাদিয়া রহমান', 'NetBridge', 'অ্যাকাউন্টিং এবং HR একই প্ল্যাটফর্মে পেয়ে অনেক খুশি। সব কিছু এক জায়গায়।', NULL, true, '{"avatar": "S"}'),
-- FAQs  
('faq', 0, 'ফ্রি ট্রায়ালে কি সব ফিচার পাবো?', NULL, 'হ্যাঁ, ১৪ দিনের ফ্রি ট্রায়ালে সব ফিচার আনলক থাকবে। কোনো ক্রেডিট কার্ড লাগবে না।', NULL, true, '{}'),
('faq', 1, 'আমি কি নিজের ডোমেইন ব্যবহার করতে পারবো?', NULL, 'অবশ্যই! আপনি আপনার কাস্টম ডোমেইন (যেমন: billing.yourisp.com) কানেক্ট করতে পারবেন।', NULL, true, '{}'),
('faq', 2, 'MikroTik রাউটার কিভাবে কানেক্ট করবো?', NULL, 'ড্যাশবোর্ড থেকে রাউটারের IP, ইউজারনেম ও পাসওয়ার্ড দিয়ে এক ক্লিকে কানেক্ট করুন।', NULL, true, '{}'),
('faq', 3, 'ডাটা কি সুরক্ষিত?', NULL, 'আপনার সব ডাটা এনক্রিপ্টেড এবং সিকিউর সার্ভারে সংরক্ষিত। নিয়মিত ব্যাকআপ নেওয়া হয়।', NULL, true, '{}'),
('faq', 4, 'সাপোর্ট কিভাবে পাবো?', NULL, 'আমাদের ডেডিকেটেড সাপোর্ট টিম ২৪/৭ আপনাকে সাহায্য করতে প্রস্তুত। টিকেট বা ফোনে যোগাযোগ করুন।', NULL, true, '{}'),
-- Footer
('footer', 0, 'About Company', NULL, 'Smart ISP is a powerful SaaS billing and management platform designed specifically for Internet Service Providers in Bangladesh. Simplify your daily operations and grow your business.', NULL, true, '{"company_name": "Smart ISP", "developer": "Tech Expert Lab"}'),
('footer', 1, 'Contact Info', NULL, NULL, NULL, true, '{"email": "hello@smartisp.com", "phone": "+8801700000000", "whatsapp": "+8801700000000", "address": "Dhaka, Bangladesh"}'),
('footer', 2, 'Payment Methods', NULL, NULL, NULL, true, '{"bank_name": "Islami Bank Bangladesh", "account_name": "Smart ISP", "account_no": "12345678", "bkash": "01700000000", "nagad": "01700000000", "rocket": "01700000000"}')
ON CONFLICT DO NOTHING;