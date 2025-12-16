# 🚀 Render Deployment Guide - Backend & Frontend

## ✅ Yes! Both can be hosted on Render

Render supports:
- **Backend**: Web Service (Node.js)
- **Frontend**: Static Site (React/Vite)

---

## 📋 Prerequisites

1. **GitHub Repository** (code push karna hoga)
2. **MongoDB Atlas** account (free tier available)
3. **Render Account** (free tier available)

---

## 🔧 Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Account
- Go to: https://www.mongodb.com/cloud/atlas
- Sign up (Free tier available)

### 1.2 Create Cluster
- Click "Build a Database"
- Choose **FREE** (M0) tier
- Select region (closest to you)
- Create cluster

### 1.3 Database Access
- Go to "Database Access"
- Click "Add New Database User"
- Username: `wellnessadmin` (or your choice)
- Password: Generate secure password (SAVE IT!)
- Database User Privileges: "Read and write to any database"
- Add User

### 1.4 Network Access
- Go to "Network Access"
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (0.0.0.0/0)
- Confirm

### 1.5 Get Connection String
- Go to "Clusters" → Click "Connect"
- Choose "Connect your application"
- Copy connection string
- Replace `<password>` with your database user password
- Replace `<dbname>` with `wellnessatwork` (or your choice)

**Example:**
```
mongodb+srv://wellnessadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/wellnessatwork?retryWrites=true&w=majority
```

---

## 🔙 Step 2: Deploy Backend on Render

### 2.1 Create Backend Service
1. Go to: https://render.com
2. Sign up / Login
3. Click "New +" → "Web Service"

### 2.2 Connect Repository
- Connect your GitHub account
- Select your repository
- Choose branch (usually `main` or `master`)

### 2.3 Configure Backend Settings

**Basic Settings:**
- **Name**: `wellnessatwork-backend` (or your choice)
- **Environment**: `Node`
- **Region**: Choose closest to you
- **Branch**: `main` (or your default branch)

**Build & Deploy:**
- **Root Directory**: `server` (important!)
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Environment Variables:**
Click "Add Environment Variable" and add:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://wellnessadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/wellnessatwork?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-random-string-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars-random-string-here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-app.onrender.com
CLIENT_URL=https://your-frontend-app.onrender.com
GOOGLE_CLIENT_ID=your-google-client-id (if using Google Fit)
GOOGLE_CLIENT_SECRET=your-google-client-secret (if using Google Fit)
GOOGLE_REDIRECT_URI=https://your-backend-app.onrender.com/api/auth/google-fit/callback
```

**Important Notes:**
- `PORT=10000` - Render automatically assigns port, but we set default
- `CORS_ORIGIN` - Frontend URL (we'll get this after frontend deployment)
- `JWT_SECRET` - Generate random 32+ character string
- `JWT_REFRESH_SECRET` - Generate different random 32+ character string

### 2.4 Deploy Backend
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Note the URL: `https://your-backend-app.onrender.com`

---

## 🎨 Step 3: Deploy Frontend on Render

### 3.1 Create Static Site
1. Go to Render Dashboard
2. Click "New +" → "Static Site"

### 3.2 Connect Repository
- Connect your GitHub account
- Select same repository
- Choose branch (usually `main` or `master`)

### 3.3 Configure Frontend Settings

**Basic Settings:**
- **Name**: `wellnessatwork-frontend` (or your choice)
- **Branch**: `main` (or your default branch)

**Build & Deploy:**
- **Root Directory**: `client` (important!)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

**Environment Variables:**
Click "Add Environment Variable" and add:

```env
VITE_API_URL=https://your-backend-app.onrender.com/api
```

**Important:**
- Replace `your-backend-app.onrender.com` with your actual backend URL

### 3.4 Deploy Frontend
- Click "Create Static Site"
- Wait for deployment (3-5 minutes)
- Note the URL: `https://your-frontend-app.onrender.com`

---

## 🔄 Step 4: Update CORS & URLs

### 4.1 Update Backend CORS
After frontend is deployed, update backend environment variable:

1. Go to Backend Service on Render
2. Go to "Environment" tab
3. Update `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://your-frontend-app.onrender.com
   ```
4. Update `CLIENT_URL`:
   ```
   CLIENT_URL=https://your-frontend-app.onrender.com
   ```
5. Click "Save Changes"
6. Service will auto-redeploy

### 4.2 Update Frontend API URL
1. Go to Frontend Service on Render
2. Go to "Environment" tab
3. Update `VITE_API_URL`:
   ```
   VITE_API_URL=https://your-backend-app.onrender.com/api
   ```
4. Click "Save Changes"
5. Service will auto-redeploy

---

## 📁 Step 5: Project Structure (Important!)

Your GitHub repository should have this structure:

