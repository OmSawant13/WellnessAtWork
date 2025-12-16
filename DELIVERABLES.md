# 📦 Project Deliverables - WellnessAtWork

## ✅ 1. Deployed Platform

### 🌐 Live URLs

**Frontend (Static Site):**
```
https://wellnessatwork-frontend.onrender.com
```

**Backend API (Web Service):**
```
https://wellnessatwork-backend.onrender.com
```

**API Base URL:**
```
https://wellnessatwork-backend.onrender.com/api
```

**Health Check:**
```
https://wellnessatwork-backend.onrender.com/api/health
```

### 🔐 Test Credentials

**Admin Account:**
```
Email: admin@wellnessatwork.com
Password: admin123
Role: Admin
Access: Full admin access + Verification
```

**HR Account:**
```
Email: hr@wellnessatwork.com
Password: hr123456
Role: HR
Access: Admin access + Verification
```

**Employee Account:**
```
Email: john.doe@wellnessatwork.com
Password: employee123
Role: Employee
```

### 📱 Platform Features

- ✅ User Authentication & Authorization
- ✅ Challenge Management System
- ✅ Activity Logging with Photo Upload
- ✅ Admin Verification System
- ✅ Points & Rewards System
- ✅ Analytics Dashboard
- ✅ Google Fit Integration
- ✅ Real-time Progress Tracking
- ✅ Leaderboard
- ✅ Mental Health Resources

---

## 📚 2. API Collection

### 🔗 Base URL
```
https://wellnessatwork-backend.onrender.com/api
```

### 📋 Complete API Endpoints

#### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/logout` | User logout | Yes |
| POST | `/auth/refresh` | Refresh access token | No (cookie) |
| GET | `/auth/me` | Get current user | Yes |
| GET | `/auth/google-fit/connect` | Get Google Fit OAuth URL | Yes |
| GET | `/auth/google-fit/callback` | Google Fit OAuth callback | Yes |
| GET | `/auth/google-fit/status` | Check Google Fit status | Yes |
| POST | `/auth/google-fit/disconnect` | Disconnect Google Fit | Yes |

#### 👤 User (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/profile` | Get user profile | Yes |
| PUT | `/users/profile` | Update user profile | Yes |
| GET | `/users/leaderboard` | Get leaderboard | Yes |
| GET | `/users/badges` | Get user badges | Yes |
| GET | `/users/activity-summary` | Get activity summary | Yes |
| GET | `/users/stats` | Get user statistics | Yes |

#### 🎯 Challenges (`/api/challenges`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/challenges` | Get all challenges | Yes |
| GET | `/challenges/:id` | Get challenge details | Yes |
| GET | `/challenges/:id/my-progress` | Get my progress | Yes |
| GET | `/challenges/:id/leaderboard` | Get challenge leaderboard | Yes |
| POST | `/challenges` | Create challenge | Admin/HR |
| POST | `/challenges/:id/join` | Join challenge | Yes |
| DELETE | `/challenges/:id/leave` | Leave challenge | Yes |
| PUT | `/challenges/:id` | Update challenge | Admin/HR |
| DELETE | `/challenges/:id` | Delete challenge | Admin/HR |

#### 📊 Activities (`/api/activities`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/activities` | Log activity (with photos) | Yes |
| GET | `/activities` | Get my activities | Yes |
| GET | `/activities/all` | Get all activities | Admin/HR |
| GET | `/activities/unverified` | Get unverified activities | Admin/HR |
| GET | `/activities/:id` | Get activity details | Yes |
| PUT | `/activities/:id` | Update activity | Yes |
| DELETE | `/activities/:id` | Delete activity | Yes |
| POST | `/activities/:id/verify` | Verify activity | Admin/HR |
| POST | `/activities/:id/reject` | Reject activity | Admin/HR |

