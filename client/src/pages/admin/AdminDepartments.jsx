import { useEffect, useState } from 'react'
import { adminService } from '../../api/services'
import toast from 'react-hot-toast'
import { FiTrendingUp, FiUsers, FiActivity, FiAward } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const AdminDepartments = () => {
  const [departmentStats, setDepartmentStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDepartmentAnalytics()
  }, [])

  const loadDepartmentAnalytics = async () => {
    try {
      setLoading(true)
      const response = await adminService.getDepartmentAnalytics()
      setDepartmentStats(response.data.data)
    } catch (error) {
      toast.error('Failed to load department analytics')
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Department Analytics</h1>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {departmentStats.map((dept, index) => (
          <div key={dept.department} className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{dept.department}</h3>
              {index === 0 && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  🏆 Top Performer
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <FiUsers className="mr-2" />
                  <span className="text-sm">Employees</span>
                </div>
                <span className="font-semibold">{dept.totalUsers}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <FiActivity className="mr-2" />
                  <span className="text-sm">Active</span>
                </div>
                <span className="font-semibold text-green-600">{dept.activeUsers} / {dept.totalUsers}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <FiAward className="mr-2" />
                  <span className="text-sm">Total Points</span>
                </div>
                <span className="font-semibold text-primary-600">{dept.totalPoints.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <FiTrendingUp className="mr-2" />
                  <span className="text-sm">Avg Points/User</span>
                </div>
                <span className="font-semibold">{dept.avgPoints}</span>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Avg Streak</span>
                  <span className="font-semibold">{dept.avgStreak} days</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${Math.min((dept.avgStreak / 30) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Total Points by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalPoints" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Active Users by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ department, activeUsers }) => `${department}: ${activeUsers}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="activeUsers"
              >
                {departmentStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Comparison Table */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold mb-4">Department Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Department</th>
                <th className="text-left py-3">Total Users</th>
                <th className="text-left py-3">Active Users</th>
                <th className="text-left py-3">Total Points</th>
                <th className="text-left py-3">Avg Points/User</th>
                <th className="text-left py-3">Avg Streak</th>
                <th className="text-left py-3">Total Activities</th>
              </tr>
            </thead>
            <tbody>
              {departmentStats.map((dept) => (
                <tr key={dept.department} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">{dept.department}</td>
                  <td className="py-3">{dept.totalUsers}</td>
                  <td className="py-3">
                    <span className="text-green-600 font-semibold">{dept.activeUsers}</span>
                    <span className="text-gray-500 text-sm ml-1">
                      ({((dept.activeUsers / dept.totalUsers) * 100).toFixed(0)}%)
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-primary-600">{dept.totalPoints.toLocaleString()}</td>
                  <td className="py-3">{dept.avgPoints}</td>
                  <td className="py-3">{dept.avgStreak} days</td>
                  <td className="py-3">{dept.totalActivities}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDepartments

