# Lancy Self-Hosting & Deployment Guide

## System Requirements
- Node.js v20.x or Docker & Docker Compose
- SQLite (default) or PostgreSQL database
- 1GB RAM minimum (2GB recommended)

## Docker Compose Quick Start (Recommended)
```bash
git clone https://github.com/Hamenath/lancy.git
cd lancy
docker compose up -d
```
The application will start on:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`
- Swagger Docs: `http://localhost:4000/api/docs`

## Manual Server Setup
1. Clone repo & install dependencies:
   ```bash
   npm install
   cd backend && npm install
   ```
2. Configure environment (`.env`):
   ```bash
   cp .env.example .env
   ```
3. Initialize database & seed demo accounts:
   ```bash
   cd backend
   npx prisma db push
   npx prisma db seed
   ```
4. Run in production mode:
   ```bash
   npm run build
   npm start
   ```
