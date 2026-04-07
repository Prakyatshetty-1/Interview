# Deployment Guide - Askora AI

This guide covers deploying the frontend (Vercel) and backend (Render) while **keeping the existing MongoDB database unchanged**.

## Current Setup

| Component | Status | URL |
|-----------|--------|-----|
| Frontend | Vercel | `https://askora-ai.vercel.app` |
| Backend | Render | `https://interview-nxbs.onrender.com` |
| Database | External MongoDB | Same database (no change needed) |

---

## Prerequisites

1. **MongoDB Database** - Already created (Atlas, MongoDB Cloud, or existing MongoDB server)
2. **Account on Vercel** - For frontend deployment
3. **Account on Render** - For backend deployment
4. **Git repository** - Your project is already tracked

---

## Step 1: Environment Variables (Do This First)

Before deploying, gather or create the following environment variables. These will be configured in both Vercel (frontend) and Render (backend):

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/interview-app` |
| `SECRET_KEY` | JWT signing secret | Random 256-bit string |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abc123...` |

### Generate SECRET_KEY (if needed)
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

## Step 2: Backend Deployment (Render)

### A. Update CORS Configuration

In `backend/server.cjs`, update the CORS `origin` array to include your production frontend URL:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',  // Dev server
    'https://askora-ai.vercel.app',  // Your Vercel frontend
    // Add any other frontend URLs if needed
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
```

### B. Create .env File for Production

Create a `.env` file in your `backend/` directory with production values:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/interview-app?retryWrites=true&w=majority
SECRET_KEY=your-super-secret-jwt-key
GEMINI_API_KEY=AIzaSy...your-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your-secret
```

> **Note:** Never commit this `.env` file to git. Add it to `.gitignore`.

### C. Push Code to GitHub

```bash
git add .
git commit -m "Update CORS for production"
git push origin main
```

### D. Deploy to Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `interview-api` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty (default)
   - **Start Command**: `node server.cjs`

5. **Environment Variables** - Add all required variables from Step 1

6. **Database Settings**:
   - If using MongoDB Atlas, ensure your IP is whitelisted
   - For Atlas: Add `0.0.0.0/0` to allow all IPs (or restrict to Render's IPs)

7. Click **"Create Web Service"**

8. After deployment, note the backend URL (e.g., `https://interview-api.onrender.com`)

### E. Update Backend URL in Frontend

Update the frontend API base URL (likely in `src/lib/api.js` or similar):

```javascript
const API_BASE_URL = 'https://interview-api.onrender.com';
// or whatever Render gave you
```

---

## Step 3: Frontend Deployment (Vercel)

### A. Update API Configuration

In your frontend code, update any references to the backend:

```javascript
// Example: src/lib/api.js or src/constants.js
export const API_URL = import.meta.env.VITE_API_URL || 'https://interview-api.onrender.com';
```

### B. Create .env.local for Vercel

Create a `.env.local` file in your project root:

```env
VITE_API_URL=https://interview-api.onrender.com
```

Add to `.gitignore`:
```
.env.local
```

### C. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Environment Variables** - Add:
   - `VITE_API_URL` → Your Render backend URL

6. Click **"Deploy"**

---

## Step 4: Database Configuration

Since you want to **keep the database the same**, ensure:

### For MongoDB Atlas
1. Go to your Atlas cluster
2. **Network Access** → Add IP `0.0.0.0/0` to allow Render
3. **Database Access** → Verify your MongoDB user has read/write permissions
4. **Connection String** → Copy the SRV connection string

### For Self-Hosted MongoDB
1. Ensure MongoDB is accessible from the internet (or Render's network)
2. Update firewall rules to allow connections from:
   - Render's IPs (approximate range: `35.192.0.0/12`)
   - Or open to all (`0.0.0.0/0`) for simplicity
3. Create a MongoDB user with appropriate permissions:
   ```javascript
   db.createUser({
     user: "render_user",
     pwd: "strong-password",
     roles: [{ role: "readWrite", db: "interview-app" }]
   });
   ```

---

## Step 5: Testing

After deployment, test:

### Backend Test
```bash
curl https://your-backend.onrender.com/
# Should return: "API is working"
```

### Frontend Test
1. Visit your Vercel URL
2. Try logging in
3. Create a test interview
4. Check the browser console for any API errors

---

## Common Issues & Solutions

### 1. CORS Errors
**Error**: `NetworkError when attempting to fetch resource`

**Solution**: 
- Ensure backend CORS includes your Vercel URL
- Check that credentials are enabled on both ends

### 2. Database Connection Timeout
**Error**: `MongoDB connection timeout`

**Solution**:
- Verify MongoDB is accessible from the internet
- Check firewall rules
- For Atlas: Ensure IP whitelist includes `0.0.0.0/0`

### 3. Mongoose Connection Failures
**Error**: `MongooseError: connect ECONNREFUSED`

**Solution**:
- Verify `MONGO_URI` format is correct
- Check that username/password are URL-encoded if they contain special characters

### 4. Environment Variables Not Working
**Solution**:
- Render: Environment variables must be set in the dashboard (not in `.env` file)
- Vercel: Use `.env.local` or environment variables in dashboard

---

## Monitoring

### Render Dashboard
- View logs: `https://dashboard.render.com/web/your-service`
- Check uptime: Render provides basic uptime monitoring

### MongoDB
- Monitor via MongoDB Atlas dashboard
- Check connection pool stats

---

## Maintenance

### Adding New Environment Variables
1. Update in Render Dashboard (Settings → Environment)
2. Update in Vercel Dashboard (Settings → Environment)
3. Redeploy services

### Database Backups
- Use MongoDB Atlas automated backups (recommended)
- Or use `mongodump` for manual backups:
  ```bash
  mongodump --uri="MONGO_URI" --out=./backup
  ```

---

## Summary

| Task | Status |
|------|--------|
| Backend on Render | ✅ |
| Frontend on Vercel | ✅ |
| Database unchanged | ✅ |
| CORS configured | ✅ |
| Environment variables set | ✅ |

The existing database at `MONGO_URI` will be used by both your Render and Vercel deployments without any modifications needed to the database itself.
