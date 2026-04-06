# Smart ISP — ISP Management System

> Multi-tenant ISP Billing, Customer Management, Accounting & Network Management System

---

## 📁 Repository Structure

```
├── ISP-Backend/                    ← Laravel Backend (PHP 8.2+)
│   ├── app/                        ← Models, Controllers, Services
│   ├── config/                     ← Laravel config files
│   ├── database/                   ← Migrations & Seeders
│   ├── deploy/                     ← ★ Deployment configs & scripts
│   │   ├── vps-setup.sh            ← VPS server initial setup
│   │   ├── deploy-update.sh        ← Full update (backend + frontend)
│   │   ├── nginx-smartispapp.conf  ← Nginx configuration
│   │   ├── .env.production         ← Production .env template
│   │   ├── smartisp-queue.service  ← Queue worker systemd service
│   │   └── VPS-DEPLOYMENT-GUIDE.md ← Complete VPS deployment guide
│   ├── routes/                     ← API routes
│   ├── deploy.sh                   ← Backend-only deploy script
│   ├── setup.sh                    ← cPanel interactive setup
│   └── .env.example                ← Environment template
├── src/                            ← React Frontend (TypeScript)
├── public/                         ← Static assets
├── cpanel-deployment-guide.md      ← cPanel hosting guide (বাংলা)
├── frontend-deploy-guide.md        ← Frontend build guide (বাংলা)
└── package.json
```

---

## 🚀 Deployment

### VPS (Recommended)
📖 **[ISP-Backend/deploy/VPS-DEPLOYMENT-GUIDE.md](ISP-Backend/deploy/VPS-DEPLOYMENT-GUIDE.md)**

### cPanel Shared Hosting
📖 **[cpanel-deployment-guide.md](cpanel-deployment-guide.md)**

---

## 🔑 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Super Admin | admin | admin123 |
| Super Admin | ismail | Admin@123 |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Laravel 11, PHP 8.2, MySQL 8 |
| Auth | Custom session tokens (Bearer / X-Session-Token) |
| Multi-tenant | Domain-based tenant resolution |
| Payments | bKash, Nagad |
| Network | MikroTik RouterOS API (TCP 8728) |
| SMS | GreenWeb API |
