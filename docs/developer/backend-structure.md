# Backend Structure

Inside `sparkclub/backend`:

* **`db/`**:
  * `database.js`: sql.js database initializer.
  * `schema.sql`: Source of truth database schema and seeds.
* **`middleware/`**:
  * `auth.js`: JWT token verification and role validator.
* **`routes/`**:
  * `auth.js`, `dashboard.js`, `budgets.js`, `transactions.js`, `funding.js`, `reports.js`, `events.js`, `tasks.js`, `sponsors.js`, `documents.js`, `studentdev.js`, `audit.js`, `faculty.js`, `student.js`, `superadmin.js`.
* **`server.js`**: Core entry point.