#### 🛒 Rewards (`/api/rewards`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/rewards` | Get all rewards | Yes |
| GET | `/rewards/:id` | Get reward details | Yes |
| POST | `/rewards/:id/claim` | Claim reward | Yes |
| GET | `/rewards/my/redemptions` | Get my redemptions | Yes |
| POST | `/rewards` | Create reward | Admin/HR |
| PUT | `/rewards/:id` | Update reward | Admin/HR |
| DELETE | `/rewards/:id` | Delete reward | Admin/HR |

#### 📅 Bookings (`/api/bookings`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/bookings` | Book session | Yes |
| GET | `/bookings` | Get my bookings | Yes |
| GET | `/bookings/all` | Get all bookings | Admin/HR |
| GET | `/bookings/:id` | Get booking details | Yes |
| PUT | `/bookings/:id` | Update booking | Yes |
| DELETE | `/bookings/:id` | Cancel booking | Yes |

#### 📚 Resources (`/api/resources`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/resources` | Get resources | Yes |
| GET | `/resources/:id` | Get resource details | Yes |
| POST | `/resources/:id/access` | Track access | Yes |
| POST | `/resources/:id/rating` | Rate resource | Yes |
| POST | `/resources` | Create resource | Admin/HR |
| PUT | `/resources/:id` | Update resource | Admin/HR |
| DELETE | `/resources/:id` | Delete resource | Admin/HR |

#### 👨‍💼 Admin (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/analytics` | Get analytics | Admin/HR |
| GET | `/admin/users` | Get all users | Admin/HR |
| GET | `/admin/user-challenges` | Get user challenges | Admin/HR |
| GET | `/admin/user-activities` | Get user activities | Admin/HR |
| GET | `/admin/department-analytics` | Get department stats | Admin/HR |
| POST | `/admin/challenges/:id/assign-department` | Assign to department | Admin/HR |
| POST | `/admin/challenges/:id/assign-users` | Assign to users | Admin/HR |
| GET | `/admin/reports` | Generate report | Admin/HR |
| GET | `/admin/export/csv` | Export CSV | Admin/HR |
| GET | `/admin/export/pdf` | Export PDF | Admin/HR |

#### ⚔️ Battles (`/api/battles`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/battles` | Create battle | Yes |
| GET | `/battles` | Get my battles | Yes |
| PUT | `/battles/:id/respond` | Respond to battle | Yes |
| PUT | `/battles/:id/progress` | Update battle progress | Yes |

#### 📱 Wellness Posts (`/api/wellness-posts`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/wellness-posts` | Create post | Yes |
| GET | `/wellness-posts` | Get posts | Yes |
| POST | `/wellness-posts/:id/like` | Like post | Yes |
| POST | `/wellness-posts/:id/comment` | Comment on post | Yes |
| DELETE | `/wellness-posts/:id` | Delete post | Yes |

#### 🎁 Loot Boxes (`/api/loot-boxes`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/loot-boxes/open` | Open loot box | Yes |
| GET | `/loot-boxes` | Get my loot boxes | Yes |
| GET | `/loot-boxes/check` | Check loot box availability | Yes |

#### 📸 Quick Snaps (`/api/quick-snaps`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/quick-snaps` | Start quick snap | Yes |
| PUT | `/quick-snaps/:id/complete` | Complete quick snap | Yes |
| GET | `/quick-snaps` | Get my quick snaps | Yes |
| GET | `/quick-snaps/types` | Get quick snap types | Yes |

---

## 📦 3. Repository

### 🔗 GitHub Repository

**Repository URL:**
```
https://github.com/OmSawant13/WellnessAtWork
```

**Clone Command:**
```bash
git clone https://github.com/OmSawant13/WellnessAtWork.git
```

### 📁 Repository Structure

