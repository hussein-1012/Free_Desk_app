# 📊 Purchase Management System (Offline Desktop ERP)

A cross-platform, **100% offline-first** Desktop ERP application built with modern web technologies, structured under Clean Architecture principles. It facilitates Point-of-Sale (POS) checkouts, purchase invoicing, supplier/customer account statements, physical stock counts, warehouse transfers, oil change logs, laundry services, and partner profit distributions.

---

## 🛠️ Technology Stack

- **Desktop Framework**: Electron (with `electron-vite` tooling)
- **Frontend Framework**: React + TypeScript
- **Backend/Main Process**: Node.js + Express + Prisma ORM
- **Database**: SQLite (with pre-seeded default configurations)
- **State Management**: Zustand
- **Query Management**: React Query (TanStack Query)
- **Styling**: Tailwind CSS (Premium, dark-themed responsive UI)
- **Validation**: Zod (shared schemas)
- **Language Localization**: i18next (English & Arabic RTL layouts)
- **Utilities**: `jspdf` & `jspdf-autotable` (PDF invoice printing), `xlsx` (Excel importing/exporting)

---

## 🏗️ Clean Architecture Layout

The codebase separates concerns into structured directory tiers:

```
/app
├── prisma/                          # SQLite schema definitions & migrations
│   └── seed.ts                      # Initial system configurations & test users
├── resources/                       # Native desktop packaging resources
└── src/
    ├── main/                        # Electron Backend Layer (Node.js)
    │   ├── database/                # Database connections and wrappers
    │   ├── repositories/            # Direct SQLite database queries (Clean Repository pattern)
    │   ├── services/                # Complex business rules & processing layers
    │   └── ipc/                     # Secure IPC (Inter-Process Communication) event bridge
    ├── preload/                     # IPC electron preload bindings
    ├── renderer/                    # React Frontend Layer
    │   └── src/
    │       ├── components/          # Reusable components (DataTable, Modal, layouts)
    │       ├── pages/               # Feature-specific workflows (POS, Audits, Laundry)
    │       ├── store/               # Zustand global state client stores
    │       └── i18n/                # Language localization dictionaries
    └── shared/                      # Universal definitions & Zod validators
```

---

## 🚀 Key Features

1. **🔒 Local Offline Login**: Uses secure local authentication with pre-seeded users.
2. **📈 POS terminal & Barcode Scanning**: Active shopping carts, barcode scanning matching, automated tax calculations, and printable receipts.
3. **💳 Customer & Supplier statements**: Computes debit/credit running balances and prints ledger statements.
4. **📊 Interactive Reports**: Beautiful charts summarizing sales, purchases, capitals, and partner distribution statistics.
5. **🎛️ Advanced Audits & Transfers**: Physical stock auditing (sheet discrepancies) and internal warehouse transfers.
6. **👔 Specialized POS Triggers**:
   - **Laundry module**: Drop-off scheduling, washing/dry-clean prices, and status updates.
   - **Oil module**: Service dates, mileage intervals, and odometer records.
   - **Partner module**: Investment capital tracking, withdrawals, expenses, and distribution percentage shares.
7. **💾 Backup & Restore**: Creates compression-ready SQL database backups; restores backups securely in one click.

---

## ⚙️ Running & Building the Application

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [NPM](https://www.npmjs.com/)

### 1. Installation

Install all required dependencies:
```bash
npm install
```

### 2. Database Sync & Seed

Configure the local SQLite database and seed the system values (Default user is created here):
```bash
npx prisma db push
npx prisma db seed
```

*Note: This creates local database state files inside the project.*

### 3. Start Development Server

Run the compiler in development mode (spawns the Electron native desktop app):
```bash
npm run dev
```

- **Default Username**: `admin`
- **Default Password**: `admin123`

### 4. Build Production Executables

Compile the code and package the app for delivery:

```bash
# Package for Windows
npm run build:win

# Package for macOS
npm run build:mac

# Package for Linux
npm run build:linux
```

Outputs will be generated inside the `/dist` directory.
