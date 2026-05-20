# SparkClub — Multi-Tenant Club Management ERP

<div align="center">

![SparkClub](https://img.shields.io/badge/SparkClub-ERP-ff6b35?style=for-the-badge&logo=fire)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js)
![SQLite](https://img.shields.io/badge/SQLite-3.44-003b57?style=flat-square&logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**A comprehensive ERP platform for college club management — financial governance, event tracking, student development, and team collaboration.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Project Structure](#-project-structure) • [Contributing](#-contributing)

</div>

---

## What is SparkClub?

SparkClub is a production-ready **multi-tenant ERP platform** designed for college club management. Built with a focus on institutional financial governance, event coordination, and student development tracking, it provides role-based dashboards for every member of a club hierarchy — from Super Admins managing multiple institutions down to Student Members tracking their personal tasks and reimbursements.

> **Note:** This is a complete, full-stack application. Both a local dev server (Express + SQLite) and a frontend (React + Vite) need to be running simultaneously.

---

## Key Features

### 5 Role-Based Dashboards

| Role | Dashboard Highlights |
|------|---------------------|
| **Super Admin** | Multi-tenant platform management, global analytics, security settings, bulk operations |
| **Faculty Coordinator** | Institutional oversight, budget approvals, compliance monitoring, event authorization |
| **Club Head** | Executive dashboard, event proposals, team management, sponsor pipeline, document archives |
| **Treasurer** | Budget allocations, transaction ledger, funding requests, PDF/Excel reports, audit trail |
| **Student Member** | Personal task tracking, event RSVPs, reimbursement claims, attendance, performance metrics |

### Core Modules

- **Financial Management** — Category-based budgets, fiscal year planning, income/expense ledger with multi-stage approval workflows
- **Reimbursement System** — Submit claims with receipts, multi-level approval chain (pending → under_review → approved/rejected → paid), audit trail
- **Event Management** — Proposals, RSVPs, turnout tracking, task assignments, attendance records
- **Sponsorship CRM** — Pipeline stages (contacted → negotiated → committed → closed), sponsor profiles, MoU management
- **Student Development** — Merit indicators, travel grants, certificates, performance metrics
- **Audit & Compliance** — Full audit logging, fraud indicators, policy enforcement, SLA monitoring
- **Document Management** — Upload, version control, MoU archives, bill storage
- **Analytics & Reporting** — Recharts visualizations, PDF exports (jsPDF), Excel exports (SheetJS)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite, Tailwind CSS 3.4, React Router DOM 7 |
| **Charts** | Recharts 3.x |
| **HTTP Client** | Axios |
| **PDF Export** | jsPDF |
| **Excel Export** | xlsx (SheetJS) |
| **Icons** | Lucide React |
| **Backend** | Node.js + Express 4 |
| **Database** | SQLite (via sql.js) |
| **Auth** | JWT + bcryptjs |
| **Security** | Helmet, CORS, Morgan |
| **Dev Tools** | Nodemon, ESLint, Concurrently |

---

## Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+

### 1. Clone & Install

```bash
git clone https://github.com/soo-sapkal/SparkClubSystem.git
cd SparkClubSystem
npm run install:all
```

### 2. Configure Environment

Create a `.env` file in `sparkclub/backend/`:

```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 3. Seed the Database

```bash
cd sparkclub/backend
node -e "const init = require('./db/database.js'); init();"
```

### 4. Run the Application

```bash
# Run both backend (port 3001) and frontend (port 5173) together
npm run dev

# Or run individually:
npm run dev:backend   # API server only
npm run dev:frontend  # React app only
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@sparkclub.com | admin123 |
| Faculty Coordinator | faculty@sparkclub.com | faculty123 |
| Club Head | clubhead@sparkclub.com | clubhead123 |
| Treasurer | treasurer@sparkclub.com | treasurer123 |
| Student Member | student@sparkclub.com | student123 |

---

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory.

### Documentation Map

| Section | Contents |
|---------|----------|
| [Architecture](./docs/architecture/) | System design, database schema, multi-tenant model, auth/RBAC, workflow engine |
| [Product](./docs/product/) | Product overview, role guides for all 5 user types |
| [Features](./docs/features/) | In-depth guides for every module (financial, events, reports, etc.) |
| [Developer Guide](./docs/developer/) | Setup, local dev, API reference, coding standards, deployment |
| [Operations](./docs/operations/) | Backups, monitoring, incident response, maintenance, scaling |

---

## Project Structure

```
SparkClubSystem/
├── sparkclub/
│   ├── backend/                     # Express API server
│   │   ├── db/
│   │   │   ├── schema.sql          # Full database schema + seed data
│   │   │   ├── database.js         # SQLite connection helper
│   │   │   └── sparkclub.db        # SQLite database file (gitignored)
│   │   ├── routes/                 # 14 route modules
│   │   ├── middleware/             # Auth, role, logging middleware
│   │   ├── server.js               # Express entry point
│   │   └── package.json
│   │
│   └── frontend/                   # React + Vite application
│       ├── src/
│       │   ├── pages/              # 36 page components
│       │   ├── components/
│       │   │   ├── layout/         # Sidebar, Navbar, Layout wrappers
│       │   │   └── ui/             # Reusable UI components
│       │   ├── context/            # Auth context
│       │   ├── services/           # API call helpers (Axios)
│       │   ├── utils/              # Utility functions
│       │   └── App.jsx             # Router with 5 role-based layouts
│       ├── index.html
│       └── package.json
│
├── docs/                           # Comprehensive documentation
│   ├── README.md                   # Documentation portal index
│   ├── architecture/              # 7 architecture documents
│   ├── features/                  # 10 feature documents
│   ├── product/                   # 7 product documents
│   ├── developer/                 # 10 developer guides
│   └── operations/                # 5 operations documents
│
├── markdowns/                      # Implementation planning docs
│   └── ...md files                # Development notes
│
└── package.json                    # Root workspace (npm-run-all)
```

---

## API Reference

Base URL: `http://localhost:3001/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/auth/me` | GET | Get current user |
| `/api/dashboard/*` | GET | Dashboard metrics by role |
| `/api/budgets/*` | GET/POST/PUT/DELETE | Budget management |
| `/api/transactions/*` | GET/POST/PUT | Transaction ledger |
| `/api/funding/*` | GET/POST/PUT | Funding requests |
| `/api/reports/*` | GET | Report generation (PDF/Excel) |
| `/api/events/*` | GET/POST/PUT | Event management |
| `/api/tasks/*` | GET/POST/PUT | Task management |
| `/api/sponsors/*` | GET/POST/PUT | Sponsor CRM |
| `/api/documents/*` | GET/POST/DELETE | Document management |
| `/api/audit/*` | GET | Audit logs |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [docs/developer/coding-standards.md](./docs/developer/coding-standards.md) before contributing.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.