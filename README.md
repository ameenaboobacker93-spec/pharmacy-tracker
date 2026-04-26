# Pharmacy Purchase Tracker

A web application for tracking pharmacy purchases, supplier invoices, returns, and credit notes — shared across your entire team in real time.

---

## What's inside

```
pharmacy-app/
├── backend/               ← Node.js + Express API server
│   ├── db/
│   │   ├── schema.sql     ← Run this once to set up your database
│   │   └── pool.js        ← Database connection
│   ├── routes/
│   │   └── purchases.js   ← All API endpoints
│   ├── server.js          ← Server entry point
│   ├── .env.example       ← Copy to .env and fill in your values
│   └── package.json
│
└── frontend/              ← React web app (what your team sees)
    ├── src/
    │   ├── components/    ← UI components
    │   ├── App.jsx        ← Main app
    │   ├── api.js         ← API calls
    │   └── index.css      ← Styles
    ├── index.html
    ├── vite.config.js
    ├── .env.example
    └── package.json
```

---

## STEP 1 — Set up the database (free on Railway or Supabase)

### Option A — Railway (recommended, easiest)
1. Go to https://railway.app and sign up (free)
2. Click **New Project → Provision PostgreSQL**
3. Click the PostgreSQL service → **Connect** tab
4. Copy the **DATABASE_URL** (looks like `postgresql://postgres:...@...railway.app:5432/railway`)
5. Open the **Query** tab and paste the contents of `backend/db/schema.sql` → click **Run**

### Option B — Supabase (also free)
1. Go to https://supabase.com → New Project
2. Go to **SQL Editor** → paste `backend/db/schema.sql` → Run
3. Go to **Settings → Database** → copy the **Connection String (URI)**

---

## STEP 2 — Deploy the backend (free on Railway)

1. Go to https://railway.app → your project → **New Service → GitHub Repo**
2. Connect your GitHub account and upload/push the `backend/` folder
3. In the service settings, add these **Environment Variables**:
   ```
   DATABASE_URL    = (paste from Step 1)
   NODE_ENV        = production
   FRONTEND_URL    = https://your-app.vercel.app   ← fill in after Step 3
   PORT            = 4000
   ```
4. Railway will auto-deploy. Copy your backend URL (e.g. `https://pharmacy-backend.railway.app`)

### Alternative: Deploy backend on Render (free)
1. Go to https://render.com → New Web Service → connect GitHub repo (backend folder)
2. Build command: `npm install`
3. Start command: `node server.js`
4. Add the same environment variables as above

---

## STEP 3 — Deploy the frontend (free on Vercel)

1. Go to https://vercel.com → sign up → **Add New Project**
2. Import your GitHub repo (frontend folder) or drag-and-drop the `frontend/` folder
3. In **Environment Variables**, add:
   ```
   VITE_API_URL = https://your-backend.railway.app   ← from Step 2
   ```
4. Click **Deploy**. Vercel gives you a URL like `https://pharmacy-tracker.vercel.app`
5. Go back to Step 2 and update `FRONTEND_URL` with this Vercel URL

---

## Running locally (for testing or development)

### Requirements
- Node.js 18+ (https://nodejs.org)
- PostgreSQL installed locally OR use a free cloud DB from Step 1

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set DATABASE_URL to your local or cloud postgres URL
node db/schema.sql   # Or run schema.sql manually in your DB client
npm run dev          # Starts on http://localhost:4000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Leave VITE_API_URL empty for local dev (proxy handles it)
npm run dev          # Opens http://localhost:5173
```

---

## Features

| Feature | Description |
|---|---|
| Add purchase | Date, Supplier, Invoice No., GRN No., Amount, Payment Terms |
| Update return | Add return amount and credit note status later on any entry |
| Credit note tracking | Not Received → Pending CN → Received + CN number |
| Edit entry | Fix any mistakes on existing records |
| Delete entry | Remove an entry with confirmation |
| Filter by month | See records for a specific month |
| Filter by supplier | Search by supplier name |
| Monthly summary | Total invoiced, returned, net payable, broken down by supplier |
| Export to Excel | Downloads all visible records as a formatted .xlsx file |
| Team sharing | All data in PostgreSQL — everyone sees the same records in real time |

---

## Need help?

- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
- Node.js download: https://nodejs.org

If you get stuck on any step, share the error message and a developer can help you resolve it quickly.
