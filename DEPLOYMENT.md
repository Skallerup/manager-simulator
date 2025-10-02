# Manager Simulator - Deployment Guide

Dette projekt er konfigureret til at virke både lokalt og på production domænet `martinskallerup.dk`.

## 🏠 Localhost Development

### Frontend (Next.js)
- **URL**: http://localhost:3001
- **Backend URL**: http://localhost:3000
- **Environment**: `.env.local`

### Backend (Express)
- **URL**: http://localhost:3000
- **Environment**: `.env`

### Start lokalt:
```bash
# Backend
cd backend
npm run dev

# Frontend (i ny terminal)
cd frontend
npm run dev
```

## 🌐 Production Deployment

### Frontend
- **URL**: https://app.martinskallerup.dk
- **Backend URL**: https://api.martinskallerup.dk
- **Environment**: `.env.production`

### Backend
- **URL**: https://api.martinskallerup.dk
- **Environment**: `.env.production`

## 🔧 Environment Configuration

### Frontend Environment Files:
- `.env.local` - Localhost development
- `.env.production` - Production deployment

### Backend Environment Files:
- `.env` - Localhost development
- `.env.production` - Production deployment

## 🚀 Deployment Commands

### Localhost:
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### Production:
```bash
# Backend
cd backend
NODE_ENV=production npm start

# Frontend
cd frontend
NODE_ENV=production npm run build
NODE_ENV=production npm start
```

## 🔒 CORS Configuration

Backend er konfigureret til at acceptere requests fra:
- `http://localhost:3001` (localhost frontend)
- `https://app.martinskallerup.dk` (production frontend)
- `https://martinskallerup.dk` (main domain)
- Vercel deployment URLs

## 📁 Project Structure

```
manager-simulator/
├── frontend/          # Next.js React app
│   ├── .env.local     # Localhost config
│   └── .env.production # Production config
├── backend/           # Express API
│   ├── .env           # Localhost config
│   └── .env.production # Production config
└── DEPLOYMENT.md      # This file
```

## ✅ Verification

### Test localhost:
1. Backend: http://localhost:3000/health
2. Frontend: http://localhost:3001
3. Login med: test@test.com / test123

### Test production:
1. Backend: https://api.martinskallerup.dk/health
2. Frontend: https://app.martinskallerup.dk
3. Login med: test@test.com / test123
