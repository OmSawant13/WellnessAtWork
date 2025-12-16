import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { challengeService } from '../api/services'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { FiTarget, FiUsers, FiCalendar, FiAward, FiCheck, FiX, FiClock } from 'react-icons/fi'

const Challenges = () => {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin' || user?.role === 'hr'
  
  const [challengeData, setChallengeData] = useState({
    today: [],
    upcoming: [],
    expired: [],
    completed: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      if (isMounted) {
        await loadChallenges()
      }
    }
    
    loadData()
    
    return () => {
      isMounted = false
    }
  }, [])

  const loadChallenges = async () => {
    try {
      setLoading(true)
      const response = await challengeService.getChallenges()
      setChallengeData(response.data.data)
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.')
      } else {
      toast.error('Failed to load challenges')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (challengeId) => {
    try {
      await challengeService.joinChallenge(challengeId)
      toast.success('Successfully joined challenge!')
      loadChallenges()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join challenge')
    }
  }

  const renderChallengeCard = (challenge) => {
          const isParticipant = challenge.participants?.some(
            p => p.user?._id || p.user === challenge.participants[0]?.user
          )
    const userProgress = challenge.userProgress
          
          return (
            <div key={challenge._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{challenge.name}</h3>
            <p className="text-sm text-gray-600 mt-1 capitalize">{challenge.type}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
            challenge.category === 'today' ? 'bg-green-100 text-green-800' :
            challenge.category === 'upcoming' ? 'bg-blue-100 text-blue-800' :
            challenge.category === 'completed' ? 'bg-purple-100 text-purple-800' :
            'bg-red-100 text-red-800'
                }`}>
            {challenge.category === 'today' ? 'Today' :
             challenge.category === 'upcoming' ? 'Upcoming' :
             challenge.category === 'completed' ? 'Completed' :
             'Expired'}
                </span>
              </div>

              <p className="text-gray-600 mb-4">{challenge.description}</p>

              <div className="space-y-2 mb-4">
          {challenge.isDailyChallenge && challenge.expiresAt && (
            <div className="flex items-center text-sm text-orange-600 font-semibold">
              <FiClock className="mr-2" />
              {challenge.isExpired ? '⏰ Expired' : 
               `⏰ ${Math.floor((new Date(challenge.expiresAt) - new Date()) / (1000 * 60 * 60))} hours left`}
            </div>
          )}
                <div className="flex items-center text-sm text-gray-600">
                  <FiCalendar className="mr-2" />
                  {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiUsers className="mr-2" />
                  {challenge.participants?.length || 0} participants
                </div>
                {challenge.rewards?.firstPlace?.points && (
                  <div className="flex items-center text-sm text-primary-600">
                    <FiAward className="mr-2" />
                    First place: {challenge.rewards.firstPlace.points} points
                  </div>
                )}
          
          {/* User Progress */}
          {userProgress && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Your Progress</span>
                {userProgress.challengeCompleted ? (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                    <FiCheck className="mr-1" /> Completed
                  </span>
                ) : userProgress.pointsLost > 0 ? (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center">
                    <FiX className="mr-1" /> Points Lost: {userProgress.pointsLost}
                  </span>
                ) : null}
              </div>
              <div className="text-sm text-gray-600">
                <p>Progress: {userProgress.progress} / {challenge.rules?.targetValue || 0} {challenge.rules?.unit}</p>
                <p>Points Earned: {userProgress.points}</p>
                {userProgress.pointsLost > 0 && (
                  <p className="text-red-600 font-semibold">
                    ⚠️ Lost {userProgress.pointsLost} points for not completing
                  </p>
                )}
              </div>
            </div>
          )}
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/challenges/${challenge._id}`}
                  className="flex-1 btn-secondary text-center"
                >
                  View Details
                </Link>
          {!isParticipant && challenge.category === 'today' && (
                  <button
                    onClick={() => handleJoin(challenge._id)}
                    className="flex-1 btn-primary"
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          )
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Challenges</h1>

      {/* Today's Challenge */}
      {challengeData.today && challengeData.today.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FiTarget className="text-2xl text-green-600 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">Today's Challenge</h2>
            <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {challengeData.today.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challengeData.today.map(renderChallengeCard)}
          </div>
        </div>
      )}

      {/* Upcoming Challenges - Only for Admin/HR */}
      {isAdmin && challengeData.upcoming && challengeData.upcoming.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FiCalendar className="text-2xl text-blue-600 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">Upcoming (Tomorrow)</h2>
            <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {challengeData.upcoming.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challengeData.upcoming.map(renderChallengeCard)}
          </div>
        </div>
      )}

      {/* Completed Challenges */}
      {challengeData.completed && challengeData.completed.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FiCheck className="text-2xl text-purple-600 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">Completed</h2>
            <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {challengeData.completed.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challengeData.completed.map(renderChallengeCard)}
          </div>
        </div>
      )}

      {/* Expired Challenges */}
      {challengeData.expired && challengeData.expired.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FiX className="text-2xl text-red-600 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">Expired (3+ Days Ago)</h2>
            <span className="ml-3 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              {challengeData.expired.length}
            </span>
          </div>
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded">
            <p className="text-sm text-red-800">
              ⚠️ These challenges expired without completion. Points were deducted as penalty.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challengeData.expired.map(renderChallengeCard)}
          </div>
      </div>
      )}

      {/* Empty State */}
      {(!challengeData.today || challengeData.today.length === 0) &&
       (!challengeData.upcoming || challengeData.upcoming.length === 0) &&
       (!challengeData.completed || challengeData.completed.length === 0) &&
       (!challengeData.expired || challengeData.expired.length === 0) && (
        <div className="text-center py-12">
          <FiTarget className="mx-auto text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500">No challenges available</p>
        </div>
      )}
    </div>
  )
}

export default Challenges
