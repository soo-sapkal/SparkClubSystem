# Authentication & RBAC

SparkClub employs Role-Based Access Control (RBAC) enforced via stateless JSON Web Tokens.

## JWT Structure
The token contains the user's basic metadata:
```json
{
  "id": 1,
  "email": "arjun@sparkclub.edu",
  "role": "treasurer",
  "club_id": 1,
  "name": "Arjun Mehta"
}
```

## Role Matrix
| Role | Financial Read | Financial Write | Approval Authority | Platform Admin |
|---|---|---|---|---|
| **super_admin** | Yes (All) | Yes (All) | Yes | Yes |
| **faculty** | Yes (Club) | No | Yes (Club) | No |
| **club_head** | Yes (Club) | No | No | No |
| **treasurer** | Yes (Club) | Yes (Club) | No | No |
| **member** | No | No | No | No |
