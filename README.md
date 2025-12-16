# WellnessAtWork - Corporate Wellness Platform

## 🏥 Project Overview

WellnessAtWork is a comprehensive, production-ready MERN stack platform designed to promote employee wellness through gamified challenges, activity tracking, mental health resources, and wellness sessions. The platform enables employees to participate in wellness programs while providing administrators with powerful analytics and management tools.

**This is a final semester project built with industrial-level standards and best practices.**

---

## 🎯 Features

### Employee Features
- ✅ Join corporate wellness challenges (steps, meditation, workouts, hydration, sleep)
- ✅ Log wellness activities and earn points automatically
- ✅ Track progress with visual charts and analytics
- ✅ Achieve badges and maintain streaks
- ✅ Access mental health resources library (articles, videos, podcasts, worksheets)
- ✅ Book wellness sessions (yoga, counseling, webinars, fitness)
- ✅ Check leaderboards (individual & team-based)
- ✅ Redeem rewards using earned points
- ✅ View personalized dashboard with stats and recent activities
- ✅ Anonymous mental health check-ins

### Admin/HR Features
- ✅ Create and manage wellness challenges
- ✅ Manage mental health resources library
- ✅ View all user activities and participation analytics
- ✅ Generate comprehensive wellness reports
- ✅ Export data in CSV and PDF formats
- ✅ Manage rewards and badges
- ✅ Team-level leaderboard tracking
- ✅ User activity monitoring
- ✅ Participation statistics

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router v6** - Client-side routing
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client with interceptors
- **Recharts** - Data visualization library
- **Zustand** - Lightweight state management
- **React Hot Toast** - Toast notifications
- **React Icons** - Icon library
- **date-fns** - Date utility library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens (access + refresh tokens)
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **Joi** - Input validation
- **cookie-parser** - Cookie parsing
- **multer** - File upload handling
- **csv-writer** - CSV export
- **PDFKit** - PDF generation
- **Socket.io** - Real-time updates (optional)

---

## 📁 Project Structure

```
WellnessAtWork/
├── client/                          # React frontend
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── api/                     # API service layer
│   │   │   ├── axios.js             # Axios configuration
│   │   │   └── services.js          # API service functions
│   │   ├── components/              # Reusable UI components
│   │   │   ├── auth/                # Auth components
│   │   │   │   ├── PrivateRoute.jsx
│   │   │   │   └── AdminRoute.jsx
│   │   │   └── layout/             # Layout components
│   │   │       └── Navbar.jsx
│   │   ├── pages/                   # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Challenges.jsx
│   │   │   ├── ChallengeDetails.jsx
│   │   │   ├── Activities.jsx
│   │   │   ├── Resources.jsx
│   │   │   ├── Bookings.jsx
│   │   │   ├── Rewards.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   └── admin/              # Admin pages
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminChallenges.jsx
│   │   │       ├── AdminResources.jsx
│   │   │       └── AdminReports.jsx
│   │   ├── store/                  # State management
│   │   │   └── authStore.js        # Zustand auth store
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                           # Node.js backend
│   ├── models/                       # Mongoose models
│   │   ├── User.js
│   │   ├── Challenge.js
│   │   ├── Activity.js
│   │   ├── Booking.js
│   │   ├── MentalHealthResource.js
│   │   ├── Reward.js
│   │   ├── Badge.js
│   │   └── Team.js
│   ├── routes/                       # Express routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── challengeRoutes.js
│   │   ├── activityRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── resourceRoutes.js
│   │   ├── rewardRoutes.js
│   │   └── adminRoutes.js
│   ├── controllers/                 # Route controllers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── challengeController.js
│   │   ├── activityController.js
│   │   ├── bookingController.js
│   │   ├── resourceController.js
│   │   ├── rewardController.js
│   │   └── adminController.js
│   ├── middleware/                   # Custom middleware
│   │   ├── auth.js                  # JWT authentication
│   │   ├── asyncHandler.js          # Async error handler
│   │   └── errorHandler.js          # Error handling
│   ├── utils/                        # Utility functions
│   │   ├── generateToken.js         # JWT token generation
│   │   └── validation.js            # Input validation
│   ├── config/                        # Configuration
│   │   └── database.js
│   ├── seeds/                        # Database seed scripts
│   │   └── seedDatabase.js
│   ├── server.js                     # Entry point
│   └── package.json
│
└── README.md
```

