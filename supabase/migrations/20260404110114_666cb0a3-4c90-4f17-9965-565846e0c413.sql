
-- ============================================
-- Landing Page Demo Data
-- ============================================

-- 1. Hero Section
INSERT INTO public.landing_sections (section_type, sort_order, title, subtitle, description, icon, metadata, is_active) VALUES
('hero', 1, 'ISP ব্যবসার জন্য সম্পূর্ণ ম্যানেজমেন্ট সলিউশন', 'Smart ISP', 'বিলিং, কাস্টমার ম্যানেজমেন্ট, MikroTik ইন্টিগ্রেশন, SMS নোটিফিকেশন, এবং আরও অনেক কিছু — একটি প্ল্যাটফর্মে।', NULL, '{
  "badge": "🚀 Bangladesh #1 ISP Management Platform",
  "cta_primary": "ডেমো রিকোয়েস্ট করুন",
  "cta_secondary": "Watch Demo",
  "cta_nav": "Get Started",
  "hero_badges": ["No Setup Fee", "24/7 Support", "Free Trial", "Bangla Interface"],
  "nav_links": [
    {"label": "FEATURES", "href": "#features"},
    {"label": "PRICING", "href": "#pricing"},
    {"label": "FAQ", "href": "#faq"},
    {"label": "CONTACT", "href": "#signup"}
  ],
  "pricing_title": "Package & Pricing",
  "pricing_subtitle": "আপনার ISP ব্যবসার জন্য সেরা প্ল্যান বেছে নিন",
  "demo_title": "ডেমো রিকোয়েস্ট করুন",
  "demo_subtitle": "আমাদের সফটওয়্যার ব্যবহার করতে চান? নিচের ফর্মটি পূরণ করুন।"
}', true);

-- 2. Stats
INSERT INTO public.landing_sections (section_type, sort_order, title, subtitle, icon, is_active) VALUES
('stat', 2, '500+', 'Active ISP Clients', 'Users', true),
('stat', 3, '50,000+', 'Customers Managed', 'Globe', true),
('stat', 4, '99.9%', 'System Uptime', 'Shield', true),
('stat', 5, '24/7', 'Support Available', 'Headphones', true);

-- 3. Features
INSERT INTO public.landing_sections (section_type, sort_order, title, subtitle, description, icon, metadata, is_active) VALUES
('feature', 10, 'Customer Management', 'কাস্টমার ম্যানেজমেন্ট', 'সম্পূর্ণ কাস্টমার প্রোফাইল, PPPoE কনফিগারেশন, কানেকশন স্ট্যাটাস ট্র্যাকিং এবং অটোমেটেড নোটিফিকেশন সিস্টেম।', 'Users', '{"section_title": "আমাদের ফিচারসমূহ", "section_subtitle": "ISP ব্যবসা পরিচালনার জন্য প্রয়োজনীয় সব টুল এক জায়গায়"}', true),
('feature', 11, 'Billing & Invoice', 'বিলিং ও ইনভয়েস', 'অটোমেটেড মাসিক বিল জেনারেশন, কাস্টম ইনভয়েস, পেমেন্ট ট্র্যাকিং এবং ডিউ রিমাইন্ডার।', 'Receipt', '{}', true),
('feature', 12, 'MikroTik Integration', 'মাইক্রোটিক ইন্টিগ্রেশন', 'রাউটার থেকে সরাসরি PPPoE ইউজার ম্যানেজ করুন, ব্যান্ডউইথ কন্ট্রোল এবং রিয়েল-টাইম মনিটরিং।', 'Router', '{}', true),
('feature', 13, 'SMS Notification', 'এসএমএস নোটিফিকেশন', 'বিল জেনারেট, পেমেন্ট কনফার্মেশন, ডিউ রিমাইন্ডার এবং সার্ভিস আপডেট — সব কিছু অটোমেটিক SMS-এ।', 'MessageSquare', '{}', true),
('feature', 14, 'Accounting & Reports', 'হিসাবরক্ষণ ও রিপোর্ট', 'Chart of Accounts, ডাবল-এন্ট্রি লেজার, ইনকাম-এক্সপেন্স ট্র্যাকিং এবং বিস্তারিত ফাইন্যান্সিয়াল রিপোর্ট।', 'Calculator', '{}', true),
('feature', 15, 'FTTH/Fiber Network', 'ফাইবার নেটওয়ার্ক', 'OLT, স্প্লিটার, ONU ম্যানেজমেন্ট এবং ফাইবার ট্র্যাকিং — সম্পূর্ণ FTTH নেটওয়ার্ক ম্যাপিং।', 'Cable', '{}', true);

