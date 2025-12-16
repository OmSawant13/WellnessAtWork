import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { userService } from '../api/services'
import toast from 'react-hot-toast'
import { FiUser, FiAward, FiTrendingUp, FiZap } from 'react-icons/fi'

const Profile = () => {
  const { user, setUser } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    employeeId: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const [profileRes, badgesRes] = await Promise.all([
        userService.getProfile(),
        userService.getBadges()
      ])
      setProfile(profileRes.data.data)
      setBadges(badgesRes.data.data)
      setFormData({
        name: profileRes.data.data.name,
        department: profileRes.data.data.department || '',
        employeeId: profileRes.data.data.employeeId || ''
      })
      setUser(profileRes.data.data)
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await userService.updateProfile(formData)
      setProfile(response.data.data)
      setUser(response.data.data)
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>

  const wellnessProfile = profile?.wellnessProfile || {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <button
                onClick={() => editing ? handleUpdate(document.querySelector('form')) : setEditing(true)}
                className="btn-secondary"
              >
                {editing ? 'Save' : 'Edit'}
              </button>
            </div>
            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile?.email}
                    className="input-field bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="input-field"
                  />
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{profile?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{profile?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium">{profile?.department || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-medium">{profile?.employeeId || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-medium capitalize">{profile?.role}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiTrendingUp className="mr-2" /> Wellness Stats
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-3xl font-bold text-primary-600">{wellnessProfile.totalPoints || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-2xl font-bold text-gray-900">Level {wellnessProfile.level || 1}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center">
                  <FiZap className="mr-1" /> Current Streak
                </p>
                <p className="text-2xl font-bold text-orange-600">{wellnessProfile.currentStreak || 0} days</p>
                <p className="text-xs text-gray-500">Longest: {wellnessProfile.longestStreak || 0} days</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiAward className="mr-2" /> Badges
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {badges.length > 0 ? (
                badges.map((badge) => (
                  <div key={badge._id} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-3xl mb-1">{badge.icon}</div>
                    <p className="text-xs font-medium">{badge.name}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 col-span-2">No badges yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