---

## 🏗️ System Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │  Store   │  │   API    │   │
│  │          │→ │          │→ │ (Zustand)│→ │ Services │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            │
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js/Express)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Routes  │→ │Controllers│→ │ Services │→ │  Models  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│       │              │              │              │        │
│       └──────────────┴──────────────┴──────────────┘        │
│                            │                                   │
│                    ┌───────▼────────┐                          │
│                    │  Middleware   │                          │
│                    │  (Auth, Error)│                          │
│                    └───────┬────────┘                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Mongoose ODM
                            │
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Users   │  │Challenges│  │Activities│  │ Bookings │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │Resources │  │ Rewards  │  │  Badges  │  │  Teams   │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure

**Frontend Component Hierarchy:**
```
App
├── Navbar
└── Routes
    ├── Public Routes
    │   ├── Login
    │   └── Register
    └── Private Routes
        ├── Dashboard
        ├── Challenges
        │   └── ChallengeDetails
        ├── Activities
        ├── Resources
        ├── Bookings
        ├── Rewards
        ├── Profile
        ├── Leaderboard
        └── Admin Routes
            ├── AdminDashboard
            ├── AdminChallenges
            ├── AdminResources
            └── AdminReports
```

### Data Flow

1. **Authentication Flow:**
   ```
   User Login → API Call → JWT Token → Store in Zustand → Set Axios Header
   ```

2. **Activity Logging Flow:**
   ```
   User Logs Activity → API Call → Calculate Points → Update User Points → 
   Update Streak → Check Badges → Update Challenge Progress (if applicable)
   ```

3. **Challenge Participation Flow:**
   ```
   User Joins Challenge → Add to Participants → Award Participation Points → 
   Track Progress → Update Leaderboard
   ```

---

## 📊 Database Schema

### ER Diagram (MongoDB Collections)

```
┌─────────────┐
│    User     │
├─────────────┤
│ _id         │
│ name        │
│ email       │
│ password    │
│ role        │
│ department  │
│ wellnessProfile
│   - totalPoints
│   - currentStreak
│   - badges[] ────┐
│ team ────────────┼──┐
└─────────────┘    │  │
                   │  │
┌─────────────┐    │  │
│   Badge      │    │  │
├─────────────┤    │  │
│ _id         │◄───┘  │
│ name        │       │
│ icon        │       │
│ criteria    │       │
└─────────────┘       │
                      │
┌─────────────┐       │
│   Team      │       │
├─────────────┤       │
│ _id         │◄──────┘
│ name        │
│ members[]   │
│ stats       │
└─────────────┘

┌─────────────┐
│  Challenge  │
├─────────────┤
│ _id         │
│ name        │
│ type        │
│ participants[] ────┐
│   - user ────────┼──┐
│   - progress     │  │
│ teams[] ─────────┼──┼──┐
└─────────────┘    │  │  │
                   │  │  │
┌─────────────┐    │  │  │
│  Activity   │    │  │  │
├─────────────┤    │  │  │
│ _id         │    │  │  │
│ user ───────┼────┘  │  │
│ type        │       │  │
│ value       │       │  │
│ points      │       │  │
│ challenge ──┼───────┘  │
└─────────────┘          │
                        │
┌─────────────┐         │
│  Booking    │         │
├─────────────┤         │
│ _id         │         │
│ user ───────┼─────────┘
│ sessionType │
│ scheduledDate
└─────────────┘

┌─────────────┐
│  Resource   │
├─────────────┤
│ _id         │
│ title       │
│ type        │
│ category    │
│ content      │
└─────────────┘

┌─────────────┐
│   Reward    │
├─────────────┤
│ _id         │
│ name        │
│ pointsCost  │
│ redemptions[]
│   - user ───┼──┐
└─────────────┘  │
                 │
                 └───► User (via redemptions)
```

### Model Relationships

- **User** → has many **Activities**
- **User** → belongs to one **Team** (optional)
- **User** → has many **Badges** (via wellnessProfile.badges)
- **User** → has many **Bookings**
- **Challenge** → has many **Participants** (Users)
- **Challenge** → has many **Teams** (optional)
- **Activity** → belongs to one **User**
- **Activity** → belongs to one **Challenge** (optional)
- **Reward** → has many **Redemptions** (Users)

---

