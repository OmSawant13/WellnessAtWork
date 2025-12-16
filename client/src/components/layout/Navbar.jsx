import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { FiHome, FiTarget, FiBook, FiCalendar, FiGift, FiUser, FiTrendingUp, FiSettings, FiLogOut, FiCheckCircle } from 'react-icons/fi'

const Navbar = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'hr'

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to={isAdmin ? "/admin" : "/dashboard"} className="text-2xl font-bold text-primary-600">
                WellnessAtWork
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {!isAdmin && (
                <>
              <Link to="/dashboard" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600">
                <FiHome className="mr-2" /> Dashboard
              </Link>
              <Link to="/challenges" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600">
                <FiTarget className="mr-2" /> Challenges
              </Link>
              <Link to="/resources" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600">
                <FiBook className="mr-2" /> Resources
              </Link>
              <Link to="/bookings" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600">
                <FiCalendar className="mr-2" /> Bookings
              </Link>
              <Link to="/shop" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600">
                <FiGift className="mr-2" /> Shop
              </Link>
              <Link to="/leaderboard" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600">
                <FiTrendingUp className="mr-2" /> Leaderboard
              </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link to="/admin" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-primary-600 border-b-2 border-primary-600">
                    <FiSettings className="mr-2" /> Dashboard
                  </Link>
                  <Link to="/admin/users" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600">
                    <FiUser className="mr-2" /> Employees
                  </Link>
                  <Link to="/admin/challenges" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600">
                    <FiTarget className="mr-2" /> Challenges
                  </Link>
                  <Link to="/admin/departments" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600">
                    <FiTrendingUp className="mr-2" /> Departments
                  </Link>
                  <Link to="/admin/resources" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600">
                    <FiBook className="mr-2" /> Resources
                  </Link>
                  <Link to="/admin/verification" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600">
                    <FiCheckCircle className="mr-2" /> Verification
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/profile" className="flex items-center text-sm text-gray-700 hover:text-primary-600">
              <FiUser className="mr-2" />
              {user?.name}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center text-sm text-gray-700 hover:text-red-600"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

