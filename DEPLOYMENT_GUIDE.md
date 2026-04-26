# Pharmacy Tracker Deployment Guide

## Prerequisites
- GitHub account with your code pushed
- Railway account (free tier available)
- Vercel account (free tier available)

## Step 1: Push Code to GitHub

```bash
# If not already a git repo
git init
git add .
git commit -m "Ready for deployment"

# Create GitHub repo and add remote
git remote add origin https://github.com/yourusername/pharmacy-app.git
git push -u origin main
```

## Step 2: Deploy Backend to Railway

1. **Sign up/login to Railway**: https://railway.app
2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose your pharmacy-app repository
   - Select the `backend` folder when prompted

3. **Add PostgreSQL Database**:
   - In your Railway project, click "+ New Service"
   - Select "PostgreSQL"
   - Wait for it to be created

4. **Set Environment Variables**:
   - Go to your backend service settings
   - Add these variables:
     ```
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend-url.vercel.app
     PORT=4000
     ```
   - Note: `DATABASE_URL` is automatically set by Railway

5. **Run Database Schema**:
   - Click on your PostgreSQL service
   - Click "Connect" → "Query"
   - Copy the entire contents of `backend/db/schema.sql`
   - Paste and run the query

6. **Deploy**:
   - Railway will automatically deploy
   - Note your backend URL: `https://your-backend-name.railway.app`

## Step 3: Deploy Frontend to Vercel

1. **Sign up/login to Vercel**: https://vercel.com
2. **Create New Project**:
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder when prompted

3. **Set Environment Variables**:
   - Go to project settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://your-backend-name.railway.app
     ```

4. **Deploy**:
   - Click "Deploy"
   - Note your frontend URL: `https://your-frontend-name.vercel.app`

## Step 4: Final Configuration

1. **Update Railway CORS**:
   - Go back to your Railway backend service
   - Update `FRONTEND_URL` to your actual Vercel URL
   - Railway will automatically redeploy

2. **Test the Application**:
   - Visit your Vercel URL
   - Try creating a purchase
   - Check that data persists

## Troubleshooting

### Common Issues:

**CORS Errors**:
- Ensure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Check browser console for specific error messages

**Database Connection**:
- Verify PostgreSQL service is running in Railway
- Check that schema was applied successfully
- Look at Railway logs for connection errors

**Build Failures**:
- Check Railway/Vercel logs for specific errors
- Ensure all dependencies are in package.json

### Environment Variable Checklist:

**Railway Backend**:
- ✅ NODE_ENV=production
- ✅ FRONTEND_URL=https://your-app.vercel.app
- ✅ PORT=4000
- ✅ DATABASE_URL (auto-set by Railway)

**Vercel Frontend**:
- ✅ VITE_API_URL=https://your-backend.railway.app

## URLs to Save:
- Railway Backend: _________________
- Vercel Frontend: _________________
- Railway PostgreSQL: (managed automatically)

## Support:
- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