## 🎮 Gamification Engine

### Points Calculation Formula

The platform uses a sophisticated points system based on activity type:

```javascript
Points Calculation Rules:
- Steps: 1 point per 100 steps
- Meditation: 10 points per minute
- Workout/Yoga/Walking/Running/Cycling: 20 points per minute
- Hydration: 5 points per glass
- Sleep: 2 points per hour
- Challenge Bonus: Points × challenge multiplier (if applicable)
- Streak Bonus: +10 points per day for maintaining streak
```

**Example:**
- 10,000 steps = 100 points
- 30 minutes meditation = 300 points
- 60 minutes workout = 1,200 points
- Challenge multiplier (1.5x) = 1,800 points

### Badge System

Badges are automatically awarded when users meet specific criteria:

| Badge Name | Criteria | Points Reward | Rarity |
|-----------|----------|---------------|--------|
| Early Bird | Log activity before 8 AM | 50 | Common |
| Streak Master | 7-day activity streak | 100 | Uncommon |
| Challenge Champion | Win a challenge | 200 | Rare |
| Wellness Warrior | 1000+ total points | 500 | Epic |
| Team Player | Participate in team challenges | 75 | Common |
| Meditation Master | 30 meditation sessions | 150 | Uncommon |
| Step Counter | 100,000 steps logged | 300 | Rare |

### Streaks

- **Daily Activity Streak:** Maintained by logging at least one activity per day
- **Streak Reset:** Resets if user misses a day
- **Longest Streak:** Tracks the user's best streak ever
- **Streak Bonus:** +10 bonus points per day for maintaining streak

### Weekly Challenge Resets

- Challenges can be configured with weekly resets
- Progress resets at the start of each week
- Leaderboard resets weekly
- Weekly winners receive bonus points

### Team vs Team Progress Rules

- Teams compete in team challenges
- Team points = sum of all team members' points
- Team leaderboard sorted by total team points
- Team challenges can have team-specific rewards

### Achievement Triggers

Badges are automatically checked and awarded when:
1. User logs an activity
2. User reaches a points milestone
3. User completes a challenge
4. User maintains a streak milestone
5. User joins a team challenge

### Reward Redemption Logic

```javascript
Redemption Process:
1. Check if user has sufficient points
2. Check if reward is available (stock, expiry)
3. Deduct points from user account
4. Create redemption record
5. Generate redemption code
6. Update reward availability
7. Return redemption code to user
```

---

## 🔌 Complete API Design

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-api-domain.com/api
```

### Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

---

### Auth APIs

#### Register
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "department": "Engineering",
  "employeeId": "EMP001",
  "role": "employee"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "employee"
    },
    "token": "jwt_access_token"
  }
}
```

#### Login
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:** Same as Register
- **Error Cases:**
  - 401: Invalid credentials
  - 429: Too many login attempts (rate limited)

