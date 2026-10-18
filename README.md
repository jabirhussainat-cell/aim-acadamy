# AIM Martial Arts Academy — Management & Test Registration Platform

A production-grade, enterprise web application built using **Next.js (App Router, React 19, TypeScript, Tailwind CSS v4)**, **MongoDB Atlas (Mongoose)**, and **Razorpay Payment Gateway** for martial arts academy operations, student directory, affiliated unit management, standardized belt testing, automated commission accounting, and result publication.

Official Contact: **8943839386** | Email: **info@aimacademy.org**

---

## 🥋 Core Architecture & Portals

The platform is partitioned into four major modules:

1. **Public Homepage (`/`)**
   - High-polish responsive showcase of the martial arts organization.
   - Disciplines offered (Karate-Do, Taekwondo, Kung Fu / Wushu, Kickboxing) and belt grading overview.
   - Instructional leadership (Grandmasters and certified instructors).
   - Core philosophy, values, and training benefits.
   - Contact section with telephone number **8943839386** and headquarters address.
   - CMS editable via Super Admin control panel.

2. **Super Admin Control Center (`/admin`)**
   - Centralized management accessible by exactly **4 bootstrapped Super Admin accounts**.
   - Live MongoDB analytics and Recharts (student admissions growth, unit student distribution, belt rank distribution, revenue trends, pass/fail ratios).
   - Student directory across all units: search, filtering, auto-generated registration numbers (`AIM-YYYY-XXXX`), dynamically computed age from DOB, printable student cards.
   - Unit management: provisioning affiliated dojos with auto-generated unit codes (`UNIT-XXX`) and secure login accounts.
   - Belt Testing event lifecycle: draft, upcoming, registration open, closed, completed.
   - Central examination results entry: marks, Pass/Fail/Absent statuses, board publication, and automatic belt rank promotion preserving historical records.
   - Financial accounting: gross collections, unit commissions accrued (10%), and headquarters net share.
   - Website CMS and organization settings (default fee ₹400, default commission 10%).
   - Immutable audit trail (`/admin/audit-logs`).

3. **Unit Management Portal (`/unit`)**
   - Scoped strictly to the authenticated Unit's data (enforced server-side).
   - Unit dashboard: total students, active practitioners, open test opportunities, amount paid, and commission earned.
   - Multi-step Test Registration & Checkout Workflow:
     - **Step 1**: Select an open test event.
     - **Step 2**: Select existing unit students (no re-entering student details!).
     - **Step 3**: Select target belt rank attempted per student.
     - **Step 4**: Authoritative server calculation (e.g., 10 candidates × ₹400 = ₹4,000; 10% unit commission = ₹400; organization share = ₹3,600).
     - **Step 5**: Razorpay checkout & payment signature verification, instant confirmed batch generation, and printable receipts (`RCPT-YYYY-XXXX`).
   - Accrued commission ledger tracking.
   - Published results viewer and printable candidate examination result cards.

4. **Secure Backend & Database (`/api/*`, `src/lib/*`, `src/models/*`)**
   - 14 Mongoose models with strict indexes and validations.
   - Authentication via HTTP-only JWT cookies (`aim_session`) signed with HS256 (`jose`).
   - Server-side Razorpay order creation and HMAC-SHA256 signature verification.
   - Edge route middleware protecting `/admin/*` and `/unit/*`.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v20.x or higher
- npm v10.x or higher
- MongoDB connection string configured in `.env` (`MONGO_URL` or `MONGODB_URI`)

### 2. Environment Configuration
Inspect or create `.env`:
```env
# MongoDB Atlas Connection URI (retains existing variable name)
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.c92psrl.mongodb.net/?appName=Cluster0

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication JWT Secret
JWT_SECRET=aim_academy_secure_jwt_secret_key_minimum_32_characters_long

# Razorpay Payment Gateway (Test or Live credentials)
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=rzp_test_secret_placeholder
RAZORPAY_WEBHOOK_SECRET=rzp_webhook_secret_placeholder

# 4 Initial Super Admin Accounts (Used by npm run seed)
SUPER_ADMIN_1_NAME="Grand Master Chief Admin"
SUPER_ADMIN_1_EMAIL=superadmin1@aimacademy.org
SUPER_ADMIN_1_PASSWORD=AimAcademy#Super1!

SUPER_ADMIN_2_NAME="Technical Director Admin"
SUPER_ADMIN_2_EMAIL=superadmin2@aimacademy.org
SUPER_ADMIN_2_PASSWORD=AimAcademy#Super2!

SUPER_ADMIN_3_NAME="Examinations & Testing Admin"
SUPER_ADMIN_3_EMAIL=superadmin3@aimacademy.org
SUPER_ADMIN_3_PASSWORD=AimAcademy#Super3!

SUPER_ADMIN_4_NAME="Finance & Operations Admin"
SUPER_ADMIN_4_EMAIL=superadmin4@aimacademy.org
SUPER_ADMIN_4_PASSWORD=AimAcademy#Super4!
```

### 3. Database Bootstrap (No Dummy Data Policy)
Run the bootstrap seeder to initialize the 4 Super Admin accounts, standard martial arts disciplines, organization settings (default test fee: ₹400, commission: 10%), and CMS content:
```bash
npm run seed
```
*Note: In compliance with the No Dummy Data policy, no fictional students, fake transactions, or dummy test records are seeded.*

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the public website.
Visit [http://localhost:3000/login](http://localhost:3000/login) to log in.

---

## 🔑 Default Initial Login Credentials

### Super Admin Accounts
- **Super Admin 1**: `superadmin1@aimacademy.org` / `AimAcademy#Super1!`
- **Super Admin 2**: `superadmin2@aimacademy.org` / `AimAcademy#Super2!`
- **Super Admin 3**: `superadmin3@aimacademy.org` / `AimAcademy#Super3!`
- **Super Admin 4**: `superadmin4@aimacademy.org` / `AimAcademy#Super4!`

### Unit Accounts
Unit accounts are created and managed by authorized Super Admins under `/admin/units/add`. Upon creation, the unit login account is immediately provisioned with the specified email and password.

---

## 💳 Payment Gateway & Commission Accounting

- **Baseline Test Fee**: ₹400 per candidate (configurable by Super Admin in `/admin/settings`).
- **Standard Unit Commission**: 10% (configurable by Super Admin in `/admin/settings`).
- **Accounting Distinction**:
  - The commission is recorded in the official `CommissionLedger` as **Accrued/Earned** by the Unit.
  - The platform distinguishes between **Gross Fee Paid** by the unit and **Commission Earned** by the unit.
- **Server Verification**:
  - Checkout orders are generated server-side.
  - Webhooks and payment callbacks verify cryptographic HMAC signatures.
  - Frontend callbacks are never trusted as proof of payment.

---

## 🛠️ Testing, Linting & Production Build

Run the type check and production build:
```bash
npm run build
```
Start the production server:
```bash
npm start
```
Run linting:
```bash
npm run lint
```
