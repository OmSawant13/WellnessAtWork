# 🔥 Backend Complete Revision - WellnessAtWork

## 📁 Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/             # Business logic (12 files)
│   ├── activityController.js
│   ├── adminController.js
│   ├── authController.js
│   ├── battleController.js
│   ├── bookingController.js
│   ├── challengeController.js
│   ├── lootBoxController.js
│   ├── quickSnapController.js
│   ├── resourceController.js
│   ├── rewardController.js
│   ├── userController.js
│   └── wellnessPostController.js
├── middleware/              # Middleware functions
│   ├── asyncHandler.js      # Async error wrapper
│   ├── auth.js              # JWT authentication
│   ├── errorHandler.js      # Error handling
│   └── upload.js            # Multer file upload
├── models/                  # Database schemas (12 models)
│   ├── Activity.js
│   ├── Badge.js
│   ├── Battle.js
│   ├── Booking.js
│   ├── Challenge.js
│   ├── LootBox.js
│   ├── MentalHealthResource.js
│   ├── QuickSnap.js
│   ├── Reward.js
│   ├── Team.js
│   ├── User.js
│   └── WellnessPost.js
├── routes/                  # API endpoints (12 route files)
│   ├── activityRoutes.js
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── battleRoutes.js
│   ├── bookingRoutes.js
│   ├── challengeRoutes.js
│   ├── lootBoxRoutes.js
│   ├── quickSnapRoutes.js
│   ├── resourceRoutes.js
│   ├── rewardRoutes.js
│   ├── userRoutes.js
│   └── wellnessPostRoutes.js
├── seeds/                   # Database seeding
│   ├── seedDatabase.js      # Seed data
│   └── clearDatabase.js     # Clear database
├── utils/                   # Utility functions
│   ├── generateToken.js     # JWT token generation
│   ├── googleFit.js         # Google Fit API
│   └── validation.js       # Validation helpers
├── uploads/                 # File uploads directory
│   └── photos/              # Uploaded photos
├── server.js                # Main server file
└── package.json             # Dependencies
```

---

## 🚀 1. SERVER.JS - Main Entry Point

### Purpose:
- Express app setup
- Middleware configuration
- Route mounting
- MongoDB connection
- Server startup

### Key Features:

#### 1.1 Middleware Stack:
```javascript
1. helmet()              // Security headers
2. cors()                // Cross-origin requests
3. express.json()        // JSON body parser (50MB limit)
4. express.urlencoded()  // Form data parser (50MB limit)
5. cookieParser()        // Cookie parsing
6. rateLimit()           // Rate limiting (DDoS protection)
```

#### 1.2 Rate Limiting:
- **General API**: 200 requests/15 min (production)
- **Auth endpoints**: 10 requests/15 min (production)
- **Development**: 5000 requests/15 min (lenient)

#### 1.3 Routes Mounted:
```javascript
/api/auth              → Authentication
/api/users             → User operations
/api/challenges        → Challenge management
/api/activities        → Activity logging
/api/bookings          → Booking system
/api/resources         → Mental health resources
/api/rewards           → Rewards & shop
/api/admin             → Admin operations
/api/battles           → 1v1 battles
/api/wellness-posts    → Social posts
/api/loot-boxes        → Loot box system
/api/quick-snaps       → Quick snap challenges
```

#### 1.4 Static File Serving:
```javascript
app.use('/uploads', express.static('uploads'))
// Serves uploaded photos at: http://localhost:5001/uploads/photos/filename.jpg
```

#### 1.5 Error Handling:
- Global error handler
- 404 handler
- Development stack traces

---

## 🔐 2. MIDDLEWARE

### 2.1 auth.js - Authentication Middleware

#### `protect` - JWT Verification:
```javascript
// Flow:
1. Extract token from Authorization header
2. Verify JWT signature
3. Decode user ID
4. Fetch user from database
5. Attach user to req.user
6. Continue to next middleware
```

**Usage:**
```javascript
router.get('/profile', protect, userController.getProfile)
```

#### `authorize` - Role-Based Access:
```javascript
// Flow:
1. Check if user role is in allowed roles
2. Allow: admin, hr, employee
3. Reject if unauthorized
```

**Usage:**
```javascript
router.get('/admin', protect, authorize('admin', 'hr'), adminController.getAnalytics)
```

### 2.2 asyncHandler.js - Async Error Wrapper:
```javascript
// Wraps async functions to catch errors
// Automatically forwards errors to error handler
```

**Usage:**
```javascript
exports.getUser = asyncHandler(async (req, res) => {
  // No need for try-catch!
  const user = await User.findById(req.params.id)
  res.json({ success: true, data: user })
})
```

### 2.3 errorHandler.js - Global Error Handler:
```javascript
// Handles:
- Mongoose validation errors
- JWT errors
- Duplicate key errors
- Cast errors (invalid ObjectId)
- Custom errors
```

### 2.4 upload.js - Multer File Upload:
```javascript
// Configuration:
- Storage: diskStorage (saves to uploads/photos/)
- File filter: Only images (jpeg, jpg, png, gif, webp)
- Size limit: 10MB per file
- Filename: timestamp-random-originalname
```

**Usage:**
```javascript
router.post('/', protect, upload.array('photos', 10), activityController.logActivity)
```

---

## 📊 3. MODELS - Database Schemas

### 3.1 User Model

#### Key Fields:
```javascript
- name, email, password
- role: 'employee' | 'admin' | 'hr'
- department, employeeId
- wellnessProfile: {
    totalPoints, currentStreak, level
    monthlyPoints: [{ month, points, targetPoints }]
    weeklyYogaSessions: [{ week, sessions }]
    badges: [ObjectId]
    googleFitToken, googleFitRefreshToken
  }
```

#### Methods:
- `comparePassword()` - Password verification
- `addPoints()` - Add points & update level
- `updateStreak()` - Daily streak tracking
- `trackYogaSession()` - Weekly yoga tracking
- `updateHealthStatus()` - Health score calculation

#### Pre-save Hook:
- Password hashing (bcrypt, 10 rounds)

### 3.2 Challenge Model

#### Key Fields:
```javascript
- name, description, type
- startDate, endDate, expiresAt
- isDailyChallenge: true
- rules: {
    targetValue, unit
    pointMultiplier
    requiresPhoto, minPhotos, maxPhotos
    timeGap (for hydration)
  }
- participants: [{
    user, progress, points
    dailyProgress: [{ date, value, completed }]
  }]
```

#### Methods:
- `addParticipant()` - Add user to challenge
- `updateParticipantProgress()` - Update progress & check completion
- `getTodayProgress()` - Get today's progress

### 3.3 Activity Model

#### Key Fields:
```javascript
- user, type, value, unit, points
- challenge (optional reference)
- activityDate
- verified, verifiedBy, verifiedAt
- photo: {
    type: 'single' | 'multiple'
    url, urls: [{ url, uploadedAt }]
    verified
  }
- metadata: { duration, distance, calories, etc. }
```

#### Static Methods:
- `calculatePoints(type, value, unit)` - Points calculation

#### Pre-save Hook:
- Auto-calculate points if not provided

#### Points Formula:
```javascript
steps: value / 100
meditation: value * 10 (per minute)
workout/yoga: value * 20 (per minute)
hydration: value * 5 (per glass)
sleep: value * 2 (per hour)
nutrition: value * 15 (per meal)
```

### 3.4 Other Models:
- **Badge**: Achievement badges
- **Reward**: Shop items
- **Booking**: Counseling sessions
- **MentalHealthResource**: Resources
- **Team**: Team challenges
- **Battle**: 1v1 battles
- **WellnessPost**: Social posts
- **LootBox**: Loot box rewards
- **QuickSnap**: Quick challenges

---

## 🎮 4. CONTROLLERS - Business Logic

### 4.1 authController.js

#### Functions:
```javascript
1. register()           // User registration
2. login()               // User login (JWT tokens)
3. logout()              // Logout (clear refresh token)
4. getMe()               // Get current user
5. refreshToken()        // Refresh access token
6. connectGoogleFit()    // Get Google Fit OAuth URL
7. googleFitCallback()   // Handle OAuth callback
8. getGoogleFitStatus()  // Check connection status
9. disconnectGoogleFit() // Disconnect Google Fit
```

#### Login Flow:
```javascript
1. Validate email/password
2. Compare password (bcrypt)
3. Generate access token (15 min)
4. Generate refresh token (7 days)
5. Save refresh token in httpOnly cookie
6. Return access token in response
```

### 4.2 activityController.js

#### Functions:
```javascript
1. logActivity()              // Log activity with photos
2. getMyActivities()           // Get user's activities
3. getAllActivities()          // Get all (admin)
4. getActivity()               // Get single activity
5. updateActivity()             // Update activity
6. deleteActivity()            // Delete activity
7. getUnverifiedActivities()   // Get unverified (admin)
8. verifyActivity()            // Verify activity (admin)
9. rejectActivity()            // Reject activity (admin)
```

#### logActivity Flow:
```javascript
1. Parse FormData (photos, values)
2. Check Google Fit auto-fetch (if steps)
3. Validate challenge requirements (photos, time gaps)
4. Calculate points
5. Create activity
6. Update user points & streak
7. Update challenge progress
8. Check daily completion (bonus points)
9. Return response
```

#### Photo Handling:
```javascript
Priority:
1. Multer uploaded files (req.files)
2. Base64/URL strings (req.body.photo)
3. Save to uploads/photos/
4. Store URLs in database
```

### 4.3 challengeController.js

#### Functions:
```javascript
1. getChallenges()        // Get challenges (categorized)
2. getChallenge()         // Get single challenge
3. createChallenge()      // Create challenge (admin)
4. updateChallenge()      // Update challenge (admin)
5. deleteChallenge()      // Delete challenge (admin)
6. joinChallenge()        // Join challenge
7. leaveChallenge()       // Leave challenge
8. getMyProgress()        // Get user's progress
9. getTodayProgress()     // Get today's progress
```

#### Challenge Categorization:
```javascript
- Today: Active today
- Upcoming: Future challenges
- Expired: Past challenges (with penalty)
- Completed: User completed
```

### 4.4 adminController.js

#### Functions:
```javascript
1. getAnalytics()                    // Dashboard stats
2. getAllUsers()                     // User list
3. getUserChallenges()               // User's challenges
4. getUserActivities()               // User's activities
5. getDepartmentAnalytics()         // Department stats
6. assignChallengeToDepartment()     // Bulk assignment
7. assignChallengeToUsers()          // Specific users
8. generateReport()                  // Generate reports
9. exportCSV()                       // Export CSV
10. exportPDF()                      // Export PDF
```

### 4.5 Other Controllers:
- **userController**: Profile, leaderboard, badges
- **rewardController**: Rewards, redemption
- **bookingController**: Session booking
- **resourceController**: Mental health resources
- **battleController**: 1v1 battles
- **wellnessPostController**: Social posts
- **lootBoxController**: Loot boxes
- **quickSnapController**: Quick snaps

---

## 🛣️ 5. ROUTES - API Endpoints

### 5.1 Auth Routes (`/api/auth`)

```javascript
POST   /register              // Register user
POST   /login                 // Login
POST   /logout                // Logout
GET    /me                    // Get current user
POST   /refresh               // Refresh token
GET    /google-fit/connect    // Get OAuth URL
GET    /google-fit/callback   // OAuth callback
GET    /google-fit/status     // Check status
POST   /google-fit/disconnect // Disconnect
```

### 5.2 Activity Routes (`/api/activities`)

```javascript
POST   /                      // Log activity (with photos)
GET    /                      // Get my activities
GET    /all                   // Get all (admin)
GET    /unverified            // Get unverified (admin)
GET    /:id                   // Get single activity
PUT    /:id                   // Update activity
DELETE /:id                   // Delete activity
POST   /:id/verify            // Verify activity (admin)
POST   /:id/reject            // Reject activity (admin)
```

### 5.3 Challenge Routes (`/api/challenges`)

```javascript
GET    /                      // Get challenges
GET    /:id                   // Get challenge
POST   /                      // Create challenge (admin)
PUT    /:id                   // Update challenge (admin)
DELETE /:id                   // Delete challenge (admin)
POST   /:id/join             // Join challenge
DELETE /:id/leave            // Leave challenge
GET    /:id/my-progress      // Get my progress
GET    /:id/today-progress   // Get today's progress
GET    /:id/leaderboard      // Get leaderboard
```

### 5.4 Admin Routes (`/api/admin`)

```javascript
GET    /analytics             // Dashboard analytics
GET    /users                 // Get all users
GET    /user-challenges       // User's challenges
GET    /user-activities       // User's activities
GET    /department-analytics  // Department stats
POST   /challenges/:id/assign-department  // Bulk assign
POST   /challenges/:id/assign-users      // Specific assign
GET    /reports               // Generate reports
GET    /export/csv            // Export CSV
GET    /export/pdf            // Export PDF
```

### 5.5 Other Routes:
- **User Routes**: Profile, leaderboard, badges
- **Reward Routes**: Rewards, claim
- **Booking Routes**: Book, cancel sessions
- **Resource Routes**: Resources, access tracking
- **Battle Routes**: Create, respond battles
- **Wellness Post Routes**: Create, like, comment posts
- **Loot Box Routes**: Open loot boxes
- **Quick Snap Routes**: Start, complete snaps

---

## 🔧 6. UTILITIES

### 6.1 generateToken.js

```javascript
generateToken(id)           // Access token (15 min)
generateRefreshToken(id)    // Refresh token (7 days)
```

### 6.2 googleFit.js

```javascript
fetchStepsFromGoogleFit(accessToken, date)  // Fetch steps
refreshGoogleFitToken(refreshToken)         // Refresh token
```

### 6.3 validation.js

```javascript
// Validation helpers
```

---

## 🔄 7. REQUEST FLOW

### Example: Log Activity with Photo

```
1. Frontend: POST /api/activities
   ↓
2. Middleware: upload.array('photos', 10)
   - Files saved to uploads/photos/
   - req.files populated
   ↓
3. Middleware: protect
   - Verify JWT token
   - Attach user to req.user
   ↓
4. Controller: activityController.logActivity()
   - Parse FormData
   - Check Google Fit (if steps)
   - Validate challenge requirements
   - Calculate points
   - Create activity
   - Update user points
   - Update challenge progress
   ↓
5. Response: { success: true, data: activity }
```

---

## 🔒 8. SECURITY FEATURES

### 8.1 Authentication:
- JWT tokens (access + refresh)
- httpOnly cookies (refresh token)
- Password hashing (bcrypt, 10 rounds)

### 8.2 Authorization:
- Role-based access (admin, hr, employee)
- Resource ownership checks

### 8.3 Protection:
- Helmet (security headers)
- CORS (cross-origin)
- Rate limiting (DDoS protection)
- Input validation

### 8.4 File Upload:
- File type validation
- Size limits (10MB)
- Secure storage

---

## 📈 9. KEY FEATURES

### 9.1 Points System:
- Activity points (formula-based)
- Daily completion bonus
- Challenge participation points
- Badge rewards

### 9.2 Health Tracking:
- Monthly points tracking
- Weekly yoga tracking
- Health score calculation
- Counseling recommendations

### 9.3 Challenge System:
- Daily challenges (24 hours)
- Progress tracking
- Photo verification
- Time gap validation (hydration)

### 9.4 Admin Features:
- Activity verification
- User management
- Analytics & reports
- Challenge management

---

## 🗄️ 10. DATABASE RELATIONSHIPS

### 10.1 User Relationships:
```javascript
User → Activities (one-to-many)
User → Challenges (many-to-many via participants)
User → Badges (many-to-many)
User → Rewards (many-to-many via redemptions)
```

### 10.2 Challenge Relationships:
```javascript
Challenge → Participants (many-to-many)
Challenge → Activities (one-to-many)
Challenge → CreatedBy (User reference)
```

### 10.3 Activity Relationships:
```javascript
Activity → User (many-to-one)
Activity → Challenge (many-to-one, optional)
Activity → VerifiedBy (User reference, optional)
```

---

## 🎯 11. API RESPONSE FORMAT

### Success Response:
```javascript
{
  success: true,
  data: { ... },
  message: "Optional message"
}
```

### Error Response:
```javascript
{
  success: false,
  message: "Error message",
  ...(development && { stack: "..." })
}
```

---

## 📝 12. ENVIRONMENT VARIABLES

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=... (optional)
GOOGLE_CLIENT_SECRET=... (optional)
GOOGLE_REDIRECT_URI=... (optional)
```

