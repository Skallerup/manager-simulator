# Environment Variables Setup

## Backend Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
DATABASE_URL="postgresql://postgres:SIMMANAGER2025%21@yhcsackdxmjeekzlonsk.supabase.co:5432/postgres?sslmode=require"
SUPABASE_URL="https://yhcsackdxmjeekzlonsk.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloY3NhY2tkeG1qZWVremxvbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTM3MjEsImV4cCI6MjA3NDIyOTcyMX0.LF3mSgPVkMnmRU_nyi1whwbbGWh_0UEniAbNTKUrK3k"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloY3NhY2tkeG1qZWVremxvbnNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY1MzcyMSwiZXhwIjoyMDc0MjI5NzIxfQ.v0reckCf_aVTfsA3fvCYmhsfuWs7g_iPgQ6qtovlGJU"
FRONTEND_ORIGIN="http://localhost:3001,https://martinskallerup.dk,https://www.martinskallerup.dk,https://app.martinskallerup.dk"
PORT=3000
```

## Production Setup (Vercel)

For production deployment, add these environment variables in the Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with the values above

**Important:** Make sure to include `https://app.martinskallerup.dk` in the `FRONTEND_ORIGIN` variable for CORS to work correctly.

## Local Development

1. Copy the environment variables above to `.env` file
2. Run `npm install` to install dependencies
3. Run `node api/index.js` to start the backend server

## CORS Configuration

The `FRONTEND_ORIGIN` variable should include all domains that will access the API:
- `http://localhost:3001` (local development)
- `https://martinskallerup.dk` (production main domain)
- `https://www.martinskallerup.dk` (production www domain)
- `https://app.martinskallerup.dk` (production app subdomain)
