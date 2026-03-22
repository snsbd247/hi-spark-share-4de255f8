# Smart ISP — Complete File Structure

```
smart-isp/
│
├── 📂 laravel-backend/              ← Laravel API Backend (PHP)
│   ├── 📂 app/
│   │   ├── 📂 Console/
│   │   │   └── 📂 Commands/
│   │   │       ├── AutoSuspend.php          # Auto-suspend overdue customers
│   │   │       ├── CleanupSessions.php      # Cleanup expired sessions
│   │   │       └── GenerateBills.php        # Monthly bill generation
│   │   │
│   │   ├── 📂 Http/
│   │   │   ├── 📂 Controllers/
│   │   │   │   └── 📂 Api/
│   │   │   │       ├── AdminUserController.php
│   │   │   │       ├── AuthController.php
│   │   │   │       ├── BillController.php
│   │   │   │       ├── BkashController.php
│   │   │   │       ├── CustomerAuthController.php
│   │   │   │       ├── DashboardController.php
│   │   │   │       ├── EmailController.php
│   │   │   │       ├── GenericCrudController.php
│   │   │   │       ├── MerchantPaymentController.php
│   │   │   │       ├── MikrotikBillControlController.php
│   │   │   │       ├── MikrotikController.php
│   │   │   │       ├── NagadController.php
│   │   │   │       ├── PaymentController.php
│   │   │   │       ├── PortalController.php
│   │   │   │       ├── SmsController.php
│   │   │   │       └── StorageController.php
│   │   │   │
│   │   │   ├── 📂 Middleware/
│   │   │   │   ├── AdminAuth.php
│   │   │   │   ├── CheckPermission.php
│   │   │   │   └── CustomerAuth.php
│   │   │   │
│   │   │   └── 📂 Requests/               # Form Request Validation (18 classes)
│   │   │       ├── AdminLoginRequest.php
│   │   │       ├── CreatePaymentGatewayRequest.php
│   │   │       ├── CustomerLoginRequest.php
│   │   │       ├── GenerateBillsRequest.php
│   │   │       ├── MatchMerchantPaymentRequest.php
│   │   │       ├── MikrotikSyncRequest.php
│   │   │       ├── MikrotikTestRequest.php
│   │   │       ├── PortalCreateTicketRequest.php
│   │   │       ├── SendBulkSmsRequest.php
│   │   │       ├── SendEmailRequest.php
│   │   │       ├── SendSmsRequest.php
│   │   │       ├── StoreAdminUserRequest.php
│   │   │       ├── StoreBillRequest.php
│   │   │       ├── StoreCustomerRequest.php
│   │   │       ├── StoreMerchantPaymentRequest.php
│   │   │       ├── StorePaymentRequest.php
│   │   │       ├── UpdateAdminUserRequest.php
│   │   │       └── UpdateBillRequest.php
│   │   │
│   │   ├── 📂 Models/                     # Eloquent Models (30 models)
│   │   │   ├── AdminLoginLog.php
│   │   │   ├── AdminSession.php
│   │   │   ├── AuditLog.php
│   │   │   ├── BackupLog.php
│   │   │   ├── Bill.php
│   │   │   ├── CustomRole.php
│   │   │   ├── Customer.php
│   │   │   ├── CustomerLedger.php
│   │   │   ├── CustomerSession.php
│   │   │   ├── GeneralSetting.php
│   │   │   ├── MerchantPayment.php
│   │   │   ├── MikrotikRouter.php
│   │   │   ├── Olt.php
│   │   │   ├── Onu.php
│   │   │   ├── Package.php
│   │   │   ├── Payment.php
│   │   │   ├── PaymentGateway.php
│   │   │   ├── Permission.php
│   │   │   ├── Profile.php
│   │   │   ├── ReminderLog.php
│   │   │   ├── RolePermission.php
│   │   │   ├── SmsLog.php
│   │   │   ├── SmsSetting.php
│   │   │   ├── SmsTemplate.php
│   │   │   ├── SupportTicket.php
│   │   │   ├── SystemSetting.php
│   │   │   ├── TicketReply.php
│   │   │   ├── User.php
│   │   │   ├── UserRole.php
│   │   │   └── Zone.php
│   │   │
│   │   ├── 📂 Providers/
│   │   │   └── AppServiceProvider.php
│   │   │
│   │   ├── 📂 Services/                   # Business Logic (8 services)
│   │   │   ├── BillingService.php
│   │   │   ├── BkashService.php
│   │   │   ├── EmailService.php
│   │   │   ├── LedgerService.php
│   │   │   ├── MikrotikService.php
│   │   │   ├── NagadService.php
│   │   │   ├── SmsService.php
│   │   │   └── WhatsappService.php
│   │   │
│   │   └── 📂 Traits/
│   │       └── HasUuid.php
│   │
│   ├── 📂 bootstrap/
│   │   ├── app.php                        # Middleware & routing config
│   │   └── providers.php
│   │
│   ├── 📂 config/                         # 12 config files
│   │   ├── app.php
│   │   ├── auth.php
│   │   ├── cache.php
│   │   ├── cors.php
│   │   ├── database.php
│   │   ├── filesystems.php
│   │   ├── logging.php
│   │   ├── mail.php
│   │   ├── queue.php
│   │   ├── sanctum.php
│   │   ├── services.php
│   │   └── session.php
│   │
│   ├── 📂 database/
│   │   ├── 📂 factories/
│   │   ├── 📂 migrations/                 # 32 migration files
│   │   └── 📂 seeders/
│   │       ├── DatabaseSeeder.php
│   │       └── DefaultSeeder.php
│   │
│   ├── 📂 public/
│   │   ├── .htaccess
│   │   ├── favicon.ico
│   │   ├── index.php
│   │   └── robots.txt
│   │
│   ├── 📂 routes/
│   │   ├── api.php                        # All API routes
│   │   └── console.php                    # Scheduler
│   │
│   ├── 📂 storage/
│   │   ├── 📂 app/public/
│   │   ├── 📂 framework/cache/
│   │   ├── 📂 framework/sessions/
│   │   └── 📂 framework/views/
│   │
│   ├── 📂 tests/
│   │   ├── 📂 Feature/
│   │   ├── 📂 Unit/
│   │   └── TestCase.php
│   │
│   ├── .env.example                       # Environment template
│   ├── .gitignore
│   ├── README.md                          # Full documentation
│   ├── artisan                            # CLI entry
│   ├── composer.json                      # PHP dependencies
│   ├── cpanel-htaccess                    # .htaccess for cPanel api/ folder
│   ├── phpunit.xml
│   └── setup.sh                           # ⭐ Auto setup script
│
├── 📂 src/                                ← React Frontend
│   ├── 📂 components/
│   │   ├── 📂 customers/                  # Customer-related components
│   │   ├── 📂 layout/                     # Sidebar, Dashboard layout
│   │   ├── 📂 settings/                   # Settings tab components
│   │   └── 📂 ui/                         # shadcn/ui components
│   │
│   ├── 📂 contexts/                       # Auth & Branding contexts
│   ├── 📂 hooks/                          # Custom React hooks
│   ├── 📂 integrations/supabase/          # (Legacy — not used)
│   ├── 📂 lib/                            # API client, utilities, PDF
│   ├── 📂 pages/
│   │   ├── 📂 portal/                     # Customer portal pages
│   │   └── 📂 settings/                   # Admin settings pages
│   └── main.tsx
│
├── 📂 public/                             # Static assets
│   ├── .htaccess                          # SPA routing for cPanel
│   └── placeholder.svg
│
├── .env                                   # Dev environment
├── .env.production                        # Production build config
├── cpanel-deployment-guide.md             # ⭐ বাংলা + English guide
├── index.html                             # Vite entry
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## 📊 Summary

| Component | Count |
|-----------|-------|
| Laravel Controllers | 16 |
| Laravel Services | 8 |
| Eloquent Models | 30 |
| Database Migrations | 32 |
| Form Requests | 18 |
| Middleware | 3 |
| Artisan Commands | 3 |
| Config Files | 12 |
| React Pages | 25+ |
| React Components | 40+ |
