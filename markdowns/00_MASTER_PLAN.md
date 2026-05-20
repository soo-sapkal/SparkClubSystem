# SparkClub Treasurer Dashboard — Master Implementation Plan

## Project Summary
A financial management web app for college club treasurers with AI assistance, budget tracking, transaction management, funding requests, and analytics.

## Tech Stack
| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + Vite | Fast dev, component reuse |
| Styling | Tailwind CSS | Utility-first, rapid UI |
| Charts | Recharts | React-native, composable |
| Backend | Node.js + Express | Lightweight REST API |
| Database | SQLite (via `better-sqlite3`) | File-based, zero-config, seed via `.sql` file |
| AI | Anthropic Claude API | Financial assistant + analysis |
| PDF Export | jsPDF | Client-side PDF generation |
| Excel Export | SheetJS (xlsx) | Client-side Excel export |
| Auth | JWT + bcrypt | Simple, stateless auth |

## File Structure (Final)
```
sparkclub/
├── backend/
│   ├── db/
│   │   ├── schema.sql          ← Single source-of-truth SQL file (seeded progressively)
│   │   └── database.js         ← SQLite connection helper
│   ├── routes/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── budgets.js
│   │   ├── transactions.js
│   │   ├── funding.js
│   │   ├── reports.js
│   │   └── ai.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── dashboard/
│   │   │   ├── budgets/
│   │   │   ├── transactions/
│   │   │   ├── funding/
│   │   │   ├── reports/
│   │   │   └── ai/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/       ← API call helpers
│   │   ├── context/        ← Auth + App context
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

## Implementation Phases
| Phase | File | Description |
|---|---|---|
| 1 | `01_DATABASE_SETUP.md` | SQLite schema, seed data, DB helper |
| 2 | `02_BACKEND_SETUP.md` | Express server, middleware, auth routes |
| 3 | `03_BACKEND_ROUTES.md` | All API routes (CRUD for each module) |
| 4 | `04_FRONTEND_SETUP.md` | Vite + React + Tailwind bootstrap, routing |
| 5 | `05_LAYOUT_AND_AUTH.md` | Login page, sidebar layout, nav |
| 6 | `06_DASHBOARD.md` | Dashboard page with metrics + charts |
| 7 | `07_BUDGETS.md` | Budget management UI |
| 8 | `08_TRANSACTIONS.md` | Transaction tracking UI |
| 9 | `09_FUNDING_REQUESTS.md` | Funding request workflow UI |
| 10 | `10_REPORTS.md` | PDF/Excel export + analytics UI |
| 11 | `11_AI_ASSISTANT.md` | AI chatbot + budget optimization UI |
| 12 | `12_FINAL_WIRING.md` | Connect all pieces, env vars, run instructions |

## How to Use These Files
Each file is a **self-contained step**. An AI agent should:
1. Read the file top to bottom before writing any code.
2. Complete every code block in order — do not skip.
3. After each file, the app must be in a **runnable state** (no broken imports).
4. The `schema.sql` file is **appended to** in phase 1 and never rewritten — it is the single seed file.

## Key Constraints
- All API routes are prefixed `/api/`
- JWT token stored in `localStorage` as `sparkclub_token`
- SQLite DB file lives at `backend/db/sparkclub.db` (gitignored)
- `schema.sql` is the portable seed — running it on a fresh SQLite instance produces a ready DB
- AI calls go through backend (API key never exposed to frontend)
