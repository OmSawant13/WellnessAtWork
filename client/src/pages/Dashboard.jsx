import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { userService, challengeService, activityService } from '../api/services'
import { FiTarget, FiActivity, FiTrendingUp, FiAward, FiZap } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import ConnectHealthApp from '../components/ConnectHealthApp'

const Dashboard = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [challenges, setChallenges] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      if (isMounted) {
        await loadDashboardData()
      }
    }
    
    loadData()
    
    return () => {
      isMounted = false
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRes, challengesRes, activitiesRes, summaryRes] = await Promise.all([
        userService.getStats(),
        challengeService.getChallenges(),
        activityService.getMyActivities({ limit: 5 }),
        userService.getActivitySummary()
      ])

      setStats(statsRes.data.data)
      // Handle new challenge response format (categorized)
      const challengeData = challengesRes.data.data
      const allChallenges = [
        ...(challengeData.today || []),
        ...(challengeData.upcoming || []),
        ...(challengeData.completed || [])
      ]
      setChallenges(allChallenges.slice(0, 5)) // Show first 5
      setRecentActivities(activitiesRes.data.data)

      // Prepare chart data
      const summary = summaryRes.data.data
      const chartDataArray = Object.entries(summary.byDate || {})
        .map(([date, data]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          points: data.points,
          activities: data.count
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-7)

      setChartData(chartDataArray)
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and refresh the page.')
      } else {
      toast.error('Failed to load dashboard data')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  const wellnessProfile = user?.wellnessProfile || stats?.wellnessProfile || {}
  const monthlyProgress = stats?.monthlyProgress
  const weeklyYoga = stats?.weeklyYoga
  const yogaWarning = stats?.yogaWarning
  const healthStatus = stats?.healthStatus || 'good'

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'needs-attention': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="mt-2 text-gray-600">Here's your wellness overview</p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${getHealthStatusColor(healthStatus)}`}>
            <p className="text-sm font-medium">Health Status: {healthStatus.replace('-', ' ').toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Yoga Warning */}
      {yogaWarning && (
        <div className="mb-6 card bg-yellow-50 border-l-4 border-yellow-400">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-yellow-800">{yogaWarning.message}</p>
              <p className="text-xs text-yellow-600 mt-1">
                Complete {yogaWarning.sessionsNeeded} yoga session(s) in the next {yogaWarning.daysRemaining} days to earn {yogaWarning.points} points!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Progress Warning */}
      {monthlyProgress && monthlyProgress.counselingRequired && (
        <div className="mb-6 card bg-red-50 border-l-4 border-red-400">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">📞</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-red-800">
                Monthly Target Not Met - Counseling Required
              </p>
              <p className="text-xs text-red-600 mt-1">
                You have {monthlyProgress.remaining} points remaining to reach your monthly target of {monthlyProgress.targetPoints} points.
                Please schedule a wellness counseling session.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Progress */}
      {monthlyProgress && (
        <div className="mb-6 card">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Monthly Progress</h3>
            <span className="text-sm text-gray-600">
              {monthlyProgress.points} / {monthlyProgress.targetPoints} points
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${
                monthlyProgress.points >= monthlyProgress.targetPoints
                  ? 'bg-green-500'
                  : monthlyProgress.points >= monthlyProgress.targetPoints * 0.7
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{
                width: `${Math.min((monthlyProgress.points / monthlyProgress.targetPoints) * 100, 100)}%`
              }}
            />
          </div>
          {monthlyProgress.remaining > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {monthlyProgress.remaining} points needed to reach monthly target
            </p>
          )}
        </div>
      )}

      {/* Google Fit Connection */}
      <div className="mb-6">
        <ConnectHealthApp />
      </div>

      {/* Weekly Yoga Progress */}
      {weeklyYoga && (
        <div className="mb-6 card">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Weekly Yoga Sessions</h3>
            <span className="text-sm text-gray-600">
              {weeklyYoga.sessions} / {weeklyYoga.targetSessions} sessions
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${
                weeklyYoga.sessions >= weeklyYoga.targetSessions
                  ? 'bg-green-500'
                  : weeklyYoga.sessions >= weeklyYoga.targetSessions * 0.5
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{
                width: `${Math.min((weeklyYoga.sessions / weeklyYoga.targetSessions) * 100, 100)}%`
              }}
            />
          </div>
          {weeklyYoga.remaining > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {weeklyYoga.remaining} session(s) remaining this week (300 points each)
            </p>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Points</p>
              <p className="text-3xl font-bold text-primary-600">{wellnessProfile.totalPoints || 0}</p>
            </div>
            <FiTrendingUp className="text-4xl text-primary-300" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Level {wellnessProfile.level || 1}</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Streak</p>
              <p className="text-3xl font-bold text-orange-600">{wellnessProfile.currentStreak || 0} days</p>
            </div>
            <FiZap className="text-4xl text-orange-300" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Longest: {wellnessProfile.longestStreak || 0} days</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Challenges</p>
              <p className="text-3xl font-bold text-green-600">{stats?.activeChallenges || 0}</p>
            </div>
            <FiTarget className="text-4xl text-green-300" />
          </div>
          <p className="text-xs text-gray-500 mt-2">{challenges.length} available</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Activities</p>
              <p className="text-3xl font-bold text-purple-600">{stats?.totalActivities || 0}</p>
            </div>
            <FiActivity className="text-4xl text-purple-300" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Keep it up!</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Weekly Activity Points</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="points" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Weekly Activities</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="activities" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Active Challenges</h3>
            <Link to="/challenges" className="text-primary-600 hover:text-primary-700 text-sm">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {challenges.length > 0 ? (
              challenges.map((challenge) => (
                <Link
                  key={challenge._id}
                  to={`/challenges/${challenge._id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition"
                >
                  <h4 className="font-medium text-gray-900">{challenge.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <FiTarget className="mr-1" />
                    {challenge.participants?.length || 0} participants
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No active challenges</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Activities</h3>
            <Link to="/activities" className="text-primary-600 hover:text-primary-700 text-sm">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity._id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{activity.title || activity.type}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.value} {activity.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-600">+{activity.points} pts</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.activityDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No activities yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

