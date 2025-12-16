import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Challenges from './pages/Challenges'
import ChallengeDetails from './pages/ChallengeDetails'
import Activities from './pages/Activities'
import Resources from './pages/Resources'
import Bookings from './pages/Bookings'
import Rewards from './pages/Rewards'
import Shop from './pages/Shop'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminChallenges from './pages/admin/AdminChallenges'
import AdminResources from './pages/admin/AdminResources'
import AdminReports from './pages/admin/AdminReports'
import AdminUsers from './pages/admin/AdminUsers'
import AdminDepartments from './pages/admin/AdminDepartments'
import AdminVerification from './pages/admin/AdminVerification'

// Components
import Navbar from './components/layout/Navbar'
import PrivateRoute from './components/auth/PrivateRoute'
import AdminRoute from './components/auth/AdminRoute'

function App() {
  const { user } = useAuthStore()

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar />}
        <Routes>
          <Route path="/login" element={
            !user ? <Login /> : <Navigate to={user?.role === 'admin' || user?.role === 'hr' ? "/admin" : "/dashboard"} replace />
          } />
          <Route path="/register" element={
            !user ? <Register /> : <Navigate to={user?.role === 'admin' || user?.role === 'hr' ? "/admin" : "/dashboard"} replace />
          } />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/challenges" element={<PrivateRoute><Challenges /></PrivateRoute>} />
          <Route path="/challenges/:id" element={<PrivateRoute><ChallengeDetails /></PrivateRoute>} />
          <Route path="/activities" element={<PrivateRoute><Activities /></PrivateRoute>} />
          <Route path="/resources" element={<PrivateRoute><Resources /></PrivateRoute>} />
          <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
          <Route path="/rewards" element={<PrivateRoute><Rewards /></PrivateRoute>} />
          <Route path="/shop" element={<PrivateRoute><Shop /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/challenges" element={<AdminRoute><AdminChallenges /></AdminRoute>} />
          <Route path="/admin/resources" element={<AdminRoute><AdminResources /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/departments" element={<AdminRoute><AdminDepartments /></AdminRoute>} />
          <Route path="/admin/verification" element={<AdminRoute><AdminVerification /></AdminRoute>} />
          
          <Route path="/" element={<Navigate to={user ? (user.role === 'admin' || user.role === 'hr' ? "/admin" : "/dashboard") : "/login"} />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App

