# Backups

Maintain system stability and data durability.

## Database Backup Options
* **Manual Dumps**: Copy `backend/db/sparkclub.db` to a safe destination.
* **SQLite Backups**:
  ```bash
  sqlite3 sparkclub.db ".backup 'backup_today.db'"
  ```
* **Storage**: Upload encrypted database files to secure storage buckets.
