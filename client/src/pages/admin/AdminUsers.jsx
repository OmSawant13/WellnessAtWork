import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminService, userService } from '../../api/services'
import toast from 'react-hot-toast'
import { FiUser, FiActivity, FiTarget, FiTrendingUp, FiSearch, FiFilter } from 'react-icons/fi'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [userActivities, setUserActivities] = useState([])
  const [userChallenges, setUserChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')

  useEffect(() => {
    loadUsers()
  }, [departmentFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      // We'll need to create this endpoint
      const response = await adminService.getUsers({ department: departmentFilter })
      setUsers(response.data.data)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const loadUserDetails = async (userId) => {
    try {
      const [activitiesRes, challengesRes] = await Promise.all([
        adminService.getUserActivities({ userId }),
        adminService.getUserChallenges({ userId })
      ])
      setUserActivities(activitiesRes.data.data)
      setUserChallenges(challengesRes.data.data)
    } catch (error) {
      toast.error('Failed to load user details')
    }
  }

  const handleUserClick = (user) => {
    setSelectedUser(user)
    loadUserDetails(user._id)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = !departmentFilter || user.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const departments = [...new Set(users.map(u => u.department).filter(Boolean))]

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="input-field pl-10"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Employees ({filteredUsers.length})</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user)}
                  className={`p-4 border rounded-lg cursor-pointer transition ${
                    selectedUser?._id === user._id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                        <FiUser className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.department || 'No Department'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary-600">
                        {user.wellnessProfile?.totalPoints || 0} pts
                      </p>
                      <p className="text-xs text-gray-500">Level {user.wellnessProfile?.level || 1}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Details */}
        {selectedUser ? (
          <div className="lg:col-span-2 space-y-6">
            {/* User Profile Card */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                    <FiUser className="text-2xl text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <p className="text-sm text-gray-500">
                      {selectedUser.department || 'No Department'} • {selectedUser.employeeId || 'No ID'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary-600">
                    {selectedUser.wellnessProfile?.totalPoints || 0}
                  </p>
                  <p className="text-sm text-gray-500">Total Points</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {selectedUser.wellnessProfile?.currentStreak || 0}
                  </p>
                  <p className="text-sm text-gray-600">Current Streak</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedUser.wellnessProfile?.longestStreak || 0}
                  </p>
                  <p className="text-sm text-gray-600">Longest Streak</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    Level {selectedUser.wellnessProfile?.level || 1}
                  </p>
                  <p className="text-sm text-gray-600">Wellness Level</p>
                </div>
              </div>
            </div>

            {/* User Activities */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <FiActivity className="mr-2" /> Recent Activities
                </h3>
                <Link
                  to={`/admin/user-activities?userId=${selectedUser._id}`}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {userActivities.length > 0 ? (
                  userActivities.slice(0, 5).map((activity) => (
                    <div key={activity._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{activity.title || activity.type}</p>
                        <p className="text-sm text-gray-500">
                          {activity.value} {activity.unit} • {new Date(activity.activityDate).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-semibold text-primary-600">+{activity.points} pts</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No activities yet</p>
                )}
              </div>
            </div>

            {/* User Challenges */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <FiTarget className="mr-2" /> Active Challenges
                </h3>
              </div>
              <div className="space-y-3">
                {userChallenges.length > 0 ? (
                  userChallenges.map((challenge) => (
                    <div key={challenge._id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{challenge.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                            <span>Progress: {challenge.participant?.progress || 0} / {challenge.rules?.targetValue || 0}</span>
                            <span>•</span>
                            <span>{challenge.participant?.points || 0} points</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          challenge.status === 'active' ? 'bg-green-100 text-green-800' :
                          challenge.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {challenge.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No active challenges</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 card flex items-center justify-center h-full">
            <div className="text-center">
              <FiUser className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500">Select an employee to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers

