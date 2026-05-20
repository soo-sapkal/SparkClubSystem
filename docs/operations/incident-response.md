# Incident Response

Procedure for system failures.

## Actions
1. **API keys compromise**: Instantly rotate `JWT_SECRET` and `ANTHROPIC_API_KEY`.
2. **Unauthorized access**: Revoke all issued JWTs by changing `JWT_SECRET`.
3. **Emergency freeze**: Trigger platforms lock options in the super admin panel.
