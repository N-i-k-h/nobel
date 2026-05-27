# Nobel Alloy - Manufacturing Workflow Management System
## User & Administrator Reference Guide

Welcome to the **Nobel Alloy Workflow Management System**. This guide provides system administrators and operators with the instructions required to deploy, operate, manage, and monitor manufacturing batches, operations, and analytical reporting.

---

## 1. Getting Started & Deployment Details

The Nobel Alloy application is a modern, production-hardened web application built with a React frontend and an Express/Node.js backend connected to MongoDB.

- **Vite Dev Server (Frontend)**: `http://localhost:5173`
- **Express Backend Server**: `http://localhost:5000`

---

## 2. Default System Credentials

The application uses role-based access control (RBAC) to restrict and secure sensitive endpoints.

> [!IMPORTANT]
> Below are the default seeded credentials. Use these to access the system for initial verification.

### 🔑 Super Administrator Credentials
* **Email Address**: `admin@nobel.com`
* **Default Password**: `admin123`
* **Role**: `admin`

### ⚙️ Production Custom Seeding
To seed custom credentials, configure these environment variables inside your backend `.env` file before running the seed script (`node seed.js`):
```env
ADMIN_EMAIL=your-custom-email@domain.com
ADMIN_INITIAL_PASSWORD=your-secure-password
```
If `ADMIN_INITIAL_PASSWORD` is omitted, the seeding utility will automatically generate a cryptographically secure 16-character password and display it once in the console.

---

## 3. System Roles & Authorizations

| Role | Access Level | Description |
| :--- | :--- | :--- |
| **Admin** | **Full Privilege** | Create & manage products, assign jobs to operators, generate route cards, organize packaging bags, view system-wide audit logs, and download analytical reports. |
| **Operator** | **Limited Privilege** | Access a personalized dashboard showing active work assignments. Operators can log work outputs, record machine counters, and report raw rejects. |

---

## 4. Key System Workflows

### Step 1: Product Map Definition
1. Log in as an **Admin**.
2. Navigate to the **Products** section.
3. Define a new product (e.g. Alloy grades) and map its sequential processing steps (e.g., *Melting*, *Extrusion*, *Cutting*, *QA*, *Packing*).

### Step 2: Work Assignments
1. Under the **Assignments** dashboard, click **Create Assignment**.
2. Assign a specific operator to a product and step, targeting a specific date, shift, and quantity quota.
3. The operator can log into their portal to view and update progress logs.

### Step 3: Generating Route Cards
1. Go to the **Route Cards** section and click **Generate Route Card**.
2. Select the product, target batch details, and select dates using the interactive **Calendar Picker**.
3. *Note:* You can input multiple dates (e.g., multi-day run) to track batch throughput dynamically.
4. Route cards are saved to the database and persist across page refreshes. Click **Download PDF** to export a layout copy.

### Step 4: Shipping Bags & Operator Traceability
1. Under the **Bags** section, click **Pack Bag**.
2. Select multiple Route Cards using checkboxes to combine them into a single shipping bag.
3. In the bag details view, the system dynamically cross-references the cards against master logs to compile **Live Operator Traceability** statistics (calculating who processed which steps and the resulting yield quantities).

### Step 5: Analytical Reports
1. Go to the **Reports** section.
2. Select from the tabs: *Operator*, *Production*, *Rejections*, *Process*, *Card*, or *Bag*.
3. Use filters to sort by dates or shifts.
4. Click **Export PDF** or **Export Excel** to save the formatted report.

---

## 5. Security & Infrastructure Hardening

The Nobel Alloy application implements state-of-the-art security features to protect your data in production environments:

- **Credential Hashing**: Uses high-complexity **12-round bcrypt salt encryption** for all passwords.
- **Session Protection**: JWT authorization tokens are limited to an **8-hour expiration window** to minimize hijacked session risks.
- **Brute-Force Defense**: Built-in **Rate Limiters** restrict users to 5 login attempts per 15 minutes and 100 global API requests per 15 minutes.
- **Denial of Service (DoS) Defense**: Enforces a strict **10KB body size limit** on all incoming API JSON payloads.
- **Secure Headers**: Utilizes `helmet` middleware to inject frame protection (preventing clickjacking), HSTS (forcing HTTPS), CSP controls, and strips headers like `X-Powered-By`.
- **Proxy Configuration**: Supports `trust proxy` in production to safely process forwarder IP mappings.
- **Security Validation**: Includes a private verification script (`test_security.js`) using a secure, token-protected header bypass to run end-to-end integration tests without hitting rate limit blocks.
