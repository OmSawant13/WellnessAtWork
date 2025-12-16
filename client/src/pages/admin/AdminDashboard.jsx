import { useEffect, useState } from 'react'
import { adminService } from '../../api/services'
import toast from 'react-hot-toast'
import { FiUsers, FiActivity, FiTarget, FiCalendar, FiTrendingUp } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await adminService.getAnalytics()
      setAnalytics(response.data.data)
    } catch (error) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-primary-600">{analytics?.users?.total || 0}</p>
            </div>
            <FiUsers className="text-4xl text-primary-300" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {analytics?.users?.active || 0} active ({analytics?.users?.activePercentage || 0}%)
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Activities</p>
              <p className="text-3xl font-bold text-green-600">{analytics?.activities?.total || 0}</p>
            </div>
            <FiActivity className="text-4xl text-green-300" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {analytics?.activities?.totalPoints || 0} total points
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Challenges</p>
              <p className="text-3xl font-bold text-purple-600">{analytics?.challenges?.active || 0}</p>
            </div>
            <FiTarget className="text-4xl text-purple-300" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {analytics?.challenges?.total || 0} total challenges
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-orange-600">{analytics?.bookings?.total || 0}</p>
            </div>
            <FiCalendar className="text-4xl text-orange-300" />
          </div>
        </div>
      </div>

      {analytics?.activities?.byType && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Activities by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.activities.byType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {analytics?.topPerformers && analytics.topPerformers.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiTrendingUp className="mr-2" /> Top Performers
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Rank</th>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Department</th>
                  <th className="text-left py-2">Points</th>
                  <th className="text-left py-2">Streak</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topPerformers.map((user, index) => (
                  <tr key={user._id} className="border-b">
                    <td className="py-2">#{index + 1}</td>
                    <td className="py-2 font-medium">{user.name}</td>
                    <td className="py-2 text-gray-600">{user.department || 'N/A'}</td>
                    <td className="py-2 font-semibold text-primary-600">
                      {user.wellnessProfile?.totalPoints || 0}
                    </td>
                    <td className="py-2">{user.wellnessProfile?.currentStreak || 0} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

