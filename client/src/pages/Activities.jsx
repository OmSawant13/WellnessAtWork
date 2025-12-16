import { useEffect, useState } from 'react'
import { activityService, challengeService, authService } from '../api/services'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { FiPlus, FiActivity, FiCamera, FiRefreshCw } from 'react-icons/fi'

const Activities = () => {
  const { user } = useAuthStore()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'steps',
    title: '',
    value: '',
    unit: 'steps',
    description: '',
    activityDate: new Date().toISOString().split('T')[0],
    challenge: null,
    photo: null
  })
  const [activeChallenges, setActiveChallenges] = useState([])
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [challengeRequiresPhoto, setChallengeRequiresPhoto] = useState(false)
  const [photoUrls, setPhotoUrls] = useState([]) // Array for multiple photos - start empty
  const [minPhotos, setMinPhotos] = useState(1)
  const [maxPhotos, setMaxPhotos] = useState(5)
  const [googleFitConnected, setGoogleFitConnected] = useState(false)
  const [fetchingSteps, setFetchingSteps] = useState(false)

  useEffect(() => {
    loadActivities()
    loadActiveChallenges()
    checkGoogleFitStatus()
  }, [])

  const checkGoogleFitStatus = async () => {
    try {
      const response = await authService.getGoogleFitStatus()
      setGoogleFitConnected(response.data.data.connected)
    } catch (error) {
      // Silent fail
    }
  }

  const handleFetchFromGoogleFit = async () => {
    if (!googleFitConnected) {
      toast.error('Please connect Google Fit first from Dashboard')
      return
    }

    try {
      setFetchingSteps(true)
      const activityData = {
        type: 'steps',
        unit: 'steps',
        autoFetch: true,
        challenge: selectedChallenge?._id || null,
        activityDate: formData.activityDate
      }

      const response = await activityService.logActivity(activityData)
      const steps = response.data.data.value

      toast.success(`✅ Fetched ${steps} steps from Google Fit!`, { duration: 5000 })
      
      // Update form with fetched value (for display)
      setFormData(prev => ({ ...prev, value: steps }))
      
      // Show challenge completion notification
      if (response.data.challengeUpdate?.dailyCompleted) {
        toast.success(
          `🎉 Challenge Complete! You've reached today's target!`,
          { duration: 5000 }
        )
      }

      setShowForm(false)
      loadActivities()
    } catch (error) {
      if (error.response?.data?.allowManual) {
        toast.error(error.response.data.message, { duration: 5000 })
        // Allow manual entry
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch steps from Google Fit')
      }
    } finally {
      setFetchingSteps(false)
    }
  }

  const loadActiveChallenges = async () => {
    try {
      const response = await challengeService.getChallenges()
      const challengeData = response.data.data
      const activeChallenges = [
        ...(challengeData.today || [])
      ]
      // Store for challenge selection
      setActiveChallenges(activeChallenges)
    } catch (error) {
      // Silent fail - not critical
    }
  }

  const loadActivities = async () => {
    try {
      setLoading(true)
      const response = await activityService.getMyActivities({ limit: 50 })
      setActivities(response.data.data)
    } catch (error) {
      toast.error('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Prepare activity data with photo if provided
      const activityData = {
        ...formData,
        photo: formData.photo?.urls && formData.photo.urls.length > 0 
          ? { urls: formData.photo.urls } 
          : (formData.photo?.url ? { url: formData.photo.url } : null)
      }
      const response = await activityService.logActivity(activityData)
      toast.success('Activity logged successfully!')
      
      // Show challenge completion notification if daily target reached
      if (response.data.challengeUpdate?.dailyCompleted) {
        toast.success(
          `🎉 Challenge Complete! You've reached today's target of ${response.data.challengeUpdate.targetValue} ${formData.unit}!`,
          { duration: 5000 }
        )
      } else if (response.data.challengeUpdate) {
        const remaining = response.data.challengeUpdate.remaining
        if (remaining > 0) {
          toast.success(
            `Great progress! ${remaining} ${formData.unit} remaining to complete today's challenge.`,
            { duration: 4000 }
          )
        }
      }

      // Show yoga warning if applicable
      if (response.data.yogaWarning) {
        toast.error(response.data.yogaWarning.message, { duration: 6000 })
      }
      
      setShowForm(false)
      setFormData({
        type: 'steps',
        title: '',
        value: '',
        unit: 'steps',
        description: '',
        activityDate: new Date().toISOString().split('T')[0],
        challenge: null,
        photo: null
      })
      setSelectedChallenge(null)
      setChallengeRequiresPhoto(false)
      setPhotoUrls([''])
      loadActivities()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to log activity')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      unit: name === 'type' ? getDefaultUnit(value) : prev.unit
    }))
  }

  const getDefaultUnit = (type) => {
    const units = {
      steps: 'steps',
      meditation: 'minutes',
      workout: 'minutes',
      yoga: 'minutes',
      walking: 'minutes',
      running: 'minutes',
      hydration: 'glasses',
      sleep: 'hours'
    }
    return units[type] || 'minutes'
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Activities</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center">
          <FiPlus className="mr-2" />
          Log Activity
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Log New Activity</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={(e) => {
                    handleChange(e)
                    // Reset challenge selection when type changes
                    setSelectedChallenge(null)
                    setChallengeRequiresPhoto(false)
                    setFormData(prev => ({ ...prev, challenge: null, photo: null }))
                  }}
                  className="input-field"
                  required
                >
                  <option value="steps">Steps</option>
                  <option value="meditation">Meditation</option>
                  <option value="workout">Workout</option>
                  <option value="yoga">Yoga</option>
                  <option value="walking">Walking</option>
                  <option value="running">Running</option>
                  <option value="hydration">Hydration</option>
                  <option value="sleep">Sleep</option>
                </select>
              </div>
              {/* Google Fit Auto-Fetch for Steps */}
              {formData.type === 'steps' && googleFitConnected && (
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleFetchFromGoogleFit}
                    disabled={fetchingSteps}
                    className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {fetchingSteps ? (
                      <>
                        <FiRefreshCw className="animate-spin mr-2" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <FiRefreshCw className="mr-2" />
                        Fetch from Google Fit
                      </>
                    )}
                  </button>
                </div>
              )}
              {/* Challenge Selection */}
              {activeChallenges.filter(c => c.type === formData.type && c.status === 'active').length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link to Challenge (Optional)
                  </label>
                  <select
                    value={selectedChallenge?._id || ''}
                    onChange={(e) => {
                      const challengeId = e.target.value
                      const challenge = activeChallenges.find(c => c._id === challengeId)
                      setSelectedChallenge(challenge)
                      const requiresPhoto = challenge?.rules?.requiresPhoto || false
                      setChallengeRequiresPhoto(requiresPhoto)
                      setMinPhotos(challenge?.rules?.minPhotos || 1)
                      setMaxPhotos(challenge?.rules?.maxPhotos || 5)
                      setPhotoUrls(requiresPhoto ? Array(challenge?.rules?.minPhotos || 1).fill('') : [''])
                      setFormData(prev => ({ 
                        ...prev, 
                        challenge: challengeId || null,
                        photo: requiresPhoto ? prev.photo : null
                      }))
                    }}
                    className="input-field"
                  >
                    <option value="">No challenge</option>
                    {activeChallenges
                      .filter(c => c.type === formData.type && c.status === 'active')
                      .map(c => (
                        <option key={c._id} value={c._id}>
                          {c.name} {c.rules?.requiresPhoto ? '(Photo Required 📷)' : ''}
                        </option>
                      ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  className="input-field"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="activityDate"
                  value={formData.activityDate}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>
            
            {/* Title and Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Morning Run"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                rows="3"
                placeholder="Add any notes about this activity..."
              />
            </div>

            {/* Photo Upload - Always show, required only if challenge requires it */}
            <div className="border-2 border-dashed border-blue-400 rounded-lg p-6 bg-blue-50 mt-4">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-base font-bold text-gray-800">
                  📸 Upload Photo Proof {challengeRequiresPhoto && <span className="text-red-500">*</span>}
                  {challengeRequiresPhoto && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({minPhotos} - {maxPhotos} photos required)
                    </span>
                  )}
                </label>
              </div>
              <div className="space-y-3">
                {photoUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder={`Photo ${index + 1} URL ${challengeRequiresPhoto && index < minPhotos ? '(Required)' : '(Optional)'}`}
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...photoUrls]
                        newUrls[index] = e.target.value
                        setPhotoUrls(newUrls)
                        setFormData(prev => ({
                          ...prev,
                          photo: {
                            urls: newUrls.filter(u => u.trim()).map(u => ({ url: u }))
                          }
                        }))
                      }}
                      className="input-field flex-1"
                      required={challengeRequiresPhoto && index < minPhotos}
                    />
                    {photoUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newUrls = photoUrls.filter((_, i) => i !== index)
                          setPhotoUrls(newUrls)
                          setFormData(prev => ({
                            ...prev,
                            photo: {
                              urls: newUrls.filter(u => u.trim()).map(u => ({ url: u }))
                            }
                          }))
                        }}
                        className="btn-secondary text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {photoUrls.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoUrls([''])
                    }}
                    className="btn-secondary text-sm flex items-center"
                  >
                    <FiPlus className="mr-2" />
                    Add Photo URL
                  </button>
                )}
                {photoUrls.length > 0 && (!challengeRequiresPhoto || photoUrls.length < maxPhotos) && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoUrls([...photoUrls, ''])
                    }}
                    className="btn-secondary text-sm flex items-center"
                  >
                    <FiPlus className="mr-2" />
                    Add Another Photo
                  </button>
                )}
                {/* File Upload Button - Always visible and prominent */}
                <div className="mt-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files)
                      if (files.length > 0) {
                        // Convert files to data URLs (base64)
                        const filePromises = files.map(file => {
                          return new Promise((resolve) => {
                            const reader = new FileReader()
                            reader.onload = (e) => {
                              resolve(e.target.result) // This is base64 data URL
                            }
                            reader.readAsDataURL(file)
                          })
                        })
                        
                        Promise.all(filePromises).then(dataUrls => {
                          const updatedUrls = [...photoUrls, ...dataUrls]
                          setPhotoUrls(updatedUrls)
                          setFormData(prev => ({
                            ...prev,
                            photo: {
                              urls: updatedUrls.filter(u => u.trim()).map(u => ({ url: u }))
                            }
                          }))
                          toast.success(`${files.length} photo(s) uploaded!`)
                        })
                      }
                    }}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="btn-primary flex items-center justify-center cursor-pointer px-6 py-3 text-base font-semibold w-full"
                  >
                    <FiCamera className="mr-2 text-xl" />
                    📷 Click Here to Upload Photos from Your Device
                  </label>
                </div>
                {photoUrls.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Click above to upload photos OR use "Add Photo URL" button to paste image links
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {challengeRequiresPhoto 
                  ? (minPhotos > 1 
                      ? `This challenge requires ${minPhotos} photos (e.g., before/after, different angles).`
                      : 'This challenge requires photo proof. Upload screenshot from fitness app or photo.')
                  : 'Optional: Add photos to verify your activity (screenshots, photos, etc.)'}
              </p>
            </div>
            {/* Old photo upload section - removed */}
            {false && challengeRequiresPhoto && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo Proof <span className="text-red-500">*</span>
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({minPhotos} - {maxPhotos} photos required)
                  </span>
                </label>
                <div className="space-y-3">
                  {photoUrls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder={`Photo ${index + 1} URL ${index < minPhotos ? '(Required)' : '(Optional)'}`}
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...photoUrls]
                          newUrls[index] = e.target.value
                          setPhotoUrls(newUrls)
                          setFormData(prev => ({
                            ...prev,
                            photo: {
                              urls: newUrls.filter(u => u.trim()).map(u => ({ url: u }))
                            }
                          }))
                        }}
                        className="input-field flex-1"
                        required={index < minPhotos}
                      />
                      {index >= minPhotos && (
                        <button
                          type="button"
                          onClick={() => {
                            const newUrls = photoUrls.filter((_, i) => i !== index)
                            setPhotoUrls(newUrls)
                            setFormData(prev => ({
                              ...prev,
                              photo: {
                                urls: newUrls.filter(u => u.trim()).map(u => ({ url: u }))
                              }
                            }))
                          }}
                          className="btn-secondary text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {photoUrls.length < maxPhotos && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrls([...photoUrls, ''])
                      }}
                      className="btn-secondary text-sm flex items-center"
                    >
                      <FiPlus className="mr-2" />
                      Add Another Photo ({photoUrls.length}/{maxPhotos})
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-secondary flex items-center text-sm"
                    onClick={() => {
                      toast.info('Photo upload feature coming soon! For now, paste image URLs.')
                    }}
                  >
                    <FiCamera className="mr-2" />
                    Upload Photos
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {minPhotos > 1 
                    ? `This challenge requires ${minPhotos} photos (e.g., before/after, different angles).`
                    : 'This challenge requires photo proof. Upload screenshot from fitness app or photo.'}
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Morning Run"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                rows="3"
                placeholder="Add any notes about this activity..."
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Log Activity</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity._id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <FiActivity className="mr-2 text-primary-600" />
                    <h3 className="font-semibold text-lg">{activity.title || activity.type}</h3>
                  </div>
                  <p className="text-gray-600 mb-2">{activity.description || 'No description'}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{activity.value} {activity.unit}</span>
                    <span>•</span>
                    <span>{new Date(activity.activityDate).toLocaleDateString()}</span>
                    {activity.challenge && (
                      <>
                        <span>•</span>
                        <span className="text-primary-600">Challenge: {activity.challenge.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">+{activity.points}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 card">
            <FiActivity className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500">No activities logged yet</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
              Log Your First Activity
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Activities