```
WellnessAtWork/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/           # API services
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state management
│   │   └── App.jsx        # Main app
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Backend (Node.js + Express)
│   ├── config/            # Database config
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth, upload, errors
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── seeds/            # Database seeding
│   ├── utils/            # Utilities
│   ├── server.js         # Main server
│   └── package.json
│
├── README.md              # Project documentation
├── RENDER_DEPLOYMENT.md   # Deployment guide
├── BACKEND_COMPLETE_REVISION.md  # Backend docs
└── DELIVERABLES.md       # This file
```

### 🔧 Setup Instructions

**Backend:**
```bash
cd server
npm install
npm run seed  # Seed database
npm run dev   # Start dev server
```

**Frontend:**
```bash
cd client
npm install
npm run dev   # Start dev server
```

---

## 🎁 4. Bonus: Sample Challenge Dataset

### 📊 Database Seeded Data

**Total Records:**
- ✅ 7 Badges
- ✅ 7 Users (1 Admin, 1 HR, 5 Employees)
- ✅ 2 Teams
- ✅ 7 Challenges
- ✅ 50 Activities
- ✅ 5 Mental Health Resources
- ✅ 5 Rewards
- ✅ 3 Bookings

### 🎯 Sample Challenges

#### Challenge 1: 10K Steps Daily Challenge
```json
{
  "name": "10K Steps Daily Challenge",
  "type": "steps",
  "targetValue": 10000,
  "unit": "steps",
  "pointMultiplier": 1.5,
  "requiresPhoto": false,
  "status": "active",
  "duration": 30
}
```

#### Challenge 2: Mindful Meditation Month
```json
{
  "name": "Mindful Meditation Month",
  "type": "meditation",
  "targetValue": 30,
  "unit": "minutes",
  "pointMultiplier": 2.0,
  "requiresPhoto": false,
  "status": "active",
  "duration": 30
}
```

#### Challenge 3: Weekly Workout Challenge
```json
{
  "name": "Weekly Workout Challenge",
  "type": "workout",
  "targetValue": 30,
  "unit": "minutes",
  "pointMultiplier": 2.0,
  "requiresPhoto": true,
  "minPhotos": 1,
  "maxPhotos": 3,
  "status": "active",
  "duration": 7
}
```

#### Challenge 4: Hydration Challenge
```json
{
  "name": "8 Glasses Daily",
  "type": "hydration",
  "targetValue": 8,
  "unit": "glasses",
  "pointMultiplier": 1.0,
  "requiresPhoto": true,
  "minPhotos": 1,
  "timeGap": 2,
  "status": "active",
  "duration": 7
}
```

#### Challenge 5: Eat Healthy Challenge
```json
{
  "name": "Eat 3 Healthy Meals Today",
  "type": "nutrition",
  "targetValue": 3,
  "unit": "meals",
  "pointMultiplier": 1.5,
  "requiresPhoto": true,
  "minPhotos": 3,
  "maxPhotos": 9,
  "status": "active",
  "duration": 1
}
```

### 👥 Sample Users

**Admin:**
- Email: `admin@wellnessatwork.com`
- Password: `admin123`
- Role: `admin`

**HR:**
- Email: `hr@wellnessatwork.com`
- Password: `hr123456`
- Role: `hr`

**Employees:**
- `john.doe@wellnessatwork.com` / `employee123`
- `jane.smith@wellnessatwork.com` / `employee123`
- `mike.johnson@wellnessatwork.com` / `employee123`
- `sarah.williams@wellnessatwork.com` / `employee123`
- `david.brown@wellnessatwork.com` / `employee123`

### 🏆 Sample Badges

1. **Early Bird** - Log activity before 8 AM
2. **Streak Master** - Maintain 7-day streak
3. **Challenge Champion** - Win a challenge
4. **Wellness Warrior** - Earn 1000+ points
5. **Team Player** - Participate in team challenges
6. **Meditation Master** - Complete meditation challenges
7. **Fitness Fanatic** - Complete fitness challenges

### 🎁 Sample Rewards

1. **Wellness Gift Card** - 500 points
2. **Gym Membership** - 1000 points
3. **Healthy Meal Voucher** - 300 points
4. **Yoga Class Pass** - 400 points
5. **Wellness Book** - 200 points

