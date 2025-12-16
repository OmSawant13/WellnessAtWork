import { useEffect, useState } from 'react'
import { rewardService, userService } from '../api/services'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { FiGift, FiAward } from 'react-icons/fi'

const Rewards = () => {
  const { user } = useAuthStore()
  const [rewards, setRewards] = useState([])
  const [myPoints, setMyPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [rewardsRes, userRes] = await Promise.all([
        rewardService.getRewards({ available: 'true' }),
        userService.getProfile()
      ])
      setRewards(rewardsRes.data.data)
      setMyPoints(userRes.data.data.wellnessProfile?.totalPoints || 0)
    } catch (error) {
      toast.error('Failed to load rewards')
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (rewardId) => {
    if (window.confirm('Are you sure you want to claim this reward?')) {
      try {
        const response = await rewardService.claimReward(rewardId)
        toast.success('Reward claimed successfully!')
        toast.success(`Redemption Code: ${response.data.data.redemptionCode}`, { duration: 5000 })
        loadData()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to claim reward')
      }
    }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rewards</h1>
        <div className="card">
          <div className="flex items-center">
            <FiAward className="text-2xl text-primary-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Your Points</p>
              <p className="text-2xl font-bold text-primary-600">{myPoints}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const canAfford = myPoints >= reward.pointsCost
          const isAvailable = reward.availability?.remaining === null || reward.availability?.remaining > 0

          return (
            <div key={reward._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <FiGift className="text-4xl text-primary-600" />
                {reward.image && (
                  <img src={reward.image} alt={reward.name} className="w-20 h-20 object-cover rounded" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2">{reward.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-primary-600">{reward.pointsCost} pts</span>
                <span className="text-sm text-gray-500 capitalize">{reward.type}</span>
              </div>
              {reward.availability?.remaining !== null && (
                <p className="text-sm text-gray-500 mb-4">
                  {reward.availability.remaining} remaining
                </p>
              )}
              <button
                onClick={() => handleClaim(reward._id)}
                disabled={!canAfford || !isAvailable}
                className={`w-full ${
                  canAfford && isAvailable
                    ? 'btn-primary'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed px-4 py-2 rounded-lg'
                }`}
              >
                {!canAfford ? 'Insufficient Points' : !isAvailable ? 'Out of Stock' : 'Claim Reward'}
              </button>
            </div>
          )
        })}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-12 card">
          <FiGift className="mx-auto text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500">No rewards available</p>
        </div>
      )}
    </div>
  )
}

export default Rewards