---

## 🧪 13. TESTING ENDPOINTS

### Health Check:
```bash
GET /api/health
```

### Login:
```bash
POST /api/auth/login
Body: { email, password }
```

### Log Activity:
```bash
POST /api/activities
Headers: { Authorization: "Bearer <token>" }
Body: FormData { type, value, unit, photos[] }
```

---

## 🎓 14. KEY CONCEPTS

### 14.1 MVC Pattern:
- **Models**: Database schemas
- **Views**: Not applicable (API only)
- **Controllers**: Business logic

### 14.2 Middleware Chain:
```
Request → Middleware 1 → Middleware 2 → Controller → Response
```

### 14.3 Async/Await:
- All database operations are async
- asyncHandler wraps async functions
- Errors automatically caught

### 14.4 Mongoose Features:
- Pre-save hooks (password hashing)
- Static methods (calculatePoints)
- Instance methods (addPoints)
- Virtuals (computed fields)
- Indexes (performance)

---

## ✅ 15. COMPLETE BACKEND SUMMARY

### Total Files:
- **Models**: 12
- **Controllers**: 12
- **Routes**: 12
- **Middleware**: 4
- **Utils**: 3

### Total Endpoints: ~80+

### Key Features:
✅ Authentication & Authorization
✅ Activity Logging with Photos
✅ Challenge System
✅ Points & Rewards
✅ Admin Verification
✅ Google Fit Integration
✅ File Upload (Multer)
✅ Analytics & Reports
✅ Social Features (Battles, Posts)
✅ Gamification (Loot Boxes, Badges)

---

## 🚀 Ready for Production!

Backend is complete and production-ready with:
- Security best practices
- Error handling
- Rate limiting
- File upload
- Admin verification
- Analytics
- Social features

**All systems operational!** 🎉