```
your-repo/
├── server/
│   ├── server.js
│   ├── package.json
│   ├── .env (don't commit this!)
│   └── ...
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env (don't commit this!)
│   └── ...
└── README.md
```

**Important:**
- Root directory: `server` for backend
- Root directory: `client` for frontend
- `.env` files should NOT be committed to GitHub

---

## 🔐 Step 6: Security Checklist

### Backend:
- ✅ JWT secrets are strong (32+ characters)
- ✅ MongoDB password is secure
- ✅ CORS_ORIGIN is set correctly
- ✅ Environment variables are set in Render (not in code)

### Frontend:
- ✅ API URL is correct
- ✅ No hardcoded secrets

---

## 🧪 Step 7: Test Deployment

### 7.1 Test Backend
```bash
# Health check
curl https://your-backend-app.onrender.com/api/health

# Should return:
{"status":"OK","message":"WellnessAtWork API is running"}
```

### 7.2 Test Frontend
1. Open: `https://your-frontend-app.onrender.com`
2. Try to login
3. Check if API calls work

### 7.3 Seed Database (Optional)
If you want to seed the database on Render:

1. Go to Backend Service → "Shell" tab
2. Run:
```bash
cd server
npm run seed
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Backend Build Fails
**Error**: `Cannot find module`
**Solution**: 
- Check Root Directory is set to `server`
- Check package.json exists in server folder

### Issue 2: Frontend Build Fails
**Error**: `VITE_API_URL is not defined`
**Solution**:
- Add `VITE_API_URL` environment variable in Render
- Rebuild

### Issue 3: CORS Error
**Error**: `Access to fetch blocked by CORS policy`
**Solution**:
- Update `CORS_ORIGIN` in backend environment variables
- Make sure it matches frontend URL exactly (with https://)

### Issue 4: MongoDB Connection Failed
**Error**: `MongooseServerSelectionError`
**Solution**:
- Check MongoDB Atlas Network Access (0.0.0.0/0)
- Verify connection string has correct password
- Check database user has read/write permissions

### Issue 5: Images Not Loading
**Error**: Images show broken
**Solution**:
- Check if `uploads` folder exists
- Render doesn't persist file system - use cloud storage (AWS S3, Cloudinary) for production
- For now, images might not persist after restart

---

## 💾 File Storage (Important!)

**Render doesn't persist file system!**

If you upload files, they will be lost on restart.

### Solutions:
1. **Use Cloud Storage** (Recommended):
   - AWS S3
   - Cloudinary (for images)
   - Google Cloud Storage

2. **For Development/Testing**:
   - Files will work but won't persist
   - Use for testing only

---

## 📊 Render Free Tier Limits

### Backend (Web Service):
- ✅ 750 hours/month (enough for 24/7)
- ✅ Auto-sleeps after 15 min inactivity
- ✅ Wakes up on first request (takes 30-60 seconds)

### Frontend (Static Site):
- ✅ Unlimited
- ✅ Always available
- ✅ Fast CDN

---

## 🚀 Quick Deployment Checklist

- [ ] MongoDB Atlas setup complete
- [ ] GitHub repository pushed
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Render
- [ ] Environment variables set
- [ ] CORS_ORIGIN updated
- [ ] API URL updated in frontend
- [ ] Tested login
- [ ] Tested API calls
- [ ] Database seeded (optional)

---

## 📝 Example URLs

After deployment, your URLs will be:

**Backend:**
```
https://wellnessatwork-backend.onrender.com
https://wellnessatwork-backend.onrender.com/api/health
```

**Frontend:**
```
https://wellnessatwork-frontend.onrender.com
```

**API Endpoints:**
```
https://wellnessatwork-backend.onrender.com/api/auth/login
https://wellnessatwork-backend.onrender.com/api/activities
https://wellnessatwork-backend.onrender.com/api/challenges
```

---

## 🎯 Next Steps After Deployment

1. **Update Google Fit OAuth** (if using):
   - Add Render URLs to Google Cloud Console
   - Update redirect URIs

2. **Set up Custom Domain** (Optional):
   - Render supports custom domains
   - Add DNS records

3. **Monitor Logs**:
   - Check Render dashboard for errors
   - Monitor MongoDB Atlas for connections

4. **Backup Database**:
   - Set up MongoDB Atlas backups
   - Export data regularly

---

## ✅ Success!

Once deployed, you can access:
- Frontend: `https://your-frontend-app.onrender.com`
- Backend API: `https://your-backend-app.onrender.com/api`

**Login Credentials** (same as local):
- Admin: `admin@wellnessatwork.com` / `admin123`
- HR: `hr@wellnessatwork.com` / `hr123456`
- Employee: `john.doe@wellnessatwork.com` / `employee123`

---

## 🆘 Need Help?

Common Render Docs:
- https://render.com/docs
- https://render.com/docs/web-services
- https://render.com/docs/static-sites

