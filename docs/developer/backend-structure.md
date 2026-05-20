# Backend Structure

Inside `sparkclub/backend`:

* **`db/`**:
  * `database.js`: Better-sqlite3 database initializer.
  * `schema.sql`: Source of truth database schema and seeds.
* **`middleware/`**:
  * `auth.js`: JWT token verification and role validator.
* **`routes/`**:
  * `auth.js`, `dashboard.js`, `budgets.js`, `transactions.js`, `funding.js`, `reports.js`, `ai.js`.
* **`server.js`**: Core entry point.
