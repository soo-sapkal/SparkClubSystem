# Incident Response

Procedure for system failures.

## Actions
1. **API keys compromise**: Instantly rotate `JWT_SECRET`.
2. **Unauthorized access**: Revoke all issued JWTs by changing `JWT_SECRET`.
3. **Emergency freeze**: Trigger platform lock options in the super admin panel.