#### Refresh Token
- **Method:** `POST`
- **URL:** `/api/auth/refresh`
- **Access:** Public
- **Request:** Refresh token in cookie or body
- **Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_access_token",
    "user": {...}
  }
}
```

#### Logout
- **Method:** `POST`
- **URL:** `/api/auth/logout`
- **Access:** Private
- **Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### User APIs

#### Get Profile
- **Method:** `GET`
- **URL:** `/api/users/profile`
- **Access:** Private

#### Update Profile
- **Method:** `PUT`
- **URL:** `/api/users/profile`
- **Access:** Private
- **Request Body:**
```json
{
  "name": "John Doe",
  "department": "Engineering",
  "employeeId": "EMP001"
}
```

#### Get Leaderboard
- **Method:** `GET`
- **URL:** `/api/users/leaderboard?type=overall&limit=50`
- **Access:** Private
- **Query Params:**
  - `type`: `overall` | `team`
  - `limit`: number (default: 50)

#### Get Badges
- **Method:** `GET`
- **URL:** `/api/users/badges`
- **Access:** Private

#### Get Activity Summary
- **Method:** `GET`
- **URL:** `/api/users/activity-summary?startDate=2024-01-01&endDate=2024-01-31`
- **Access:** Private

---

### Challenge APIs

#### Get Challenges
- **Method:** `GET`
- **URL:** `/api/challenges?status=active&type=steps`
- **Access:** Private
- **Query Params:**
  - `status`: `upcoming` | `active` | `completed` | `cancelled`
  - `type`: `steps` | `meditation` | `workout` | etc.

#### Get Challenge Details
- **Method:** `GET`
- **URL:** `/api/challenges/:id`
- **Access:** Private

#### Create Challenge (Admin)
- **Method:** `POST`
- **URL:** `/api/challenges`
- **Access:** Admin/HR
- **Request Body:**
```json
{
  "name": "10K Steps Daily",
  "description": "Walk 10,000 steps every day",
  "type": "steps",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "rules": {
    "targetValue": 10000,
    "unit": "steps",
    "pointMultiplier": 1.5
  },
  "rewards": {
    "firstPlace": { "points": 500 },
    "participation": { "points": 50 }
  }
}
```

#### Join Challenge
- **Method:** `POST`
- **URL:** `/api/challenges/:id/join`
- **Access:** Private

#### Leave Challenge
- **Method:** `DELETE`
- **URL:** `/api/challenges/:id/leave`
- **Access:** Private

#### Get Challenge Leaderboard
- **Method:** `GET`
- **URL:** `/api/challenges/:id/leaderboard`
- **Access:** Private

---

### Activity APIs

#### Log Activity
- **Method:** `POST`
- **URL:** `/api/activities`
- **Access:** Private
- **Request Body:**
```json
{
  "type": "steps",
  "title": "Morning Walk",
  "value": 10000,
  "unit": "steps",
  "description": "Walked in the park",
  "activityDate": "2024-01-15",
  "challenge": "challenge_id_optional",
  "metadata": {
    "device": "fitbit",
    "duration": 60
  }
}
```

#### Get My Activities
- **Method:** `GET`
- **URL:** `/api/activities?type=steps&startDate=2024-01-01&limit=50&page=1`
- **Access:** Private

#### Get All Activities (Admin)
- **Method:** `GET`
- **URL:** `/api/activities/all?userId=...&type=...`
- **Access:** Admin/HR

---

### Booking APIs

#### Book Session
- **Method:** `POST`
- **URL:** `/api/bookings`
- **Access:** Private
- **Request Body:**
```json
{
  "sessionType": "yoga",
  "title": "Morning Yoga Session",
  "description": "Gentle yoga flow",
  "scheduledDate": "2024-01-20T10:00:00Z",
  "duration": 60,
  "location": "online",
  "meetingLink": "https://zoom.us/j/..."
}
```

#### Get My Bookings
- **Method:** `GET`
- **URL:** `/api/bookings?status=confirmed&upcoming=true`
- **Access:** Private

#### Cancel Booking
- **Method:** `DELETE`
- **URL:** `/api/bookings/:id`
- **Access:** Private
- **Request Body:**
```json
{
  "reason": "Schedule conflict"
}
```

---

### Resource APIs

#### Get Resources
- **Method:** `GET`
- **URL:** `/api/resources?type=article&category=stress-management&search=...`
- **Access:** Private

#### Get Resource
- **Method:** `GET`
- **URL:** `/api/resources/:id`
- **Access:** Private

#### Create Resource (Admin)
- **Method:** `POST`
- **URL:** `/api/resources`
- **Access:** Admin/HR

#### Track Access
- **Method:** `POST`
- **URL:** `/api/resources/:id/access`
- **Access:** Private

#### Rate Resource
- **Method:** `POST`
- **URL:** `/api/resources/:id/rating`
- **Access:** Private
- **Request Body:**
```json
{
  "rating": 5
}
```

#### Anonymous Check-in
- **Method:** `POST`
- **URL:** `/api/resources/check-in`
- **Access:** Public
- **Request Body:**
```json
{
  "mood": 5,
  "stressLevel": 7,
  "notes": "Feeling stressed about work"
}
```

---

### Reward APIs

#### Get Rewards
- **Method:** `GET`
- **URL:** `/api/rewards?type=discount&available=true`
- **Access:** Private

#### Claim Reward
- **Method:** `POST`
- **URL:** `/api/rewards/:id/claim`
- **Access:** Private
- **Response:**
```json
{
  "success": true,
  "data": {
    "redemptionCode": "RW-1234567890-ABC123",
    "remainingPoints": 500,
    "redemptionInstructions": "Contact HR with code"
  }
}
```

---

### Admin APIs

#### Get Analytics
- **Method:** `GET`
- **URL:** `/api/admin/analytics?startDate=...&endDate=...`
- **Access:** Admin/HR

#### Generate Report
- **Method:** `GET`
- **URL:** `/api/admin/reports?startDate=...&endDate=...`
- **Access:** Admin/HR

#### Export CSV
- **Method:** `GET`
- **URL:** `/api/admin/export/csv?type=activities&startDate=...`
- **Access:** Admin/HR
- **Response:** CSV file download

#### Export PDF
- **Method:** `GET`
- **URL:** `/api/admin/export/pdf?type=summary`
- **Access:** Admin/HR
- **Response:** PDF file download

#### Get Team Leaderboard
- **Method:** `GET`
- **URL:** `/api/admin/team-leaderboard`
- **Access:** Admin/HR

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd WellnessAtWork
```

