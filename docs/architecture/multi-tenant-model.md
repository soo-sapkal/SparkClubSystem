# Multi-Tenant Model

SparkClub implements a **Logical Shared Database Isolation model**. 

## Isolation Policies
1. **Club Scope Execution**: The token payload contains a `club_id`.
2. **Controller Query Restrictions**: Every SQL query executing reads/updates uses a strict where condition on `club_id`:
   ```javascript
   const rows = db.prepare('SELECT * FROM transactions WHERE club_id = ?').all(req.user.club_id);
   ```
3. **Data Security**: There are no cross-tenant query routes except for `super_admin` queries. The `super_admin` user has a `club_id` value of `NULL` in the users table and is bypassed from individual club restrictions.
