# Troubleshooting

Common issues and remediation steps.

* **Better-sqlite3 rebuild issue**: If backend fails to start, reinstall node modules to rebuild native SQLite modules.
* **CORS Blocked**: Verify `VITE_API_URL` environment variables on the client side matches the backend server domain.
* **Claude API returns 401**: Ensure your `ANTHROPIC_API_KEY` is active and correct.