2. **Install backend dependencies**
```bash
cd server
npm install
```

3. **Install frontend dependencies**
```bash
cd ../client
npm install
```

4. **Set up environment variables**

Create `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wellnessatwork
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wellnessatwork

JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

5. **Seed the database**
```bash
cd server
npm run seed
```

This will create:
- 1 Admin user (admin@wellnessatwork.com / admin123)
- 1 HR user (hr@wellnessatwork.com / hr123)
- 5 Employee users (john.doe@wellnessatwork.com / employee123)
- Sample challenges, activities, resources, rewards, badges, and teams

6. **Start the development servers**

Backend (Terminal 1):
```bash
cd server
npm run dev
```

Frontend (Terminal 2):
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 🚢 Deployment Guide

### Backend Deployment (Render/Heroku)

#### Option 1: Render

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Configure build settings:**
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment: Node
4. **Add environment variables:**
   - `NODE_ENV=production`
   - `PORT=5000` (or use Render's assigned port)
   - `MONGODB_URI=your-mongodb-atlas-connection-string`
   - `JWT_SECRET=your-production-jwt-secret`
   - `JWT_REFRESH_SECRET=your-production-refresh-secret`
   - `CORS_ORIGIN=https://your-frontend-domain.com`
5. **Deploy**

#### Option 2: Heroku

1. **Install Heroku CLI** and login
2. **Create Heroku app:**
```bash
cd server
heroku create wellnessatwork-api
```
3. **Add MongoDB Atlas addon** (or configure connection string)
4. **Set environment variables:**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set JWT_REFRESH_SECRET=your-refresh-secret
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com
```
5. **Deploy:**
```bash
git push heroku main
```

### Frontend Deployment (Vercel/Netlify)

#### Option 1: Vercel

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```
2. **Deploy:**
```bash
cd client
vercel
```
3. **Add environment variable:**
   - `VITE_API_URL=https://your-backend-api-url.com/api`
4. **Redeploy** after adding environment variable

#### Option 2: Netlify

1. **Build the project:**
```bash
cd client
npm run build
```
2. **Deploy to Netlify:**
   - Drag and drop the `dist` folder, OR
   - Connect GitHub and set:
     - Build command: `npm run build`
     - Publish directory: `dist`
3. **Add environment variable:**
   - `VITE_API_URL=https://your-backend-api-url.com/api`
4. **Redeploy**

### MongoDB Atlas Setup

1. **Create a MongoDB Atlas account** at https://www.mongodb.com/cloud/atlas
2. **Create a new cluster** (Free tier available)
3. **Create a database user:**
   - Go to Database Access
   - Add New Database User
   - Set username and password
4. **Whitelist IP addresses:**
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (for development)
   - For production, add specific IPs
5. **Get connection string:**
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
6. **Update `MONGODB_URI` in your deployment environment variables**

### Production Build Optimization

**Backend:**
- Set `NODE_ENV=production`
- Use PM2 or similar process manager
- Enable compression middleware
- Set up logging (Winston, Morgan)
- Configure CORS properly

**Frontend:**
- Build with `npm run build`
- Enable code splitting
- Optimize images
- Use CDN for static assets
- Enable gzip compression

### CORS Configuration

Update CORS in `server/server.js`:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### JWT Refresh Strategy

- **Access tokens:** Stored in memory (React state)
- **Refresh tokens:** Stored in httpOnly cookies
- **Token refresh:** Automatic via axios interceptor
- **Logout:** Clears both tokens

---

## 🔒 Security & Best Practices

