import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { challengeService, activityService } from '../api/services'
import toast from 'react-hot-toast'
import { FiUsers, FiCalendar, FiAward, FiTrendingUp, FiCamera, FiPlus } from 'react-icons/fi'

const ChallengeDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [challenge, setChallenge] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [myProgress, setMyProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogForm, setShowLogForm] = useState(false)
  const [logValue, setLogValue] = useState('')
  const [photoUrls, setPhotoUrls] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const loadingRef = useRef(false)

  useEffect(() => {
    if (!loadingRef.current) {
    loadChallenge()
    }
    return () => {
      loadingRef.current = false
    }
  }, [id])

  const loadChallenge = async (showLoading = true) => {
    if (loadingRef.current) return // Prevent multiple simultaneous loads
    loadingRef.current = true
    
    try {
      if (showLoading) setLoading(true)
      const [challengeRes, leaderboardRes] = await Promise.all([
        challengeService.getChallenge(id),
        challengeService.getChallengeLeaderboard(id)
      ])
      setChallenge(challengeRes.data.data)
      setLeaderboard(leaderboardRes.data.data.leaderboard || [])
      
      // Load user's progress if they're a participant
      const isParticipant = challengeRes.data.data.participants?.some(
        p => p.user?._id || p.user === challengeRes.data.data.participants[0]?.user
      )
      if (isParticipant) {
        try {
          const progressRes = await challengeService.getMyProgress(id)
          setMyProgress(progressRes.data.data)
        } catch (error) {
          // User might not be participant yet
          setMyProgress(null)
        }
      } else {
        setMyProgress(null)
      }
    } catch (error) {
      if (error.response?.status !== 429) {
      toast.error('Failed to load challenge')
      }
    } finally {
      if (showLoading) setLoading(false)
      loadingRef.current = false
    }
  }

  const handleJoin = async () => {
    try {
      await challengeService.joinChallenge(id)
      toast.success('Successfully joined challenge!')
      loadChallenge(false) // Reload without showing loading spinner
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join challenge')
    }
  }

  const handleLeave = async () => {
    if (window.confirm('Are you sure you want to leave this challenge?')) {
      try {
        await challengeService.leaveChallenge(id)
        toast.success('Left challenge successfully')
        loadChallenge(false) // Reload without showing loading spinner
      } catch (error) {
        toast.error('Failed to leave challenge')
      }
    }
  }

  const handleLogProgress = async (e) => {
    e.preventDefault()
    
    // Validate value
    if (!logValue || parseFloat(logValue) <= 0) {
      toast.error('Please enter a valid value')
      return
    }

    // Validate photo requirements (use same logic as isFormValid)
    if (challenge.rules?.requiresPhoto) {
      const minPhotos = challenge.rules?.minPhotos || 1
      const validPhotos = countValidPhotos(photoUrls)
      
      if (validPhotos < minPhotos) {
        toast.error(`This challenge requires at least ${minPhotos} photo(s). Please upload ${minPhotos - validPhotos} more photo(s).`)
        return
      }

      // Check max photos limit
      const maxPhotos = challenge.rules?.maxPhotos
      if (maxPhotos && validPhotos > maxPhotos) {
        toast.error(`Maximum ${maxPhotos} photos allowed. You have ${validPhotos} photos.`)
        return
      }
    }

    if (submitting) return // Prevent double submission
    setSubmitting(true)
    
    try {
      // Prepare FormData for file upload
      const formData = new FormData()
      formData.append('type', challenge.type)
      formData.append('value', parseFloat(logValue))
      formData.append('unit', challenge.rules?.unit)
      formData.append('challenge', challenge._id)
      formData.append('activityDate', new Date().toISOString().split('T')[0])
      
      // Separate File objects from URLs
      const filePhotos = photoUrls.filter(item => item instanceof File)
      const urlPhotos = photoUrls.filter(item => typeof item === 'string' && item.trim() && !(item instanceof File))
      
      // Add files to FormData
      filePhotos.forEach((file) => {
        formData.append('photos', file)
      })
      
      // Add URL photos as JSON string
      if (urlPhotos.length > 0) {
        formData.append('photo', JSON.stringify({
          urls: urlPhotos.map(url => ({ url: url.trim() }))
        }))
      }

      const response = await activityService.logActivity(formData)
      
      // Show success with points earned
      const pointsEarned = response.data.data?.points || 0
      const bonusPoints = response.data.challengeUpdate?.bonusPoints || 0
      
      toast.success(`Progress logged! +${pointsEarned} points`, { duration: 3000 })
      
      if (bonusPoints > 0) {
        toast.success(`🎉 Daily target completed! Bonus: +${bonusPoints} points`, { duration: 5000 })
      }
      
      // Update progress without full reload
      if (response.data.challengeUpdate) {
        try {
          const progressRes = await challengeService.getMyProgress(id)
          setMyProgress(progressRes.data.data)
        } catch (error) {
          // If progress fetch fails, do a silent reload
          loadChallenge(false)
        }
      }

      setLogValue('')
      setPhotoUrls([])
      setShowLogForm(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to log progress')
    } finally {
      setSubmitting(false)
    }
  }

  // Helper function to count valid photos (used in multiple places)
  const countValidPhotos = (urls) => {
    return urls.filter(item => {
      if (!item) return false
      if (item instanceof File) return true
      if (typeof item === 'string') {
        const trimmed = item.trim()
        // Check for base64 image data (data:image/...) or http/https URLs
        if (!trimmed) return false
        // Base64 images start with "data:image/"
        if (trimmed.startsWith('data:image/')) return true
        // HTTP/HTTPS URLs
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true
        // Also check for just "data:image" without the slash (edge case)
        if (trimmed.startsWith('data:image')) return true
      }
      return false
    }).length
  }

  // Check if form is valid for submission - useMemo to make it reactive
  const isFormValid = useMemo(() => {
    // Check value
    const numValue = parseFloat(logValue)
    const hasValidValue = logValue && logValue.trim() !== '' && !isNaN(numValue) && numValue > 0
    
    if (!hasValidValue) {
      console.log('❌ Invalid value:', { logValue, numValue, hasValidValue })
      return false
    }
    
    // Check photo requirements
    if (challenge?.rules?.requiresPhoto) {
      const minPhotos = challenge.rules?.minPhotos || 1
      const validPhotos = countValidPhotos(photoUrls)
      const photoValid = validPhotos >= minPhotos
      const result = hasValidValue && photoValid
      
      // Debug logging
      console.log('🔍 Validation:', {
        logValue,
        numValue,
        hasValidValue,
        photoUrlsArray: photoUrls,
        photoUrlsCount: photoUrls.length,
        validPhotos,
        minPhotos,
        photoValid,
        result,
        photoUrlsTypes: photoUrls.map(item => ({
          type: typeof item,
          isFile: item instanceof File,
          preview: typeof item === 'string' ? item.substring(0, 50) : 'N/A'
        }))
      })
      
      return result
    }
    
    return hasValidValue
  }, [logValue, photoUrls, challenge?.rules?.requiresPhoto, challenge?.rules?.minPhotos])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-600">Loading challenge...</p>
          </div>
        </div>
      </div>
    )
  }
  
  if (!challenge) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Challenge not found</p>
          <Link to="/challenges" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            ← Back to Challenges
          </Link>
        </div>
      </div>
    )
  }

  const isParticipant = challenge.participants?.some(p => p.user?._id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/challenges" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
        ← Back to Challenges
      </Link>

      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{challenge.name}</h1>
            <p className="text-gray-600 mt-2">{challenge.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            challenge.status === 'active' ? 'bg-green-100 text-green-800' :
            challenge.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {challenge.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center text-gray-600">
            <FiCalendar className="mr-2" />
            <div>
              <p className="text-sm">Start Date</p>
              <p className="font-medium">{new Date(challenge.startDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center text-gray-600">
            <FiCalendar className="mr-2" />
            <div>
              <p className="text-sm">End Date</p>
              <p className="font-medium">{new Date(challenge.endDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center text-gray-600">
            <FiUsers className="mr-2" />
            <div>
              <p className="text-sm">Participants</p>
              <p className="font-medium">{challenge.participants?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Challenge Rules</h3>
          <p className="text-gray-600">
            Target: {challenge.rules?.targetValue} {challenge.rules?.unit}
          </p>
          <p className="text-sm text-gray-500">Point Multiplier: {challenge.rules?.pointMultiplier || 1}x</p>
        </div>

        {challenge.rewards && (
          <div className="bg-primary-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center">
              <FiAward className="mr-2" /> Rewards
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {challenge.rewards.firstPlace?.points && (
                <div>
                  <p className="text-gray-600">1st Place</p>
                  <p className="font-semibold text-primary-600">{challenge.rewards.firstPlace.points} points</p>
                </div>
              )}
              {challenge.rewards.secondPlace?.points && (
                <div>
                  <p className="text-gray-600">2nd Place</p>
                  <p className="font-semibold text-primary-600">{challenge.rewards.secondPlace.points} points</p>
                </div>
              )}
              {challenge.rewards.thirdPlace?.points && (
                <div>
                  <p className="text-gray-600">3rd Place</p>
                  <p className="font-semibold text-primary-600">{challenge.rewards.thirdPlace.points} points</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6">
          {!isParticipant && challenge.status === 'active' ? (
            <button onClick={handleJoin} className="btn-primary">
              Join Challenge
            </button>
          ) : isParticipant ? (
            <button onClick={handleLeave} className="btn-secondary">
              Leave Challenge
            </button>
          ) : null}
        </div>
      </div>

      {/* My Progress Card */}
      {myProgress && (
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Progress</h2>
          
          {/* Today's Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Today's Progress</h3>
              {myProgress.todayProgress.completed ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  ✓ Completed Today!
                </span>
              ) : (
                <span className="text-sm text-gray-600">
                  {myProgress.todayProgress.remaining} {challenge.rules?.unit} remaining
                </span>
              )}
            </div>
            
            {/* Log Progress Button */}
            {!myProgress.todayProgress.completed && (
              <button
                onClick={() => setShowLogForm(!showLogForm)}
                className="mt-4 w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FiPlus className="mr-2" />
                Log Your Progress
              </button>
            )}

            {/* Log Progress Form */}
            {showLogForm && !myProgress.todayProgress.completed && (
              <div className="mt-4 p-6 border border-gray-200 rounded-xl bg-white shadow-sm">
                <h4 className="font-semibold text-lg text-gray-900 mb-4">Log Your Progress</h4>
                <form onSubmit={handleLogProgress} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value ({challenge.rules?.unit}) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={logValue}
                      onChange={(e) => {
                        setLogValue(e.target.value)
                        console.log('Value changed:', e.target.value)
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                      placeholder={`Enter ${challenge.rules?.unit} completed`}
                      required
                      min="0.1"
                      step="0.1"
                    />
                    {logValue && parseFloat(logValue) <= 0 && (
                      <p className="mt-1 text-xs text-red-600">Value must be greater than 0</p>
                    )}
                  </div>

                  {/* Photo Upload Section */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Photo Proof {challenge.rules?.requiresPhoto && <span className="text-red-500">*</span>}
                      {challenge.rules?.requiresPhoto && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({challenge.rules?.minPhotos || 1} - {challenge.rules?.maxPhotos || 'unlimited'} required)
                        </span>
                      )}
                    </label>
                    {challenge.rules?.requiresPhoto && (() => {
                      const validCount = countValidPhotos(photoUrls)
                      const minPhotos = challenge.rules?.minPhotos || 1
                      const isPhotoRequirementMet = validCount >= minPhotos
                      return (
                        <div className={`mb-3 p-2 border rounded text-xs ${
                          isPhotoRequirementMet 
                            ? 'bg-green-50 border-green-200 text-green-800' 
                            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                        }`}>
                          <strong>Required:</strong> Upload at least {minPhotos} photo(s) to submit progress
                          <span className={`ml-2 font-semibold ${isPhotoRequirementMet ? 'text-green-700' : 'text-yellow-700'}`}>
                            ({validCount} / {minPhotos} uploaded)
                          </span>
                        </div>
                      )
                    })()}
                    
                    <div className="space-y-3">
                      {photoUrls.map((url, index) => {
                        const isBase64 = typeof url === 'string' && url.startsWith('data:image')
                        const isFile = url instanceof File
                        const displayValue = isBase64 ? '📷 Image uploaded' : (isFile ? `📷 ${url.name}` : url)
                        
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <div className="flex-1 relative">
                              {isBase64 || isFile ? (
                                <div className="px-3 py-2 border border-green-300 bg-green-50 rounded-lg text-sm text-green-700 flex items-center">
                                  <span className="mr-2">{isBase64 ? '📷' : '📎'}</span>
                                  <span>{isBase64 ? 'Image uploaded' : url.name}</span>
                                </div>
                              ) : (
                                <input
                                  type="url"
                                  placeholder={`Photo ${index + 1} URL`}
                                  value={url}
                                  onChange={(e) => {
                                    const newUrls = [...photoUrls]
                                    newUrls[index] = e.target.value
                                    setPhotoUrls(newUrls)
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all text-sm"
                                  required={challenge.rules?.requiresPhoto && index < (challenge.rules?.minPhotos || 1)}
                                />
                              )}
                            </div>
                            {photoUrls.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setPhotoUrls(photoUrls.filter((_, i) => i !== index))}
                                className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        )
                      })}
                      
                      {photoUrls.length === 0 && (
                        <button
                          type="button"
                          onClick={() => setPhotoUrls([''])}
                          className="w-full py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
                        >
                          <FiPlus className="mr-2" />
                          Add Photo URL
                        </button>
                      )}
                      
                      {photoUrls.length > 0 && (!challenge.rules?.maxPhotos || photoUrls.length < challenge.rules.maxPhotos) && (
                        <button
                          type="button"
                          onClick={() => setPhotoUrls([...photoUrls, ''])}
                          className="w-full py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
                        >
                          <FiPlus className="mr-2" />
                          Add Another Photo
                        </button>
                      )}

                      {/* File Upload */}
                      <div className="mt-3">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files)
                            if (files.length > 0) {
                              const filePromises = files.map(file => {
                                return new Promise((resolve) => {
                                  const reader = new FileReader()
                                  reader.onload = (e) => resolve(e.target.result)
                                  reader.readAsDataURL(file)
                                })
                              })
                              
                              Promise.all(filePromises).then(dataUrls => {
                                setPhotoUrls([...photoUrls, ...dataUrls])
                                toast.success(`${files.length} photo(s) uploaded!`)
                              })
                            }
                          }}
                          className="hidden"
                          id="challenge-photo-upload"
                        />
                        <label
                          htmlFor="challenge-photo-upload"
                          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow-md"
                        >
                          <FiCamera className="mr-2" />
                          Upload Photos from Device
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Validation Status */}
                  {!isFormValid && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                      <strong>Missing Requirements:</strong>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        {(!logValue || parseFloat(logValue) <= 0) && (
                          <li>Enter a valid value (greater than 0)</li>
                        )}
                        {challenge?.rules?.requiresPhoto && (() => {
                          const validCount = countValidPhotos(photoUrls)
                          const minPhotos = challenge.rules?.minPhotos || 1
                          if (validCount < minPhotos) {
                            return <li>Upload at least {minPhotos} photo(s) ({validCount}/{minPhotos} uploaded)</li>
                          }
                          return null
                        })()}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={!isFormValid || submitting}
                      className={`flex-1 font-medium py-3 px-6 rounded-lg transition-all shadow-sm ${
                        isFormValid && !submitting
                          ? 'bg-gray-900 hover:bg-gray-800 text-white hover:shadow-md cursor-pointer'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {submitting ? 'Submitting...' : (isFormValid ? 'Submit Progress' : 'Complete Requirements to Submit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowLogForm(false)
                        setLogValue('')
                        setPhotoUrls([])
                      }}
                      className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  myProgress.todayProgress.completed
                    ? 'bg-green-500'
                    : 'bg-gray-900'
                }`}
                style={{
                  width: `${Math.min(
                    (myProgress.todayProgress.value / myProgress.todayProgress.target) * 100,
                    100
                  )}%`
                }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {myProgress.todayProgress.value} / {myProgress.todayProgress.target} {challenge.rules?.unit}
            </p>
            {myProgress.todayProgress.completed && (
              <p className="text-sm text-green-600 font-medium">
                🎉 Great job! You've completed today's target!
              </p>
            )}
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-2xl font-semibold text-gray-900 mb-1">{myProgress.totalProgress}</p>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Total {challenge.rules?.unit}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-2xl font-semibold text-gray-900 mb-1">{myProgress.totalDaysCompleted}</p>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Days Completed</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-2xl font-semibold text-gray-900 mb-1">{myProgress.totalPoints}</p>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Total Points</p>
            </div>
          </div>
        </div>
      )}

      {leaderboard.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <FiTrendingUp className="mr-2" /> Leaderboard
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Rank</th>
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">Progress</th>
                  <th className="text-left py-2">Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">#{entry.rank}</td>
                    <td className="py-2">{entry.user?.name || 'User'}</td>
                    <td className="py-2">{entry.progress}</td>
                    <td className="py-2 font-semibold text-primary-600">{entry.points}</td>
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

export default ChallengeDetails

