# Inventra POS - Full-Stack MERN System

> Enterprise-grade POS + Inventory Management System  
> **React 19** | **Node.js + Express 5** | **MongoDB** | **Electron** | **Offline-Capable**

Works completely **online** (MongoDB Atlas) or **fully offline** (localStorage + SQLite) with automatic sync.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [App Flow & User Journey](#app-flow--user-journey)
4. [Core Features](#core-features)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Key Workflows](#key-workflows)
7. [API Endpoints](#api-endpoints)
8. [Environment Setup](#environment-setup)
9. [Tech Stack](#tech-stack)

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas
- Cloudinary account (free tier)
- Outlook email account

### Installation

```bash
cd "e:\Abdullah Ejaz\Mern Projects\INVNT PORTFOLIO"
npm run install:all
```

### Run Development

```bash
npm run dev
```

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

### Login

```
Email: abdullahraj983@gmail.com
Password: SuperAdmin@123
```

### Commands

```bash
npm run backend      # backend only
npm run frontend     # frontend only
npm run build        # production build
```

---

## Project Structure

```
INVNT PORTFOLIO/
├── inventra-backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                    ← MongoDB connection
│   │   │   ├── seedSuperAdmin.js        ← Auto-creates Super Admin
│   │   │   ├── cloudinary.js            ← Image uploads
│   │   │   └── mail.js                  ← Email service
│   │   ├── controllers/
│   │   │   ├── authController.js        ← Login, password reset, profile
│   │   │   ├── productController.js     ← Inventory CRUD
│   │   │   ├── invoiceController.js     ← Sales invoices
│   │   │   ├── purchaseController.js    ← Purchase orders
│   │   │   ├── ledgerController.js      ← Journal entries
│   │   │   ├── analyticsController.js   ← Dashboard data
│   │   │   └── userController.js        ← User management
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js        ← JWT verification
│   │   │   ├── roleMiddleware.js        ← Role-based access
│   │   │   ├── errorMiddleware.js       ← Error handling
│   │   │   └── uploadMiddleware.js      ← File uploads
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Invoice.js
│   │   │   ├── Purchase.js
│   │   │   ├── Ledger.js
│   │   │   ├── InventoryBatch.js
│   │   │   ├── Supplier.js
│   │   │   └── Session.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── invoiceRoutes.js
│   │   │   ├── purchaseRoutes.js
│   │   │   ├── ledgerRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── services/
│   │   │   ├── stockService.js          ← Inventory logic
│   │   │   ├── invoiceService.js        ← FIFO COGS calculation
│   │   │   ├── emailService.js          ← Email sending
│   │   │   └── syncService.js           ← Offline sync
│   │   └── server.js                    ← Entry point
│   └── .env
│
├── inventra-frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.jsx                ← Axios instance, interceptors
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          ← Auth state
│   │   │   └── CurrencyContext.jsx      ← Currency management
│   │   ├── hooks/
│   │   │   ├── useAuth.js               ← Auth state hook
│   │   │   ├── useProducts.js           ← Inventory data
│   │   │   ├── useInvoices.js           ← Sales data
│   │   │   ├── usePurchases.js          ← Purchase data
│   │   │   └── useAnalytics.js          ← Dashboard data
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── SignInPage.jsx
│   │   │   │   ├── ForgotPasswordPage.jsx
│   │   │   │   └── ResetPasswordPage.jsx
│   │   │   ├── dashboard/DashBoardPage.jsx
│   │   │   ├── inventory/InventoryPage.jsx
│   │   │   ├── invoices/InvoicesPage.jsx
│   │   │   ├── purchases/PurchasesPage.jsx
│   │   │   ├── suppliers/SuppliersPage.jsx
│   │   │   ├── ledger/LedgerPage.jsx
│   │   │   ├── reports/ReportsPage.jsx
│   │   │   ├── sales/SalesPage.jsx
│   │   │   ├── profile/ProfilePage.jsx
│   │   │   └── settings/SettingsPage.jsx
│   │   ├── components/
│   │   │   ├── common/                  ← Reusable components
│   │   │   ├── layout/
│   │   │   │   ├── TopBar.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   └── ui/                      ← 46 shadcn/ui components
│   │   ├── utils/
│   │   │   ├── exportUtils.js           ← PDF exports
│   │   │   └── helpers.js
│   │   └── services/
│   │       ├── productService.js
│   │       ├── invoiceService.js
│   │       └── ...
│   └── .env
│
└── README.md
```

---

## App Flow & User Journey

### 1. Authentication Flow

```
User → Sign In Page
  ↓
Enter Email & Password
  ↓
POST /api/auth/login
  ↓
Backend:
  - Verify user exists & not deleted
  - Check account not locked (after 5 failed attempts)
  - bcrypt compare password
  - Generate JWT token (1 day expiry)
  - Create session with device info
  ↓
Frontend receives token + user data
  ↓
Store in localStorage:
  - "inventra_token" (JWT)
  - "inventra_user" (user object)
  ↓
Redirect based on role:
  - SuperAdmin → /superadmin
  - Admin/Manager → /dashboard
  - Accountant → /ledger
  - Sales → /invoices
```

### 2. Session Persistence

```
App starts
  ↓
AuthContext checks:
  - Token in localStorage?
  - Token valid?
  ↓
Yes → GET /api/auth/me
  ↓
Backend validates JWT:
  - Decode token
  - Find user
  - Check not deleted/deactivated
  ↓
Return user data
  ↓
User stays logged in, no re-entry needed
```

### 3. Password Reset Flow

```
User → Sign In → "Forgot Password"
  ↓
Enter email
  ↓
POST /api/auth/forgot-password
  ↓
Backend:
  - Find user by email
  - Generate crypto token (32 bytes)
  - Hash with SHA-256
  - Store hash + 15-min expiry
  - Send email with reset link
  ↓
Email contains reset link:
  http://localhost:5173/reset-password/{rawToken}
  ↓
User clicks link → /reset-password/:token
  ↓
User enters new password
  ↓
POST /api/auth/reset-password/:token
  ↓
Backend:
  - Hash incoming token
  - Find user with matching hash
  - Verify not expired
  - bcrypt hash new password
  - Clear reset token
  - Auto-login (return JWT)
  ↓
Frontend redirects to dashboard
```

---

## Core Features

### 📊 Inventory Management

**Products**
- CRUD operations with variants (size, color)
- SKU, category, pricing
- Cloudinary image uploads
- Real-time stock status (In Stock, Low Stock, Out of Stock)
- Batch tracking with FIFO deduction

**Stock Control**
- Track stock levels
- Low stock alerts
- Batch-based FIFO tracking
- Automatic stock updates on sales

### 🛒 Sales & Invoicing

**Invoice Creation**
1. Click "New Invoice"
2. Select client/buyer
3. Add products (search by name/SKU)
4. System shows stock available
5. Enter quantity needed
6. Price calculated from product
7. Review totals (subtotal, tax, total)
8. Save invoice

**Invoice Effects**
- Stock automatically decreases (FIFO)
- COGS calculated from batch cost
- Ledger entries created:
  - Debit: Accounts Receivable (AR)
  - Credit: Sales Income
- Payment tracking: Paid / Pending / Overdue

**Invoice Status Workflow**
```
Pending → (mark paid) → Paid
         ↓
      Overdue
```

**Printing**
- A4 Professional Invoice (standard printer)
- 80mm Thermal Receipt (POS receipt printer)

### 📦 Purchasing

**Purchase Order (PO) Creation**
1. Click "New Purchase"
2. Select supplier
3. Add products & quantities
4. Enter unit cost
5. Review total PO amount
6. Status: Pending (by default)

**PO Status Workflow**
```
Pending → In Transit → Received → (stock increases)
```

**When PO Marked "Received"**
- Stock increases for all items
- Inventory Batch created (FIFO tracking)
- Ledger entries:
  - Debit: Inventory
  - Credit: Accounts Payable (AP)

### 💰 Financial Tracking

**Ledger (Journal Entries)**
- Double-entry system
- 8 account types:
  - Assets: Cash, AR, Inventory
  - Liabilities: AP, Loans
  - Equity: Capital
  - Income: Sales, Other Income
  - Expenses: COGS, Operating, Depreciation

**Manual Entries**
- Accountants can create manual journal entries
- Each entry requires:
  - Account (debit & credit)
  - Amount
  - Description
  - Reference

**P&L Reports**
- Revenue (from invoices)
- COGS (from FIFO batches)
- Gross Profit = Revenue - COGS
- Expenses (from ledger)
- Net Profit = Gross Profit - Expenses

### 📈 Analytics & Reports

**Dashboard KPIs**
- Total Revenue (this period)
- Total Profit (calculated)
- Total Expenses (from ledger)
- Invoices Due (pending payments)

**Charts**
- Monthly Sales Trend (bar chart)
- Profit Line (overlay)
- Top Products by Revenue
- Inventory Valuation

**Exports**
All pages support A4 PDF export:
- Inventory report
- Sales report
- Ledger report
- Purchase report
- Analytics report

---

## User Roles & Permissions

### Role Hierarchy

```
SuperAdmin
  ├─ All features
  └─ User management
      
Admin
  ├─ All features except user management
  
Manager
  ├─ Inventory CRUD
  ├─ Purchase orders
  ├─ Invoices
  ├─ Cannot delete anything
  
Accountant
  ├─ Ledger view & entries
  ├─ Reports & analytics
  
Sales
  ├─ Create invoices
  ├─ View inventory
  ├─ Cannot create purchases
```

### Permission Matrix

| Feature | SuperAdmin | Admin | Manager | Accountant | Sales |
|---------|:---:|:---:|:---:|:---:|:---:|
| Inventory view | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inventory create/edit | ✅ | ✅ | ✅ | ❌ | ❌ |
| Inventory delete | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create invoices | ✅ | ✅ | ✅ | ❌ | ✅ |
| Delete invoices | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create purchases | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ledger entries | ✅ | ✅ | ❌ | ✅ | ❌ |
| View reports | ✅ | ✅ | ✅ | ✅ | ❌ |
| User management | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Key Workflows

### Workflow 1: Complete Sales Cycle

```
Step 1: Check Inventory
  - Go to /inventory
  - Search product
  - Verify stock available

Step 2: Create Invoice
  - Go to /invoices
  - Click "New Invoice"
  - Select client
  - Add product + quantity
  - Review total

Step 3: Process Payment
  - Mark invoice as "Paid"
  - Ledger updates automatically
  - Stock reduced (FIFO)
  - COGS calculated

Step 4: View Reports
  - Go to /reports
  - See revenue impact
  - Check profit/loss
  - Export for accounting
```

### Workflow 2: Complete Purchase Cycle

```
Step 1: Order From Supplier
  - Go to /purchases
  - Click "New Purchase"
  - Select supplier
  - Add products + costs
  - Save as "Pending"

Step 2: Receive Goods
  - Receive physical goods
  - Mark purchase as "Received"
  - Stock increases automatically
  - Inventory batch created

Step 3: Verify Inventory
  - Go to /inventory
  - See stock increased
  - Batch tracking visible
  - FIFO deduction ready

Step 4: Track in Ledger
  - Go to /ledger
  - See AP (Accounts Payable) entry
  - Verify amount matches PO
```

### Workflow 3: User Management (SuperAdmin Only)

```
Step 1: Create User
  - Go to /superadmin
  - Click "Create User"
  - Enter email, name, password
  - Assign role (Admin, Manager, etc.)
  - Send invite email

Step 2: User Receives Email
  - Email contains:
    - Login credentials
    - Password (temporary)
    - Dashboard link

Step 3: User First Login
  - Visit link from email
  - Enter credentials
  - Prompted to change password
  - Redirected to dashboard

Step 4: Manage Users
  - View all users in /superadmin
  - See last login, sessions
  - Edit role anytime
  - Deactivate accounts
```

---

## API Endpoints

**Base URL**: `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/auth/login` | ❌ | User login |
| GET | `/auth/me` | ✅ | Current user |
| POST | `/auth/forgot-password` | ❌ | Request password reset |
| POST | `/auth/reset-password/:token` | ❌ | Reset password |
| PUT | `/auth/profile` | ✅ | Update profile |
| POST | `/auth/profile-image` | ✅ | Upload profile picture |

### Products (Inventory)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/products` | ✅ | List all products |
| GET | `/products/:id` | ✅ | Get product details |
| POST | `/products` | ✅ | Create product |
| PUT | `/products/:id` | ✅ | Update product |
| DELETE | `/products/:id` | ✅ | Delete product |
| PATCH | `/products/:id/stock` | ✅ | Update stock |

### Suppliers

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/suppliers` | ✅ | List suppliers |
| POST | `/suppliers` | ✅ | Create supplier |
| PUT | `/suppliers/:id` | ✅ | Update supplier |
| DELETE | `/suppliers/:id` | ✅ | Delete supplier |

### Purchases (POs)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/purchases` | ✅ | List purchase orders |
| POST | `/purchases` | ✅ | Create PO |
| PATCH | `/purchases/:id/status` | ✅ | Update PO status |
| DELETE | `/purchases/:id` | ✅ | Delete PO |

### Invoices (Sales)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/invoices` | ✅ | List invoices |
| POST | `/invoices` | ✅ | Create invoice |
| PATCH | `/invoices/:id/status` | ✅ | Update payment status |
| DELETE | `/invoices/:id` | ✅ | Delete invoice |

### Ledger

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/ledger` | ✅ | View journal entries |
| POST | `/ledger` | ✅ | Create manual entry |
| DELETE | `/ledger/:id` | ✅ | Delete entry |

### Analytics

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/analytics/dashboard` | ✅ | Dashboard KPIs |
| GET | `/analytics/sales-trend` | ✅ | Monthly sales data |
| GET | `/analytics/top-products` | ✅ | Top products by revenue |
| GET | `/analytics/profit-loss` | ✅ | P&L summary |

### Reports

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/reports/inventory` | ✅ | Inventory export data |
| GET | `/reports/invoices` | ✅ | Invoice export data |
| GET | `/reports/ledger` | ✅ | Ledger export data |
| GET | `/reports/purchases` | ✅ | Purchase export data |

### Users

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/users` | ✅ | List all users (SuperAdmin) |
| POST | `/users` | ✅ | Create user (SuperAdmin) |
| PUT | `/users/:id` | ✅ | Update user (SuperAdmin) |
| DELETE | `/users/:id` | ✅ | Delete user (SuperAdmin) |

---

## Environment Setup

### Backend — `inventra-backend/.env`

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/inventra
JWT_SECRET=your_secret_key_here_32_chars_minimum
JWT_EXPIRES_IN=1d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Super Admin
SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_EMAIL=abdullahraj983@gmail.com
SUPER_ADMIN_PASSWORD=SuperAdmin@123

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your_outlook@outlook.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_outlook@outlook.com
EMAIL_FROM_NAME=Inventra POS
```

### Frontend — `inventra-frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Tech Stack

### Frontend
- **React 19** - UI library
- **Vite 8** - Build tool
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - 46 components
- **Recharts** - Analytics charts
- **Sonner** - Toast notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image uploads
- **Nodemailer** - Email service

### Deployment
- **Render** - Backend hosting
- **Vercel** - Frontend hosting
- **GitHub** - Version control

---

**Version**: 1.0.0  
**Last Updated**: July 11, 2026
