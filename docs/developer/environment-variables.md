# Environment Variables

Configure these settings inside `.env` files.

## Backend Configuration (`backend/.env`)
```env
PORT=3001
JWT_SECRET=supersecretjwtkey12345
JWT_EXPIRES_IN=24h
```

## Frontend Configuration (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3001/api
```