-- 4. Testimonials
INSERT INTO public.landing_sections (section_type, sort_order, title, subtitle, description, metadata, is_active) VALUES
('testimonial', 20, 'Md. Rahim Uddin', 'CEO, SpeedNet BD', 'Smart ISP আমাদের ISP ব্যবসাকে সম্পূর্ণ বদলে দিয়েছে। বিলিং অটোমেশন এবং MikroTik ইন্টিগ্রেশন অসাধারণ কাজ করে।', '{"rating": 5, "avatar": "R", "section_title": "আমাদের ক্লায়েন্টদের মতামত"}', true),
('testimonial', 21, 'Fatema Akter', 'Manager, FiberLink ISP', 'কাস্টমার ম্যানেজমেন্ট এবং SMS নোটিফিকেশন ফিচারটি আমাদের কাস্টমার সার্ভিস উল্লেখযোগ্যভাবে উন্নত করেছে।', '{"rating": 5, "avatar": "F"}', true),
('testimonial', 22, 'Kamal Hossain', 'Owner, NetZone ISP', 'আগে Excel-এ হিসাব রাখতাম, এখন সব কিছু অটোমেটিক। রিপোর্ট এবং একাউন্টিং মডিউল দারুণ কাজ করে।', '{"rating": 5, "avatar": "K"}', true);

-- 5. FAQs
INSERT INTO public.landing_sections (section_type, sort_order, title, description, metadata, is_active) VALUES
('faq', 30, 'Smart ISP কি ধরনের ISP-এর জন্য উপযুক্ত?', 'Smart ISP ছোট থেকে বড় সব ধরনের ISP-এর জন্য উপযুক্ত। আপনার ১০ জন কাস্টমার হোক বা ১০,০০০ — আমাদের সিস্টেম সব স্কেলে কাজ করে।', '{"section_title": "সচরাচর জিজ্ঞাসা"}', true),
('faq', 31, 'MikroTik রাউটার ছাড়া কি ব্যবহার করা যায়?', 'হ্যাঁ, MikroTik ইন্টিগ্রেশন ঐচ্ছিক। আপনি শুধু বিলিং, কাস্টমার ম্যানেজমেন্ট এবং অন্যান্য মডিউল ব্যবহার করতে পারবেন।', '{}', true),
('faq', 32, 'ডাটা কি নিরাপদ?', 'সম্পূর্ণ নিরাপদ। আমরা এনক্রিপ্টেড ডাটাবেস, role-based access control এবং নিয়মিত ব্যাকআপ ব্যবহার করি।', '{}', true),
('faq', 33, 'সাপোর্ট কিভাবে পাওয়া যায়?', 'আমরা ২৪/৭ টেকনিক্যাল সাপোর্ট দিই। ফোন, ইমেইল এবং লাইভ চ্যাটের মাধ্যমে যেকোনো সময় যোগাযোগ করতে পারবেন।', '{}', true),
('faq', 34, 'কাস্টম ফিচার যোগ করা যায় কি?', 'হ্যাঁ, আমরা কাস্টম ডেভেলপমেন্ট সাপোর্ট দিই। আপনার নির্দিষ্ট প্রয়োজন অনুযায়ী ফিচার তৈরি করে দিতে পারি।', '{}', true);

-- 6. Footer Sections
INSERT INTO public.landing_sections (section_type, sort_order, title, subtitle, description, metadata, is_active) VALUES
('footer', 40, 'About Company', 'About Company', 'Smart ISP হলো বাংলাদেশের ISP ব্যবসার জন্য তৈরি সবচেয়ে আধুনিক ম্যানেজমেন্ট সফটওয়্যার। আমরা প্রযুক্তির মাধ্যমে ISP পরিচালনাকে সহজ ও দক্ষ করতে প্রতিশ্রুতিবদ্ধ।', '{"company_name": "Smart ISP", "developer": "Sync & Solutions IT"}', true),
('footer', 41, 'Quick Links', 'Quick Links', NULL, '{"links": [{"label": "Home", "href": "#"}, {"label": "Features", "href": "#features"}, {"label": "Package & Pricing", "href": "#pricing"}, {"label": "FAQ", "href": "#faq"}, {"label": "Demo Request", "href": "#signup"}]}', true),
('footer', 42, 'Payment Methods', 'Payment Method', NULL, '{"bank_name": "Dutch Bangla Bank", "account_name": "Smart ISP", "account_no": "123-456-7890", "bkash": "01XXXXXXXXX", "nagad": "01XXXXXXXXX"}', true),
('footer', 43, 'Contact Info', 'Contact Us', NULL, '{"email": "info@smartispapp.com", "phone": "01315556633", "address": "Dhaka, Bangladesh"}', true);