### Password Hashing
- Uses **bcryptjs** with 10 salt rounds
- Passwords are hashed before saving to database
- Never stored in plain text

### Rate Limiting
- General API: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes per IP
- Prevents brute force attacks

### Helmet.js
- Sets secure HTTP headers
- Prevents XSS attacks
- Prevents clickjacking
- Hides Express version

### Role-Based Access Control (RBAC)
- Three roles: `employee`, `admin`, `hr`
- Admin/HR can access admin routes
- Middleware: `authorize('admin', 'hr')`

### Input Validation
- Uses Joi for request validation
- Validates all user inputs
- Prevents injection attacks
- Sanitizes data

### File Upload Safety
- Validates file types
- Limits file sizes
- Stores files securely
- Scans for malware (in production)

### Refresh Token Storage
- Stored in httpOnly cookies (secure)
- Not accessible via JavaScript
- Prevents XSS token theft
- Expires after 7 days

### Additional Security Measures
- HTTPS in production
- Environment variables for secrets
- No sensitive data in logs
- Regular security updates
- SQL injection prevention (MongoDB)

---

## 📝 Sample Dataset / Seed Script

The seed script (`server/seeds/seedDatabase.js`) creates:

### Users
- 1 Admin user
- 1 HR user
- 5 Employee users with varying wellness profiles

### Challenges
- 10K Steps Daily Challenge (30 days)
- Mindful Meditation Month (30 days)
- Weekly Workout Challenge (7 days)

### Activities
- 50+ sample activities across different types
- Distributed across users and dates

### Resources
- 5 mental health resources (articles, videos, podcasts, worksheets)
- Various categories and tags

### Rewards
- 5 rewards with different point costs
- Mix of physical, digital, and experience rewards

### Badges
- 7 predefined badges with criteria

### Teams
- 2 teams with members

### Bookings
- 3 sample bookings

**To run seed:**
```bash
cd server
npm run seed
```

---

## 🎯 Bonus Features (Implementation Notes)

### Fitbit/Apple Health Mock Integration
- Activity metadata includes `device` field
- Can be extended to sync with real APIs
- Webhook endpoints for device sync

### Anonymous Mental Health Check-in
- Public endpoint: `/api/resources/check-in`
- No authentication required
- Returns recommended resources based on mood/stress level
- Data not stored (privacy-first)

### AI Wellness Recommendation Engine
- Can be implemented using:
  - User activity patterns
  - Machine learning models
  - Recommendation algorithms
  - Integration with OpenAI/Claude APIs

### Session Webinar Scheduling
- Booking system supports webinar type
- Can integrate with:
  - Zoom API
  - Google Meet API
  - Microsoft Teams API
- Automatic meeting link generation

### Chatbot for Wellness Queries
- Can be added as a React component
- Integrate with:
  - OpenAI GPT
  - Dialogflow
  - Custom NLP models
- Endpoint: `/api/chat` (to be implemented)

---

## 📸 Screenshots Placeholders

Add screenshots of:
1. Login/Register pages
2. Dashboard with charts
3. Challenges page
4. Activity logging
5. Resources library
6. Bookings calendar
7. Rewards marketplace
8. Leaderboard
9. Admin dashboard
10. Admin reports

---

## 🎥 Demo Video Instructions

1. **Record a walkthrough** showing:
   - User registration/login
   - Dashboard overview
   - Joining a challenge
   - Logging activities
   - Viewing leaderboard
   - Claiming rewards
   - Admin features

2. **Upload to:**
   - YouTube (unlisted)
   - Vimeo
   - Google Drive

3. **Add link to README**

---

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Authors

- Your Name - Initial work

---

## 🙏 Acknowledgments

- MongoDB for database hosting
- React team for the amazing framework
- Express.js community
- All open-source contributors

---

## 📞 Support

For support, email support@wellnessatwork.com or create an issue in the repository.

---

**Note:** This is a final semester project. Ensure all environment variables are properly configured before deployment. The project follows industrial-level best practices and is production-ready.

---

## 📚 Additional Documentation

- [API Documentation](./docs/API.md) - Detailed API reference
- [Database Schema](./docs/DATABASE.md) - Complete schema documentation
- [Deployment Guide](./docs/DEPLOYMENT.md) - Step-by-step deployment
- [Contributing Guide](./docs/CONTRIBUTING.md) - How to contribute

---

**Built with ❤️ for employee wellness**