---

## 📝 API Collection Format (Postman)

### Import Instructions

1. Open Postman
2. Click "Import"
3. Select "Raw Text"
4. Paste the following JSON:

```json
{
  "info": {
    "name": "WellnessAtWork API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\",\n  \"role\": \"employee\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@wellnessatwork.com\",\n  \"password\": \"admin123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        },
        {
          "name": "Get Me",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/auth/me",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "me"]
            }
          }
        }
      ]
    },
    {
      "name": "Challenges",
      "item": [
        {
          "name": "Get Challenges",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/challenges",
              "host": ["{{baseUrl}}"],
              "path": ["challenges"]
            }
          }
        },
        {
          "name": "Join Challenge",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/challenges/:id/join",
              "host": ["{{baseUrl}}"],
              "path": ["challenges", ":id", "join"],
              "variable": [
                {
                  "key": "id",
                  "value": "challenge-id-here"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "Activities",
      "item": [
        {
          "name": "Log Activity",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "formdata",
              "formdata": [
                {
                  "key": "type",
                  "value": "steps"
                },
                {
                  "key": "value",
                  "value": "5000"
                },
                {
                  "key": "unit",
                  "value": "steps"
                },
                {
                  "key": "photos",
                  "type": "file",
                  "src": []
                }
              ]
            },
            "url": {
              "raw": "{{baseUrl}}/activities",
              "host": ["{{baseUrl}}"],
              "path": ["activities"]
            }
          }
        },
        {
          "name": "Get My Activities",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/activities",
              "host": ["{{baseUrl}}"],
              "path": ["activities"]
            }
          }
        }
      ]
    },
    {
      "name": "Admin",
      "item": [
        {
          "name": "Get Analytics",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/admin/analytics",
              "host": ["{{baseUrl}}"],
              "path": ["admin", "analytics"]
            }
          }
        },
        {
          "name": "Verify Activity",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/activities/:id/verify",
              "host": ["{{baseUrl}}"],
              "path": ["activities", ":id", "verify"],
              "variable": [
                {
                  "key": "id",
                  "value": "activity-id-here"
                }
              ]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://wellnessatwork-backend.onrender.com/api"
    },
    {
      "key": "token",
      "value": ""
    },
    {
      "key": "adminToken",
      "value": ""
    }
  ]
}
```

### Environment Variables

**Postman Environment:**
```json
{
  "baseUrl": "https://wellnessatwork-backend.onrender.com/api",
  "token": "your-access-token-here",
  "adminToken": "admin-access-token-here"
}
```

---

## 🎯 Project Summary

### Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer (File Upload)
- 17 Libraries

**Frontend:**
- React 18
- Vite
- Zustand (State Management)
- React Router v6
- TailwindCSS
- Recharts (Charts)
- 16 Libraries

### Key Features

✅ User Authentication & Authorization  
✅ Challenge Management System  
✅ Activity Logging with Photo Upload  
✅ Admin Verification System  
✅ Points & Rewards System  
✅ Analytics Dashboard  
✅ Google Fit Integration  
✅ Real-time Progress Tracking  
✅ Leaderboard  
✅ Mental Health Resources  

### Total API Endpoints: 80+

### Database Models: 12

### Total Libraries: 33

---

## 📞 Support & Documentation

**Repository:** https://github.com/OmSawant13/WellnessAtWork

**Deployment Guide:** See `RENDER_DEPLOYMENT.md`

**Backend Documentation:** See `BACKEND_COMPLETE_REVISION.md`

---

## ✅ Deliverables Checklist

- [x] Deployed Platform (Frontend + Backend)
- [x] API Collection (Complete endpoints list)
- [x] Repository (GitHub)
- [x] Sample Challenge Dataset (Seeded database)

---

**Project Status:** ✅ Complete & Deployed

**Last Updated:** December 2024

