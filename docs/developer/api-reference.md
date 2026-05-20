# API Reference

SparkClub API exposes RESTful endpoints. All requests require `Authorization: Bearer <token>` header except `/login`.

| Method | Route | Description | Role Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Returns JWT and Redirect Path | Public |
| `GET` | `/api/dashboard` | Returns general metrics | All |
| `GET` | `/api/budgets` | Returns utilization stats | All |
| `POST` | `/api/transactions` | Logs new transaction | Treasurer, Admin |
| `PATCH` | `/api/funding/:id/review` | Updates status | Treasurer, Admin, Faculty |