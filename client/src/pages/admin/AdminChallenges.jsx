import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { challengeService, adminService } from '../../api/services'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit, FiTrash2, FiUsers } from 'react-icons/fi'

const AdminChallenges = () => {
  const [challenges, setChallenges] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [assigningDept, setAssigningDept] = useState(null)
  const [canCreateToday, setCanCreateToday] = useState(true)
  const [todayChallenge, setTodayChallenge] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'steps',
    startDate: '',
    endDate: '',
    rules: {
      targetValue: '',
      unit: 'steps',
      pointMultiplier: 1,
      requiresPhoto: false,
      minPhotos: 1,
      maxPhotos: 5,
      timeGap: null
    },
    isTeamChallenge: false,
    maxParticipants: ''
  })

  useEffect(() => {
    loadChallenges()
    loadDepartments()
  }, [])

  const loadDepartments = async () => {
    try {
      const response = await adminService.getDepartmentAnalytics()
      setDepartments(response.data.data.map(d => d.department))
    } catch (error) {
      console.error('Failed to load departments')
    }
  }

  const loadChallenges = async () => {
    try {
      setLoading(true)
      const response = await challengeService.getChallenges()
      // Handle new categorized response format
      const data = response.data.data
      if (Array.isArray(data)) {
        // Old format - array
        setChallenges(data)
      } else {
        // New format - categorized object
        const allChallenges = [
          ...(data.today || []),
          ...(data.upcoming || []),
          ...(data.expired || []),
          ...(data.completed || [])
        ]
        setChallenges(allChallenges)
        
        // Check if admin created a challenge today
        const today = new Date().toDateString()
        const todayChallenge = allChallenges.find(c => {
          const createdDate = new Date(c.createdAt || c.startDate).toDateString()
          return createdDate === today && c.createdBy
        })
        
        if (todayChallenge) {
          setCanCreateToday(false)
          setTodayChallenge(todayChallenge)
        } else {
          setCanCreateToday(true)
          setTodayChallenge(null)
        }
      }
    } catch (error) {
      toast.error('Failed to load challenges')
      setChallenges([]) // Ensure it's always an array
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Set start date to today if not set
      const startDate = formData.startDate || new Date().toISOString().split('T')[0]
      const challengeData = {
        ...formData,
        startDate,
        // End date should be 24 hours from start (for daily challenge)
        endDate: formData.endDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isDailyChallenge: true
      }
      
      await challengeService.createChallenge(challengeData)
      toast.success('Challenge created successfully! It will be active for 24 hours.')
      setShowForm(false)
      setFormData({
        name: '',
        description: '',
        type: 'steps',
        startDate: '',
        endDate: '',
        rules: {
          targetValue: '',
          unit: 'steps',
          pointMultiplier: 1
        },
        isTeamChallenge: false,
        maxParticipants: ''
      })
      loadChallenges()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create challenge')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      try {
        await challengeService.deleteChallenge(id)
        toast.success('Challenge deleted successfully')
        loadChallenges()
      } catch (error) {
        toast.error('Failed to delete challenge')
      }
    }
  }

  const handleAssignToDepartment = async (challengeId, department) => {
    try {
      const response = await adminService.assignChallengeToDepartment(challengeId, department)
      toast.success(response.data.message || `Challenge assigned to ${department}`)
      loadChallenges()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign challenge')
    }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Challenges</h1>
        <div className="flex items-center gap-4">
          {!canCreateToday && todayChallenge && (
            <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ You've created 1 challenge today. Next challenge available tomorrow.
              </p>
            </div>
          )}
          <button 
            onClick={() => setShowForm(!showForm)} 
            disabled={!canCreateToday}
            className={`btn-primary flex items-center ${!canCreateToday ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
          <FiPlus className="mr-2" />
          Create Challenge
        </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Challenge</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="steps">Steps</option>
                  <option value="meditation">Meditation</option>
                  <option value="workout">Workout</option>
                  <option value="hydration">Hydration</option>
                  <option value="sleep">Sleep</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Challenge will be active for 24 hours from start date</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for 24-hour daily challenge</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
                <input
                  type="number"
                  value={formData.rules.targetValue}
                  onChange={(e) => setFormData({
                    ...formData,
                    rules: { ...formData.rules, targetValue: e.target.value }
                  })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input
                  type="text"
                  value={formData.rules.unit}
                  onChange={(e) => setFormData({
                    ...formData,
                    rules: { ...formData.rules, unit: e.target.value }
                  })}
                  className="input-field"
                  required
                />
              </div>
              <div className="space-y-3">
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requiresPhoto"
                    checked={formData.rules.requiresPhoto}
                    onChange={(e) => setFormData({
                      ...formData,
                      rules: { 
                        ...formData.rules, 
                        requiresPhoto: e.target.checked,
                        minPhotos: e.target.checked ? formData.rules.minPhotos || 1 : 0,
                        maxPhotos: e.target.checked ? formData.rules.maxPhotos || 1 : null
                      }
                    })}
                    className="mr-2"
                  />
                  <label htmlFor="requiresPhoto" className="text-sm font-medium text-gray-700">
                    Require Photo Proof (Optional - users must upload photo to complete)
                  </label>
                </div>
                {formData.rules.requiresPhoto && (
                  <div className="ml-6 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Photos
                      </label>
                      <input
                        type="number"
                        value={formData.rules.minPhotos || 1}
                        onChange={(e) => setFormData({
                          ...formData,
                          rules: { ...formData.rules, minPhotos: Number(e.target.value) || 1 }
                        })}
                        className="input-field"
                        min="1"
                        max="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Photos (Leave empty for unlimited)
                      </label>
                      <input
                        type="number"
                        value={formData.rules.maxPhotos || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          rules: { 
                            ...formData.rules, 
                            maxPhotos: e.target.value ? Number(e.target.value) : null 
                          }
                        })}
                        className="input-field"
                        min="1"
                        max="20"
                        placeholder="Unlimited"
                      />
                    </div>
                  </div>
                )}
              </div>
                {formData.rules.requiresPhoto && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Photos
                      </label>
                      <input
                        type="number"
                        value={formData.rules.minPhotos || 1}
                        onChange={(e) => setFormData({
                          ...formData,
                          rules: { ...formData.rules, minPhotos: Number(e.target.value) || 1 }
                        })}
                        className="input-field"
                        min="1"
                        max="10"
                      />
                      <p className="text-xs text-gray-500 mt-1">e.g., 2 for before/after</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Photos
                      </label>
                      <input
                        type="number"
                        value={formData.rules.maxPhotos || 5}
                        onChange={(e) => setFormData({
                          ...formData,
                          rules: { ...formData.rules, maxPhotos: Number(e.target.value) || 5 }
                        })}
                        className="input-field"
                        min="1"
                        max="10"
                      />
                      <p className="text-xs text-gray-500 mt-1">Max photos user can upload</p>
                    </div>
                  </div>
                )}
              </div>
              {formData.type === 'hydration' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Gap Between Glasses (hours) - Optional
                  </label>
                  <input
                    type="number"
                    value={formData.rules.timeGap || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      rules: { ...formData.rules, timeGap: e.target.value ? Number(e.target.value) : null }
                    })}
                    className="input-field"
                    placeholder="e.g., 2 for 2 hours between glasses"
                    min="1"
                    max="24"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Users must wait this many hours between each glass (e.g., 2 hours for 8 glasses challenge)
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="3"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Create Challenge</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {challenges.map((challenge) => (
          <div key={challenge._id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{challenge.name}</h3>
                <p className="text-gray-600 mb-2">{challenge.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="capitalize">{challenge.type}</span>
                  <span>•</span>
                  <span>{challenge.participants?.length || 0} participants</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full ${
                    challenge.status === 'active' ? 'bg-green-100 text-green-800' :
                    challenge.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {challenge.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Link
                  to={`/challenges/${challenge._id}`}
                  className="btn-secondary"
                    title="View Details"
                >
                  <FiEdit />
                </Link>
                <button
                  onClick={() => handleDelete(challenge._id)}
                  className="btn-secondary text-red-600 hover:text-red-700"
                    title="Delete Challenge"
                >
                  <FiTrash2 />
                </button>
                </div>
                {departments.length > 0 && (
                  <div className="mt-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignToDepartment(challenge._id, e.target.value)
                          e.target.value = ''
                        }
                      }}
                      className="text-xs input-field"
                      defaultValue=""
                    >
                      <option value="">Assign to Department...</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminChallenges

