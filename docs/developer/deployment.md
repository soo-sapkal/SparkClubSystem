# Deployment

Guidelines to host SparkClub.

## Production Builds
* Run `npm run build` in `frontend/` to generate static assets.
* Serve backend using PM2 or standard container tools.

## Platform Providers
* **Render**: Deploy backend with persistent storage disk for `sparkclub.db`.
* **Vercel**: Host frontend React assets.
