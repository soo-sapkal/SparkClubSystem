# Deployment Guide

Complete deployment instructions for SparkClub — a full-stack application with React/Vite frontend and Express/SQLite backend.

## Architecture Overview

```
Frontend (React/Vite) ──→ Backend (Express) ──→ SQLite Database
   Port 5173 (dev)           Port 3001              Local file
   Vercel (prod)             Render/Railway
```

## Option 1: Traditional VPS / Dedicated Server

Best for institutions that want full control and persistent storage.

### Backend (Node.js + Express)

```bash
# Clone the repository
git clone https://github.com/soo-sapkal/SparkClubSystem.git
cd SparkClubSystem/sparkclub/backend

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
PORT=3001
JWT_SECRET=your-64-character-random-secret-here
NODE_ENV=production
EOF

# Seed the database
node -e "require('./db/database').initializeDb()"

# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start server.js --name sparkclub-backend

# Configure PM2 to restart on failure
pm2 startup
pm2 save
```

**Nginx reverse proxy config:**

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Frontend (Vite Build)

```bash
cd sparkclub/frontend

# Set production API URL
echo "VITE_API_URL=https://api.yourdomain.com/api" > .env.production

# Build for production
npm run build

# Serve with nginx
```

**Nginx config for frontend:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/sparkclub/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Option 2: Render (Recommended for Simplicity)

Render offers free tier for both backend web services and static frontend hosting.

### Backend Deployment

1. Create a [Render](https://render.com) account
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory:** `sparkclub/backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add environment variables:
   - `PORT=3001`
   - `JWT_SECRET=<generate a random 64-char string>`
   - `NODE_ENV=production`
6. **Important:** Add a persistent disk for SQLite database:
   - Go to the disk settings
   - Add a disk named `sparkclub_db` mounted at `/var/data`
   - Update `sparkclub/backend/db/database.js` to use the mounted path

### Frontend Deployment (Static Site)

1. Create a **New → Static Site**
2. Connect your GitHub repository
3. Configure:
   - **Root Directory:** `sparkclub/frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Add environment variable:
   - `VITE_API_URL=https://your-backend-service.onrender.com/api`
5. The static site will be available at `https://your-site.onrender.com`

---

## Option 3: Railway

Railway provides persistent SQLite support which is perfect for this stack.

### Backend

1. Create a Railway project
2. Add a **Node.js** service
3. Point to `sparkclub/backend`
4. Set environment variables
5. Railway automatically detects and starts SQLite — no extra config needed

### Frontend

1. Add a **Static Site** service
2. Configure build command: `npm install && npm run build`
3. Set `VITE_API_URL` to your Railway backend URL

---

## Option 4: Fly.io

### Backend

```bash
cd sparkclub/backend
fly launch
# Configure as a Node.js app

# Add secrets
fly secrets set JWT_SECRET=your-random-secret

# Deploy
fly deploy
```

### Frontend

```bash
cd sparkclub/frontend
fly launch
# Configure as a static site
fly deploy
```

---

## Option 5: Docker Deployment

### Dockerfile (Backend)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Dockerfile (Frontend — Multi-stage)

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV VITE_API_URL=/api
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  backend:
    build: ./sparkclub/backend
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - JWT_SECRET=your-secret
      - NODE_ENV=production
    volumes:
      - db_data:/app/db

  frontend:
    build: ./sparkclub/frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  db_data:
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (default: 3001) |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `NODE_ENV` | Yes | `production` for production |
| `VITE_API_URL` | Frontend | Backend API URL (for production builds) |

---

## Database Considerations

### SQLite in Production

SQLite works well for small-to-medium deployments. For high-traffic scenarios:

1. **WAL mode** is already enabled in `schema.sql`
2. Regular backups are critical — see [Backups](./backups.md)
3. For scaling, migrate to PostgreSQL — see [Scaling](./scaling.md)

### Database Location

For persistent storage on cloud platforms:
- **Render:** Use a persistent disk mounted at a fixed path
- **Railway:** Automatically handles persistence
- **Docker:** Use a named volume
- **VPS:** Store in `/var/data/sparkclub.db`

---

## SSL / HTTPS

Always use HTTPS in production:
- **Render/Fly.io:** Free auto-provisioned SSL certificates
- **Nginx:** Use Let's Encrypt with `certbot`

```bash
sudo certbot --nginx -d yourdomain.com
```

---

## Security Checklist

- [ ] Change `JWT_SECRET` to a random 64-character string
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure CORS to allow only your frontend domain
- [ ] Set up regular database backups
- [ ] Enable rate limiting: `npm install express-rate-limit`
- [ ] Review and harden CORS settings in `server.js`
- [ ] Store database file outside the web root

---

## Performance Optimization

### Backend
- Enable response compression: `npm install compression`
- Consider PM2 cluster mode for multi-core: `pm2 start server.js -i max`

### Frontend
- Run `npm run build` for optimized production build
- Configure CDN caching for static assets
- Enable Gzip/Brotli compression in nginx

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;
```

---

## Monitoring

See [Monitoring](./monitoring.md) for detailed logging, uptime monitoring, and alerting setup.