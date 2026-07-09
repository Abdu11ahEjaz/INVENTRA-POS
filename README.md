# Inventra POS — Complete Documentation

> Full-stack MERN POS + Inventory Management System.
> React 19 + Node.js + MongoDB + Electron.
> Works **online** (MongoDB Atlas) and **fully offline** (localStorage + SQLite) — no internet required for months.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Structure](#2-project-structure)
3. [Quick Start](#3-quick-start)
4. [Environment Variables](#4-environment-variables)
5. [User Accounts & Roles](#5-user-accounts--roles)
6. [Authentication System](#6-authentication-system)
7. [All API Endpoints](#7-all-api-endpoints)
8. [Frontend ↔ Backend Integration](#8-frontend--backend-integration)
9. [Charts & Analytics Integration](#9-charts--analytics-integration)
10. [Online vs Offline Mode](#10-online-vs-offline-mode)
11. [SQLite — Local Offline Database](#11-sqlite--local-offline-database)
12. [Electron — Installable Desktop App](#12-electron--installable-desktop-app)
13. [Stock & Ledger Auto-Update System](#13-stock--ledger-auto-update-system)
14. [Export & Print Features](#14-export--print-features)
15. [User Profile Management](#15-user-profile-management)
16. [Tech Stack](#16-tech-stack)
17. [Production Quality Standards](#17-production-quality-standards)
18. [Common Issues & Fixes](#18-common-issues--fixes)

---

## 1. Project Overview

### Core Features

**Inventory Management**
- Product CRUD with SKU, category, pricing, variants (size/color)
- Cloudinary image uploads with auto-resizing
- Real-time stock status (In Stock, Low Stock, Out of Stock)
- Batch tracking with FIFO deduction on sales
- Low stock and expiry alerts

**Purchasing**
- Supplier orders (POs) with status tracking (Pending, In Transit, Received)
- Automatic stock increase when PO marked "Received"
- Multi-item PO support with batch assignment

**Sales & Invoicing**
- Fast invoice creation with product search
- Dual-print support: A4 professional invoice & 80mm thermal receipt
- FIFO automatic stock deduction & COGS calculation
- Payment status tracking (Paid, Pending, Overdue)
- Automatic ledger entries on status changes

**Financial Tracking**
- Double-entry ledger system with 8 account types
- Manual journal entries
- Profit & Loss reports with FIFO-calculated COGS
- Monthly/yearly analytics
- Gross profit & margin calculations

**Reporting & Analytics**
- Dashboard with KPI cards (revenue, profit, expenses, due invoices)
- Sales trend (monthly bar chart + profit line chart)
- Top products by revenue & quantity
- Inventory turnover analysis
- Batch age analysis for expiry tracking
- A4 export for all reports: Inventory, Invoices, Ledger, Purchases, Reports

**User Management (SuperAdmin)**
- Create/edit/delete users with role assignment
- 5-tier role system: SuperAdmin > Admin > Manager > Accountant > Sales
- Activate/deactivate accounts
- Email notifications for new users
- Password reset with secure token-based links

**User Profile**
- Edit full name, email, phone
- Profile picture upload to Cloudinary
- Account creation date display
- Real-time profile updates across sessions
- Role and account status display

**Authentication & Security**
- JWT 7-day tokens with refresh on every app start
- Bcrypt password hashing (12 rounds)
- Login rate limit (10 attempts / 15 min)
- Password reset rate limit (5 requests / hour)
- Secure token-based password reset with SHA-256 hashing
- Session persistence (no re-login on browser refresh)

**Offline Support**
- Works completely offline with localStorage
- Automatic sync when back online
- Offline action queue for batch operations
- Demo accounts for offline access
- SQLite support for Electron desktop app (persistent 10k+ record storage)

**Desktop Application**
- Electron wrapper for Windows/Mac/Linux
- System installer (.exe, .dmg, .AppImage)
- Works with zero internet connection
- Persistent database (SQLite)
- Native desktop features (system menu, dock, taskbar)

---

## 2. Project Structure

```
INVNT PORTFOLIO/
├── package.json                          ← Root: run both servers with 1 command
├── README.md                             ← This file
│
├── inventra-frontend/                    ← React 19 + Vite 8 + Tailwind CSS v4
│   ├── .env                              ← VITE_API_URL (remove for offline)
│   ├── src/
│   │   ├── api/axios.jsx                 ← Axios instance, JWT interceptor
│   │   ├── context/AuthContext.jsx       ← Login, logout, token validation
│   │   ├── hooks/
│   │   │   ├── useAuth.js                ← Auth state
│   │   │   ├── useProducts.js            ← Inventory CRUD
│   │   │   ├── useSuppliers.js           ← Suppliers CRUD
│   │   │   ├── usePurchases.js           ← Purchase orders
│   │   │   ├── useInvoices.js            ← Sales invoices
│   │   │   ├── useLedger.js              ← Ledger entries
│   │   │   ├── useAnalytics.js           ← Dashboard analytics
│   │   │   └── useCurrency.js            ← Currency formatting
│   │   ├── services/
│   │   │   ├── productService.js         ← API + offline fallback
│   │   │   ├── supplierService.js
│   │   │   ├── purchaseService.js
│   │   │   ├── invoiceService.js
│   │   │   ├── ledgerService.js
│   │   │   ├── userService.js
│   │   │   └── salesService.js
│   │   ├── store/dataStore.js            ← localStorage offline database
│   │   ├── utils/
│   │   │   └── exportUtils.js            ← A4 export for all reports
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── SignInPage.jsx
│   │   │   │   ├── ForgotPasswordPage.jsx
│   │   │   │   └── ResetPasswordPage.jsx
│   │   │   ├── superadmin/SuperAdminDashboard.jsx
│   │   │   ├── dashboard/DashBoardPage.jsx
│   │   │   ├── inventory/InventoryPage.jsx
│   │   │   ├── suppliers/SuppliersPage.jsx
│   │   │   ├── purchases/PurchasesPage.jsx
│   │   │   ├── invoices/InvoicesPage.jsx
│   │   │   ├── ledger/LedgerPage.jsx
│   │   │   ├── reports/ReportsPage.jsx
│   │   │   ├── sales/SalesPage.jsx
│   │   │   ├── staff/StaffPage.jsx
│   │   │   ├── profile/ProfilePage.jsx    ← User profile management
│   │   │   └── settings/SettingsPage.jsx
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── PageHeader.jsx
│   │   │   │   ├── InvoiceReceipt.jsx     ← A4 invoice template
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── UserAvatar.jsx         ← Profile picture display
│   │   │   ├── layout/
│   │   │   │   ├── TopBar.jsx             ← Search, profile dropdown, logout
│   │   │   │   └── Sidebar.jsx            ← Navigation menu
│   │   │   └── ui/                        ← 46 shadcn/ui components
│   │   └── routes/appRoutes.jsx           ← Lazy-loaded routes, auth guards
│
└── inventra-backend/                     ← Node.js + Express 5 + MongoDB
    ├── .env
    └── src/
        ├── config/
        │   ├── db.js                      ← MongoDB connection
        │   ├── cloudinary.js              ← Image upload helpers
        │   ├── mail.js                    ← Nodemailer (lazy transporter)
        │   ├── sqlite.js                  ← SQLite connection helper
        │   └── seedSuperAdmin.js          ← Auto-creates SuperAdmin on first start
        ├── controllers/
        │   ├── authController.js          ← Login, register, password reset, profile
        │   ├── userController.js          ← User CRUD
        │   ├── productController.js       ← Inventory CRUD
        │   ├── supplierController.js      ← Suppliers CRUD
        │   ├── purchaseController.js      ← Purchase orders
        │   ├── invoiceController.js       ← Sales invoices
        │   ├── ledgerController.js        ← Journal entries
        │   ├── analyticsController.js     ← Dashboard data
        │   ├── reportsController.js       ← Export data
        │   └── userManagementController.js ← SuperAdmin user management
        ├── middleware/
        │   ├── authMiddleware.js          ← JWT verification
        │   ├── roleMiddleware.js          ← Role-based access control
        │   ├── permissionMiddleware.js    ← Feature-level permissions
        │   ├── errorMiddleware.js         ← Global error handler
        │   └── uploadMiddleware.js        ← Multer + Cloudinary upload
        ├── models/
        │   ├── User.js                    ← User schema with role & profile
        │   ├── Product.js                 ← Inventory schema with variants
        │   ├── Supplier.js                ← Supplier schema
        │   ├── Purchase.js                ← Purchase order schema
        │   ├── InventoryBatch.js          ← FIFO batch tracking
        │   ├── Invoice.js                 ← Invoice schema with COGS calc
        │   ├── Ledger.js                  ← Double-entry ledger schema
        │   ├── AuditLog.js                ← Audit trail for compliance
        │   └── Session.js                 ← Session tracking
        ├── routes/
        │   ├── authRoutes.js              ← Auth, profile, password reset
        │   ├── userRoutes.js              ← User CRUD
        │   ├── productRoutes.js           ← Inventory CRUD + image upload
        │   ├── supplierRoutes.js          ← Suppliers CRUD
        │   ├── purchaseRoutes.js          ← Purchase order routes
        │   ├── invoiceRoutes.js           ← Invoice routes
        │   ├── ledgerRoutes.js            ← Ledger routes
        │   ├── analyticsRoutes.js         ← Analytics endpoints
        │   ├── reportsRoutes.js           ← Export report data
        │   ├── syncRoutes.js              ← Offline action sync
        │   └── auditLogsRoutes.js         ← Audit log viewing
        ├── services/
        │   ├── stockService.js            ← Stock increase/decrease logic
        │   ├── invoiceService.js          ← FIFO COGS calculation
        │   ├── emailService.js            ← Password reset, welcome emails
        │   ├── batchExpiryService.js      ← Expiry alert generation
        │   └── syncService.js             ← Process offline action queue
        ├── templates/
        │   └── resetPasswordTemplate.js   ← HTML email template
        ├── utils/
        │   ├── auditLogger.js             ← Audit trail logging
        │   └── validators.js              ← Input validation
        ├── app.js                         ← Express app + routes
        └── server.js                      ← Entry: DB → seed → listen
```

---

## 3. Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas (or local MongoDB)
- Cloudinary account (free tier)
- Gmail account with App Password

### Step 1 — Install dependencies
```bash
cd "e:\Abdullah Ejaz\Mern Projects\INVNT PORTFOLIO"
npm run install:all
```

### Step 2 — Configure environment files
See [Section 4](#4-environment-variables).

### Step 3 — Run both servers
```bash
npm run dev
```
- **Backend:** http://localhost:5000 (cyan output)
- **Frontend:** http://localhost:5173 (magenta output)

### Step 4 — Login
Default SuperAdmin:
- **Email:** super@inventra.com
- **Password:** SuperAdmin@123

### Other commands
```bash
npm run backend      # backend only
npm run frontend     # frontend only
npm run build        # production build
npm run install:all  # install all dependencies
```

### Run fully offline (no backend, no internet)
```bash
# Remove VITE_API_URL from inventra-frontend/.env
npm run frontend
# Login with offline demo account from Section 10
```


---

## 4. Environment Variables

### Backend — `inventra-backend/.env`
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/inventra

# JWT Authentication
JWT_SECRET=your_long_random_secret_key_here_at_least_32_chars
JWT_EXPIRES_IN=7d

# Cloudinary (product image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SuperAdmin Auto-Seed
SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_EMAIL=super@inventra.com
SUPER_ADMIN_PASSWORD=SuperAdmin@123

# Frontend URL (used in password reset email links)
FRONTEND_URL=http://localhost:5173

# SMTP Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16char_app_password
EMAIL_FROM=your_gmail@gmail.com
EMAIL_FROM_NAME=Inventra POS

# SQLite (optional — Electron offline database)
SQLITE_DB=./inventra.db
```

**Generate Gmail App Password:**
1. Go to myaccount.google.com
2. Security → 2-Step Verification (enable if not done)
3. Security → App Passwords
4. Select Mail + Windows Computer
5. Copy the 16-character password to EMAIL_PASS

### Frontend — `inventra-frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

**To run fully offline:**
- Delete or comment out `VITE_API_URL`
- Frontend auto-detects offline mode
- Uses localStorage + offline demo accounts

---

## 5. User Accounts & Roles

### Role Hierarchy (5 Tiers)
```
SuperAdmin (everything)
  ↓
Admin (all except user management)
  ↓
Manager (most operations, no deletion)
  ↓
Accountant (ledger & reports only)
  ↓
Sales (invoices & reports only)
```

### Default Login (auto-seeded on first backend start)
| Role | Email | Password |
|------|-------|----------|
| **SuperAdmin** | super@inventra.com | SuperAdmin@123 |

Other users created by SuperAdmin from `/superadmin`.

### Role Permissions Matrix

| Feature | SuperAdmin | Admin | Manager | Accountant | Sales |
|---------|:---:|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inventory view | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inventory create/edit | ✅ | ✅ | ✅ | ❌ | ❌ |
| Inventory delete | ✅ | ✅ | ❌ | ❌ | ❌ |
| Suppliers CRUD | ✅ | ✅ | ✅ | ❌ | ❌ |
| Purchases create | ✅ | ✅ | ✅ | ❌ | ❌ |
| Purchases mark received | ✅ | ✅ | ✅ | ❌ | ❌ |
| Invoices create | ✅ | ✅ | ✅ | ❌ | ✅ |
| Invoices delete | ✅ | ✅ | ❌ | ❌ | ❌ |
| Invoices mark paid | ✅ | ✅ | ✅ | ❌ | ✅ |
| Ledger view | ✅ | ✅ | ❌ | ✅ | ❌ |
| Ledger entries CRUD | ✅ | ✅ | ❌ | ✅ | ❌ |
| Reports & Analytics | ✅ | ✅ | ✅ | ✅ | ❌ |
| Staff management | ✅ | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| User management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Super Admin panel | ✅ | ❌ | ❌ | ❌ | ❌ |

### SuperAdmin Dashboard (`/superadmin`)
- Full user CRUD: Create, edit, deactivate users
- Assign any role to users
- View all user accounts with status
- Cannot delete SuperAdmin or change its role
- Real-time updates to MongoDB
- Session count and last login tracking

---

## 6. Authentication System

### Login Flow
```
1. User submits email + password → /signin page
2. POST /api/auth/login { email, password }
3. Backend:
   - Find user by email
   - bcrypt.compare(password, user.password)
   - Generate JWT token (expires in 7 days)
   - Return { token, user: { id, fullName, email, role, isActive, profileImage, phone } }
4. Frontend stores in localStorage:
   - "inventra_token" (used in Authorization header)
   - "inventra_user" (current user data)
5. Redirect based on role:
   - SuperAdmin → /superadmin
   - Admin/Manager → /dashboard
   - Accountant → /ledger
   - Sales → /invoices
6. All subsequent API calls include: Authorization: Bearer <token>
```

### Session Persistence (browser refresh)
On every app startup, AuthContext calls `GET /api/auth/me`:
```
Token valid → restore session, no re-login
Token expired → clear localStorage, redirect to /signin
No internet → keep localStorage session (offline mode)
```

### Password Reset Flow
```
1. User clicks "Forgot Password" on /signin
2. POST /api/auth/forgot-password { email }
3. Backend:
   - Generate random crypto token (32 bytes)
   - Hash with SHA-256, store in user.passwordResetToken
   - Set 15-minute expiry
   - Send email: http://localhost:5173/reset-password/<rawToken>
4. User clicks email link → /reset-password/:token
5. POST /api/auth/reset-password/:token { newPassword }
6. Backend:
   - Hash incoming token, find user with matching hash
   - Verify expiry not passed
   - bcrypt hash new password
   - Clear reset token
   - Auto-login user with new JWT
```

### Security Measures
- **Password hashing:** bcrypt 12 rounds (generated once, compared on login)
- **Reset tokens:** Stored as SHA-256 hash (raw token never stored)
- **Login rate limit:** 10 attempts / 15 minutes (IP-based)
- **Forgot-password limit:** 5 requests / hour (email-based)
- **Minimum password:** 8 characters (enforced backend + frontend)
- **Deactivated accounts:** Cannot login (checked in middleware)
- **JWT expiry:** 7 days automatic refresh on app start

---

## 7. All API Endpoints

**Base URL:** `http://localhost:5000/api`  
**Auth header (protected routes):** `Authorization: Bearer <jwt_token>`

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Rate Limit | Returns |
|--------|----------|------|-----------|---------|
| POST | `/auth/login` | ❌ | 10/15min | `{ token, user: { id, fullName, email, role, profileImage, phone } }` |
| GET | `/auth/me` | ✅ | — | Current authenticated user |
| POST | `/auth/forgot-password` | ❌ | 5/hr | `{ message: "Email sent" }` |
| POST | `/auth/reset-password/:token` | ❌ | — | `{ token, user: {...} }` (auto-login) |
| PUT | `/auth/profile` | ✅ | — | `{ user: {...} }` (update name, email, phone) |
| POST | `/auth/profile-image` | ✅ | — | `{ profileImage: "cloudinary_url" }` (upload to Cloudinary) |

### Users — `/api/users` *(SuperAdmin only)*
| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/users` | `[ { id, fullName, email, role, isActive, createdAt, lastLogin } ]` |
| GET | `/users/:id` | Single user object |
| POST | `/users` | Create user `{ fullName, email, password, role, isActive }` |
| PUT | `/users/:id` | Update user (password field optional) |
| DELETE | `/users/:id` | Delete user (SuperAdmin protected) |

### Products/Inventory — `/api/products` *(role-based)*
| Method | Endpoint | Auth | Body | Returns |
|--------|----------|------|------|---------|
| GET | `/products` | ✅ All | query: ?category=&status=&search= | `[ { id, name, sku, category, totalStock, image, status } ]` |
| GET | `/products/:id` | ✅ All | — | Single product with variants |
| POST | `/products` | ✅ Admin/Manager | `multipart/form-data`: name, sku, category, brand, sellingPrice, image (file), variants (JSON) | Created product |
| PUT | `/products/:id` | ✅ Admin/Manager | Same as POST, image optional | Updated product |
| DELETE | `/products/:id` | ✅ Admin | — | `{ message: "Product deleted" }` |
| PATCH | `/products/:id/stock` | ✅ Admin/Manager | `{ delta: ±10 }` | Updated product with new stock |

### Suppliers — `/api/suppliers`
| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/suppliers` | ✅ All | query: ?search= |
| GET | `/suppliers/:id` | ✅ All | — |
| POST | `/suppliers` | ✅ Admin/Manager | `{ name, contact, email, phone, address, categories[] }` |
| PUT | `/suppliers/:id` | ✅ Admin/Manager | Same fields, partial update |
| DELETE | `/suppliers/:id` | ✅ Admin | — |

### Purchases — `/api/purchases`
| Method | Endpoint | Auth | Body | Notes |
|--------|----------|------|------|-------|
| GET | `/purchases` | ✅ All | query: ?status=&supplier= | Returns all POs |
| POST | `/purchases` | ✅ Admin/Manager | `{ supplier, items[{product,qty,unitCost}], date, status, notes }` | Status = Pending by default |
| PATCH | `/purchases/:id/status` | ✅ Admin/Manager | `{ status }` | If status = "Received", triggers stock increase |
| DELETE | `/purchases/:id` | ✅ Admin | — | — |

### Invoices — `/api/invoices`
| Method | Endpoint | Auth | Body | Triggers |
|--------|----------|------|------|----------|
| GET | `/invoices` | ✅ All | query: ?status=&client= | Returns all sales invoices |
| POST | `/invoices` | ✅ Admin/Manager/Sales | `{ client, items[{product,qty,unitPrice}], date, status, notes }` | Stock decrease (FIFO) + Ledger debit "AR" |
| PATCH | `/invoices/:id/status` | ✅ Admin/Manager | `{ status }` | If status = "Paid", adds Ledger credit "Cash" |
| DELETE | `/invoices/:id` | ✅ Admin | — | Stock restored, ledger reversed |

### Ledger — `/api/ledger`
| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/ledger` | ✅ All | query: ?account=&from=&to=&refType= |
| POST | `/ledger` | ✅ Admin | `{ account, description, debit, credit, date, refType, refId }` |
| DELETE | `/ledger/:id` | ✅ Admin | — |

### Analytics — `/api/analytics`
| Method | Endpoint | Auth | Query | Returns |
|--------|----------|------|-------|---------|
| GET | `/analytics/dashboard` | ✅ All | — | `{ totalRevenue, totalCOGS, grossProfit, netProfit, totalExpenses, invoiceDue }` |
| GET | `/analytics/sales-trend` | ✅ All | ?year=2025 | `[ { month, sales, purchase, profit } ]` (12 months) |
| GET | `/analytics/top-products` | ✅ All | ?limit=5 | `[ { name, sku, totalQty, totalRevenue, grossProfit } ]` |
| GET | `/analytics/inventory-valuation` | ✅ All | — | `{ items: [...], totalValue }` |
| GET | `/analytics/profit-loss` | ✅ All | ?from=&to= | `{ totalRevenue, totalCOGS, grossProfit, netProfit }` |

### Reports/Export — `/api/reports`
| Method | Endpoint | Auth | Query | Returns |
|--------|----------|------|-------|---------|
| GET | `/reports/inventory` | ✅ All | — | All inventory data formatted for export |
| GET | `/reports/invoices` | ✅ All | — | All invoices formatted for export |
| GET | `/reports/ledger` | ✅ All | — | All ledger entries formatted for export |
| GET | `/reports/purchases` | ✅ All | — | All purchase orders formatted for export |

### Sync — `/api/sync` *(offline action queue)*
| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/sync` | ✅ All | `{ actions: [ { type: "CREATE_PRODUCT", payload: {...} }, ... ] }` |

---

## 14. Export & Print Features

### Invoice Printing (Dual Mode)

**Feature: Two print buttons in invoices table**

#### Button 1: A4 Professional Invoice
- **Icon:** Printer icon
- **Print width:** 210mm (A4 standard)
- **Style:** Professional invoice with company branding, line items, totals, thank you note
- **Triggered by:** Clicking Printer icon in invoice row OR "Print Invoice" button in preview
- **Output:** Ready for standard printers, saves to PDF

#### Button 2: 80mm Thermal Receipt
- **Icon:** Receipt icon
- **Print width:** 80mm (thermal receipt standard)
- **Style:** Compact receipt with condensed items, dashed separators, monospace font
- **Triggered by:** Clicking Receipt icon in invoice row OR "Print Receipt" button in preview
- **Output:** Ready for POS thermal printers

**Implementation:** Both buttons use `printWindow.open()` with embedded CSS, press `Ctrl+P` automatically.

### A4 Report Exports

**Feature: Export buttons on all data pages generate complete A4 PDFs**

#### Supported Exports
1. **Inventory Report** (`/inventory` page)
   - All products with variants, stock levels, pricing, valuation, status
   - Calculates: total products, total inventory value, low stock count, out of stock count
   - Shows batch breakdown for each product

2. **Sales Invoices Report** (`/invoices` page)
   - All invoices with client, dates, amounts, COGS, profit, status badges
   - Calculates: total invoices, total amount, paid/pending ratio
   - Color-coded status (green=Paid, yellow=Pending, red=Overdue)

3. **Ledger Report** (`/ledger` page)
   - All journal entries with date, account, description, debit/credit, running balance
   - Calculates: total debit, total credit, final balance
   - Running balance recalculated for each row

4. **Purchases Report** (`/purchases` page)
   - All purchase orders with supplier, reference number, date, items count, amount, status
   - Calculates: total purchases, total amount, count by status
   - Shows timeline of all orders

5. **Reports & Analytics** (`/reports` page)
   - Year-specific P&L summary (revenue, COGS, gross profit, gross margin %)
   - Top 10 products by revenue with units sold and profit
   - Monthly sales trend data
   - Generated timestamp and year selector

#### Export Technical Details
- **Format:** Standalone HTML with embedded CSS (no external dependencies in print window)
- **Styling:** Full color with `print-color-adjust: exact` for production printers
- **Page layout:** A4 (210×297mm) with 10mm margins
- **Fonts:** Arial for readability, monospace for tables
- **Headers:** Blue gradient (#4f46e5) with company branding
- **Tables:** Alternating row colors for readability, bold totals
- **Output:** User presses Ctrl+P or clicks browser Print button to save as PDF or print physically

#### How to Use Export
1. Go to any data page (Inventory, Invoices, Ledger, Purchases, Reports)
2. Click **"Export"** button (top right, blue outline)
3. System generates A4 document, opens print preview automatically
4. Click **Print** button:
   - To printer: Select printer + click Print
   - To PDF: Select "Save as PDF" + click Print
5. Document saves with timestamp and all data

### Code Examples

**Frontend: Trigger export from component**
```javascript
import { exportInventory, exportInvoices, exportLedger, exportPurchases, exportReports } from "@/utils/exportUtils";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";

export function InventoryPage() {
  const { data: products = [] } = useProducts();
  const { symbol } = useCurrency();

  const handleExport = () => {
    if (products.length === 0) {
      toast.error("No products to export");
      return;
    }
    exportInventory(products, symbol);
    toast.success("Inventory export ready for printing");
  };

  return (
    <Button onClick={handleExport} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
}
```

**Backend: Provide export-formatted data (optional optimization)**
```javascript
// GET /api/reports/inventory returns data already formatted for export
router.get("/inventory", protect, asyncHandler(async (req, res) => {
  const products = await Product.find()
    .populate("supplier", "name")
    .select("name sku category brand totalStock sellingPrice lastPurchasePrice inventoryValue status variants");
  
  // Frontend receives clean data, exportUtils.js handles HTML generation
  res.json(products);
}));
```

---

## 15. User Profile Management

### Profile Page (`/profile`)

**Features:**
- **Edit Profile:** Full name, email, phone number
- **Profile Picture:** Upload to Cloudinary with preview
- **Account Info:** Current role, account status, account creation date
- **Real-time sync:** Changes reflect immediately across sessions

### Implementation Details

**Frontend: ProfilePage.jsx**
```javascript
// Components:
- Profile picture input + preview (fallback to initials)
- Text inputs for name, email, phone
- Read-only display: role, status, created date
- Save button with loading state
- Success/error toasts

// Data flow:
1. useAuth hook provides current user
2. useEffect syncs formData when user changes
3. PUT /auth/profile updates profile fields
4. POST /auth/profile-image uploads image to Cloudinary
5. AuthContext updates stored user in localStorage
6. TopBar re-renders with new profile picture
```

**Backend: authController.js**
```javascript
// updateProfile (PUT /api/auth/profile)
- Validates fullName, email, phone format
- Updates user document
- Returns updated user (no password field)
- Triggers audit log entry

// updateProfileImage (POST /api/auth/profile-image)
- Accepts multipart form: image file
- Uploads to Cloudinary via multer memory storage
- Returns cloudinary_url
- Updates user.profileImage in MongoDB
```

**Profile Picture Display in TopBar:**
```javascript
// UserAvatar component:
- Shows profile image if available
- Falls back to user initials with role-based color
- Displays in TopBar next to profile dropdown
- Updates immediately when profileImage changes
- Optimized with lazy loading
```

### Data Model

**User schema fields:**
```javascript
{
  id: ObjectId,
  fullName: String,
  email: String (unique),
  password: String (hashed, select: false),
  phone: String,
  role: String (SuperAdmin|Admin|Manager|Accountant|Sales),
  isActive: Boolean,
  profileImage: String (Cloudinary URL),
  createdAt: Date,
  lastLogin: Date,
  passwordResetToken: String (SHA-256 hash),
  passwordResetExpires: Date,
}
```

### API Endpoints

| Method | Endpoint | Auth | Body | Returns |
|--------|----------|------|------|---------|
| PUT | `/auth/profile` | ✅ | `{ fullName, email, phone }` | `{ user: {...} }` |
| POST | `/auth/profile-image` | ✅ | `multipart/form-data`: image (file) | `{ profileImage: "url" }` |
| GET | `/auth/me` | ✅ | — | Current user with all fields |

---

## 16. Stock & Ledger Auto-Update System

### Purchase Order → Stock Increase

**When:** Purchase marked as "Received"  
**Action:**  
```
Purchase.status = "Received" (webhook/pre-save)
  → For each item in purchase.items:
     - Find Product by item.product
     - inventory.quantity += item.qty
     - Create InventoryBatch (FIFO tracking for later COGS)
  → Create Ledger entry:
     - Account: "Inventory"
     - Type: Debit
     - Amount: PO total
     - Reference: Purchase ID
  → Send notification to Admin
```

### Invoice → Stock Decrease & COGS Calculation

**When:** Invoice created with product items  
**Action:**  
```
Invoice.save() (pre-save hook)
  → For each item in invoice.items (where item.product exists):
     - Find Product
     - Check inventory.quantity >= item.qty
     - If insufficient: throw error, don't create invoice
     - Deduct using FIFO batches:
        * Find oldest InventoryBatch for this product
        * Deduct item.qty from batch.remainingQuantity
        * Calculate COGS as: qty * batch.purchasePrice
        * Sum all COGS for this item
     - Update invoice.items[].totalCost = COGS
     - inventory.quantity -= item.qty
     - Update inventory.status based on new quantity
  → Calculate totals:
     - invoice.amount = sum of all item.total (revenue)
     - invoice.totalCost = sum of all COGS
     - invoice.grossProfit = amount - totalCost
  → Create Ledger entry:
     - Account: "Accounts Receivable"
     - Type: Debit
     - Amount: invoice.amount
     - Reference: Invoice ID
```

### Invoice Status Change → Ledger Entry

**When:** Invoice marked as "Paid"  
**Action:**  
```
PATCH /api/invoices/:id/status { status: "Paid" }
  → Create Ledger entry:
     - Account: "Cash"
     - Type: Credit (reverses AR)
     - Amount: invoice.amount
     - Reference: Invoice ID
  → Send payment received notification
```

### Manual Ledger Entry

**When:** User creates journal entry via `/ledger` page  
**Action:**  
```
POST /api/ledger
  → Validate debit + credit balance
  → Create Ledger document
  → Audit log entry
  → Update running balance
```

### Inventory Status Auto-Compute (Pre-Save Hook)

**Rule:**
```
quantity <= 0    → status = "Out of Stock"
quantity <= 10   → status = "Low Stock"
quantity > 10    → status = "In Stock"
```
Applied on every save: POST inventory, PATCH stock, Purchase received, Invoice created.

### FIFO Batch Tracking for COGS

**How it works:**
```
1. When Purchase marked "Received":
   - Create InventoryBatch document per PO line item
   - Store: productId, batchNumber, qty, purchasePrice, purchaseDate

2. When Invoice created:
   - Sort all batches for this product by purchaseDate (oldest first)
   - Deduct requested qty from first batch
   - If batch has remainder, keep it for next invoice
   - Move to next batch if first one depleted
   - Calculate COGS as sum of (qty × batch.purchasePrice)

3. Reports use this to calculate:
   - Accurate COGS per product
   - Inventory valuation (at cost, not selling price)
   - Profit correctly (revenue - accurate COGS)
```

### Important: Mongoose v9 Pre-Save Hooks

**Change from v8 to v9:** Remove `next()` callbacks.

**❌ Old (breaks in v9):**
```javascript
schema.pre("save", async function (next) {
  // do work
  next(); // throws "next is not a function" in Mongoose 9
});
```

**✅ Correct (Mongoose v9):**
```javascript
schema.pre("save", async function () {
  // do work, just return
  // Mongoose auto-calls next internally
});
```

This applies to all model pre-save hooks in:
- `Product.js`
- `Purchase.js`
- `Invoice.js`
- `Inventory.js`

---

## 17. Production Quality Standards

### Code Quality Improvements Applied

**Debug Logging Cleaned:**
- ✅ Removed 25+ debug `console.log()` statements
- ✅ Removed emoji-heavy logs from services
- ✅ Kept only meaningful error logging with `[Module]` prefix

**Comments Optimized:**
- ✅ Removed excessive visual separators
- ✅ Removed obvious comments (code is self-documenting)
- ✅ Kept only business logic explanations

**Code Organization:**
- ✅ Fixed filename typo: `InventroyPage.jsx` → `InventoryPage.jsx`
- ✅ Updated all imports to use correct filename
- ✅ Consistent file naming conventions

**Error Handling:**
- ✅ Standardized error messages format
- ✅ Removed special characters from logs
- ✅ Production-safe error displays

**Production Build:**
- ✅ Vite configured for optimal bundle size
- ✅ Lazy loading on all routes
- ✅ Image optimization (Cloudinary)
- ✅ Tree-shaking enabled
- ✅ Minification enabled

---

## 18. Common Issues & Fixes

**Q: Login fails with "Invalid email or password"**  
A: SuperAdmin is seeded from `.env` on first backend start. Default: `super@inventra.com` / `SuperAdmin@123`. Password is case-sensitive. Check MongoDB is running and seeding completed (check backend console).

**Q: Session lost on browser refresh**  
A: Fixed in latest version. `AuthContext` calls `GET /api/auth/me` on startup to validate stored JWT. If you still see this, verify:
   - `VITE_API_URL` is set correctly
   - Token is stored in localStorage under key `inventra_token`
   - Backend is running on port 5000

**Q: Frontend can't connect to backend (API errors)**  
A: Check:
   - `inventra-frontend/.env` has `VITE_API_URL=http://localhost:5000/api`
   - Restart frontend after changing `.env` (Vite doesn't reload .env changes)
   - Backend is running (`npm run backend`)
   - No firewall blocking port 5000

**Q: "next is not a function" error in backend**  
A: Mongoose v9 changed pre-save hooks. Remove `next` parameter from all pre-save handlers:
   ```javascript
   // Before (breaks):
   schema.pre("save", async function (next) { ... next(); });
   
   // After (correct):
   schema.pre("save", async function () { ... });
   ```

**Q: Purchase created but stock not updated**  
A: Stock only increases when status = `Received`. Check that:
   - Purchase was marked as "Received" (not left as Pending)
   - PATCH `/api/purchases/:id/status` was called with `{ status: "Received" }`
   - MongoDB write succeeded (check backend logs)

**Q: Invoice created but stock not deducted**  
A: Stock only decreases for items with a real product selected:
   - Custom items (no product reference) don't affect stock
   - Ensure "Select product" dropdown was used, not "Custom item"
   - Check product has sufficient stock
   - If insufficient, invoice creation fails with error message

**Q: Profile picture not showing in TopBar**  
A: Check:
   - Profile image uploaded successfully (toast shows success)
   - Cloudinary credentials are correct in `.env`
   - Image file size < 5MB
   - Browser cache cleared (Ctrl+Shift+Delete)
   - Refresh page to reload profile from localStorage

**Q: Password reset email not sending**  
A: Check:
   - `EMAIL_USER` and `EMAIL_PASS` set in `.env`
   - Gmail App Password used (not regular password) — must be 16 characters
   - Gmail account has 2-Factor Authentication enabled
   - Backend logs show `[Email] SMTP ready` on startup
   - Email address exists in MongoDB users collection

**Q: Images not uploading to inventory**  
A: Verify:
   - Cloudinary credentials correct in `.env`
   - File < 5MB, PNG or JPG format
   - Form field named `image` (auto-handled by controller)
   - Multer memory storage working (no disk writes needed)

**Q: Export button doesn't trigger print**  
A: Check:
   - `exportUtils.js` functions are imported in page component
   - Button has `onClick={handleExport}` handler
   - `window.open()` not blocked by browser pop-up filter (allow pop-ups for localhost:5173)
   - Try right-click → Print instead of browser menu

**Q: Dual print buttons not showing in invoices**  
A: Ensure:
   - Lucide React icon imports include `Receipt` icon
   - Both buttons rendered in invoice row:
     - Printer icon (A4 invoice)
     - Receipt icon (thermal receipt)
   - Check browser console for render errors

**Q: Charts show static mock data, not real data**  
A: Charts use mock data by default. To connect real data:
   - Create `/api/analytics/*` endpoints in backend (see Section 9)
   - Create `useAnalytics` hook with TanStack Query
   - Import real hooks in dashboard/reports pages
   - Replace mock data with hook data

**Q: Electron app shows blank screen**  
A: Verify:
   - Ran `npm run build` to create `dist/` folder
   - `electron/main.js` and `electron/preload.js` exist
   - Run `npm run electron:dev` in development (not `npm run electron:build`)
   - Check main process console for errors (Dev Tools available in dev mode)

**Q: "VITE_API_URL not defined" in offline mode**  
A: This is expected. Offline mode:
   - Remove `VITE_API_URL` from `.env` completely (or leave blank)
   - Frontend auto-detects offline and uses localStorage
   - Use offline demo accounts (see Section 10)
   - All features work, data syncs when online again

**Q: Inventory page shows "Invalid _id"**  
A: Ensure all inventory data is normalized with `getId()`:
   ```javascript
   const getId = (obj) => String(obj?._id || obj?.id || "");
   const products = rawProducts.map(p => ({ ...p, id: getId(p) }));
   ```
   Always use `product.id`, never `product._id` in JSX.

---

## Deployment Checklist

### Before Going Live

- [ ] MongoDB Atlas cluster created and secured (IP whitelist)
- [ ] Cloudinary account with API key/secret
- [ ] Gmail account with 2FA enabled and App Password generated
- [ ] Environment variables set in `.env` files (never commit .env)
- [ ] JWT_SECRET is 32+ characters, randomly generated
- [ ] SuperAdmin email/password changed from defaults
- [ ] Frontend `npm run build` succeeds with no warnings
- [ ] All routes tested (signin, all pages, logout)
- [ ] Offline mode tested (remove VITE_API_URL, test with demo accounts)
- [ ] Invoicing flow tested (create, print, export)
- [ ] Stock deduction verified (purchase + invoice)
- [ ] Ledger entries verified (auto-created + manual)
- [ ] Password reset email tested
- [ ] Profile picture upload tested
- [ ] Export buttons tested on all pages
- [ ] Dual print (A4 + thermal) tested

### Frontend Deployment

**Option 1: Vercel (Recommended for SPAs)**
```bash
npm install -g vercel
vercel login
cd inventra-frontend
vercel deploy --prod
```
Set `VITE_API_URL` in Vercel dashboard environment variables.

**Option 2: Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy --only hosting
```

**Option 3: Manual static hosting**
```bash
cd inventra-frontend
npm run build
# Upload `dist/` folder to any static host (AWS S3, GitHub Pages, Netlify, etc.)
```

### Backend Deployment

**Option 1: Render (Recommended free tier)**
- Connect GitHub repo
- Set environment variables
- Auto-deploys on push
- Free tier: ~0.5GB RAM (suitable for development)

**Option 2: Railway**
- Push to GitHub
- Connect Railway project
- Deploy with environment variables
- Includes PostgreSQL option (use MongoDB Atlas instead)

**Option 3: Fly.io**
```bash
npm install -g flyctl
fly auth login
fly launch
fly deploy
```

### Desktop (Electron) Deployment

**Build installer:**
```bash
cd inventra-frontend
npm run electron:build
```

Output:
- **Windows:** `release/Inventra POS Setup.exe` (NSIS installer)
- **Mac:** `release/Inventra POS.dmg`
- **Linux:** `release/Inventra POS.AppImage`

**Sign binaries (optional but recommended):**
- Windows: Code signing certificate required
- Mac: Developer certificate and notarization
- Linux: No signature needed

---

## Support & Contributions

### Reporting Issues
Create an issue with:
- System info (OS, Node version, MongoDB version)
- Error message and full stack trace
- Steps to reproduce
- Expected vs actual behavior

### Contributing
1. Fork the repository
2. Create feature branch: `git checkout -b feature/feature-name`
3. Commit changes: `git commit -m "Add feature"`
4. Push: `git push origin feature/feature-name`
5. Submit pull request

---

## License

Inventra POS © 2025. All rights reserved.

---

**Last Updated:** July 2025  
**Version:** 2.0.0 (Production Ready)  
**Status:** Active Development
