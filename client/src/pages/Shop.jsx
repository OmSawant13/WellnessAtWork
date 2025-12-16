import { useEffect, useState } from 'react'
import { rewardService, userService } from '../api/services'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { FiShoppingBag, FiAward, FiGift, FiCheck } from 'react-icons/fi'

const Shop = () => {
  const { user } = useAuthStore()
  const [rewards, setRewards] = useState([])
  const [myPoints, setMyPoints] = useState(0)
  const [myRedemptions, setMyRedemptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('shop') // 'shop' or 'my-orders'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [rewardsRes, userRes, redemptionsRes] = await Promise.all([
        rewardService.getRewards({ available: 'true' }),
        userService.getProfile(),
        rewardService.getMyRedemptions()
      ])
      setRewards(rewardsRes.data.data)
      setMyPoints(userRes.data.data.wellnessProfile?.totalPoints || 0)
      setMyRedemptions(redemptionsRes.data.data || [])
    } catch (error) {
      toast.error('Failed to load shop data')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (rewardId) => {
    const reward = rewards.find(r => r._id === rewardId)
    if (!reward) return

    if (myPoints < reward.pointsCost) {
      toast.error('Insufficient points! Keep earning to unlock this reward.')
      return
    }

    if (window.confirm(`Purchase "${reward.name}" for ${reward.pointsCost} points?`)) {
      try {
        const response = await rewardService.claimReward(rewardId)
        toast.success('🎉 Purchase successful!')
        toast.success(`Redemption Code: ${response.data.data.redemptionCode}`, { duration: 5000 })
        loadData()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to purchase reward')
      }
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'fitness': return '💪'
      case 'wellness': return '🧘'
      case 'mental-health': return '🧠'
      case 'nutrition': return '🥗'
      case 'lifestyle': return '✨'
      default: return '🎁'
    }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FiShoppingBag className="mr-3" /> Wellness Shop
        </h1>
        <div className="card">
          <div className="flex items-center">
            <FiAward className="text-2xl text-primary-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Your Points</p>
              <p className="text-2xl font-bold text-primary-600">{myPoints.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('shop')}
          className={`px-6 py-2 rounded-lg font-medium ${
            activeTab === 'shop'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FiShoppingBag className="inline mr-2" /> Shop
        </button>
        <button
          onClick={() => setActiveTab('my-orders')}
          className={`px-6 py-2 rounded-lg font-medium ${
            activeTab === 'my-orders'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FiGift className="inline mr-2" /> My Orders ({myRedemptions.length})
        </button>
      </div>

      {activeTab === 'shop' ? (
        <>
          <div className="mb-6">
            <p className="text-gray-600">
              Redeem your wellness points for amazing rewards! Keep earning points through challenges and activities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => {
              const canAfford = myPoints >= reward.pointsCost
              const isAvailable = reward.availability?.remaining === null || reward.availability?.remaining > 0

              return (
                <div key={reward._id} className="card hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{getCategoryIcon(reward.category)}</div>
                    {reward.image && (
                      <img src={reward.image} alt={reward.name} className="w-20 h-20 object-cover rounded" />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{reward.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{reward.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-primary-600">{reward.pointsCost.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 ml-1">points</span>
                    </div>
                    <span className="text-sm text-gray-500 capitalize px-2 py-1 bg-gray-100 rounded">
                      {reward.type}
                    </span>
                  </div>
                  
                  {reward.availability?.remaining !== null && (
                    <p className="text-sm text-gray-500 mb-4">
                      {reward.availability.remaining} remaining
                    </p>
                  )}
                  
                  <button
                    onClick={() => handlePurchase(reward._id)}
                    disabled={!canAfford || !isAvailable}
                    className={`w-full ${
                      canAfford && isAvailable
                        ? 'btn-primary'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed px-4 py-2 rounded-lg'
                    }`}
                  >
                    {!canAfford ? `Need ${(reward.pointsCost - myPoints).toLocaleString()} more points` : 
                     !isAvailable ? 'Out of Stock' : 
                     'Purchase Now'}
                  </button>
                </div>
              )
            })}
          </div>

          {rewards.length === 0 && (
            <div className="text-center py-12 card">
              <FiShoppingBag className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500">No rewards available at the moment</p>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {myRedemptions.length > 0 ? (
            myRedemptions.map((redemption, index) => (
              <div key={index} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <FiGift className="mr-2 text-primary-600" />
                      <h3 className="text-lg font-semibold">{redemption.reward.name}</h3>
                      <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                        redemption.redemption.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                        redemption.redemption.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {redemption.redemption.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{redemption.reward.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Redeemed: {new Date(redemption.redemption.redeemedAt).toLocaleDateString()}</span>
                      {redemption.redemption.code && (
                        <>
                          <span>•</span>
                          <span className="font-mono font-semibold text-primary-600">
                            Code: {redemption.redemption.code}
                          </span>
                        </>
                      )}
                    </div>
                    {redemption.reward.redemptionInstructions && (
                      <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                        {redemption.reward.redemptionInstructions}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">
                      {redemption.reward.pointsCost} pts
                    </p>
                    {redemption.redemption.status === 'fulfilled' && (
                      <FiCheck className="text-green-500 text-xl mt-2" />
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 card">
              <FiGift className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500">No purchases yet</p>
              <p className="text-sm text-gray-400 mt-2">Start shopping to see your orders here!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Shop

