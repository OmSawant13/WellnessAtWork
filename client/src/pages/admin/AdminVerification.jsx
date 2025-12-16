import { useEffect, useState } from 'react'
import { activityService } from '../../api/services'
import toast from 'react-hot-toast'
import { FiCheck, FiX, FiImage, FiUser, FiCalendar, FiTarget, FiRefreshCw } from 'react-icons/fi'
import { format } from 'date-fns'

const AdminVerification = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(null)
  const [rejecting, setRejecting] = useState(null)

  useEffect(() => {
    loadUnverifiedActivities()
  }, [])

  const loadUnverifiedActivities = async () => {
    try {
      setLoading(true)
      const response = await activityService.getUnverifiedActivities()
      setActivities(response.data.data || [])
    } catch (error) {
      console.error('Error loading unverified activities:', error)
      toast.error('Failed to load unverified activities')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (activityId) => {
    if (!window.confirm('Are you sure you want to verify this activity?')) {
      return
    }

    try {
      setVerifying(activityId)
      await activityService.verifyActivity(activityId)
      toast.success('Activity verified successfully!')
      loadUnverifiedActivities()
    } catch (error) {
      console.error('Error verifying activity:', error)
      toast.error(error.response?.data?.message || 'Failed to verify activity')
    } finally {
      setVerifying(null)
    }
  }

  const handleReject = async (activityId) => {
    const reason = window.prompt('Enter rejection reason (optional):')
    if (reason === null) return // User cancelled

    if (!window.confirm('Are you sure you want to reject this activity? Points will be deducted from the user.')) {
      return
    }

    try {
      setRejecting(activityId)
      const response = await activityService.rejectActivity(activityId, reason)
      toast.success(`Activity rejected. ${response.data.data?.pointsDeducted || 0} points deducted.`)
      loadUnverifiedActivities()
    } catch (error) {
      console.error('Error rejecting activity:', error)
      toast.error(error.response?.data?.message || 'Failed to reject activity')
    } finally {
      setRejecting(null)
    }
  }

  const getActivityTypeColor = (type) => {
    const colors = {
      steps: 'bg-blue-100 text-blue-800',
      hydration: 'bg-cyan-100 text-cyan-800',
      yoga: 'bg-purple-100 text-purple-800',
      workout: 'bg-red-100 text-red-800',
      meditation: 'bg-green-100 text-green-800',
      sleep: 'bg-indigo-100 text-indigo-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading unverified activities...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity Verification</h1>
            <p className="mt-2 text-gray-600">
              Review and verify activities with photo proof
            </p>
          </div>
          <button
            onClick={loadUnverifiedActivities}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all flex items-center"
          >
            <FiRefreshCw className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FiCheck className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All activities verified!</h3>
          <p className="text-gray-600">There are no unverified activities pending review.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activities.map((activity) => (
            <div
              key={activity._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getActivityTypeColor(activity.type)}`}>
                        {activity.type.toUpperCase()}
                      </span>
                      {activity.challenge && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          <FiTarget className="inline mr-1" />
                          {activity.challenge.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {activity.title || `${activity.type} Activity`}
                    </h3>
                    {activity.description && (
                      <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {activity.value} {activity.unit}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {activity.points} points
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiUser className="mr-2" />
                    <span className="font-medium">{activity.user?.name}</span>
                    <span className="mx-2">•</span>
                    <span>{activity.user?.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FiCalendar className="mr-2" />
                    <span>{format(new Date(activity.activityDate), 'MMM dd, yyyy hh:mm a')}</span>
                  </div>
                </div>

                {/* Photos Section */}
                {activity.photo && (activity.photo.urls?.length > 0 || activity.photo.url) && (
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <FiImage className="mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Photo Proof ({activity.photo.urls?.length || 1} photo{activity.photo.urls?.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {activity.photo.urls?.map((photo, idx) => {
                        const photoUrl = typeof photo === 'string' ? photo : photo.url;
                        const imageSrc = photoUrl?.startsWith('data:') || photoUrl?.startsWith('http') 
                          ? photoUrl 
                          : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}${photoUrl}`;
                        return (
                          <div key={idx} className="relative group">
                            <img
                              src={imageSrc}
                              alt={`Proof ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-all"
                              onClick={() => window.open(imageSrc, '_blank')}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs opacity-0 group-hover:opacity-100">Click to enlarge</span>
                            </div>
                          </div>
                        );
                      })}
                      {!activity.photo.urls && activity.photo.url && (
                        <div className="relative group">
                          {(() => {
                            const photoUrl = activity.photo.url;
                            const imageSrc = photoUrl?.startsWith('data:') || photoUrl?.startsWith('http') 
                              ? photoUrl 
                              : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}${photoUrl}`;
                            return (
                              <img
                                src={imageSrc}
                                alt="Proof"
                                className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-all"
                                onClick={() => window.open(imageSrc, '_blank')}
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                                }}
                              />
                            );
                          })()}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs opacity-0 group-hover:opacity-100">Click to enlarge</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleVerify(activity._id)}
                    disabled={verifying === activity._id || rejecting === activity._id}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center"
                  >
                    {verifying === activity._id ? (
                      <>
                        <FiRefreshCw className="animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <FiCheck className="mr-2" />
                        Verify
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(activity._id)}
                    disabled={verifying === activity._id || rejecting === activity._id}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center"
                  >
                    {rejecting === activity._id ? (
                      <>
                        <FiRefreshCw className="animate-spin mr-2" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <FiX className="mr-2" />
                        Reject
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activities.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>{activities.length} unverified activit{activities.length !== 1 ? 'ies' : 'y'} pending review</p>
        </div>
      )}
    </div>
  )
}

export default AdminVerification

