import { useEffect, useState } from 'react'
import { userService } from '../api/services'
import toast from 'react-hot-toast'
import { FiTrendingUp, FiAward, FiUsers } from 'react-icons/fi'

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [teamLeaderboard, setTeamLeaderboard] = useState([])
  const [type, setType] = useState('overall')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [type])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await userService.getLeaderboard(type)
      if (type === 'team') {
        setTeamLeaderboard(response.data.data)
      } else {
        setLeaderboard(response.data.data)
      }
    } catch (error) {
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
        <FiTrendingUp className="mr-2" /> Leaderboard
      </h1>

      <div className="mb-6">
        <div className="flex gap-2">
          {['overall', 'team'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-lg ${
                type === t
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {type === 'overall' ? (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiUsers className="mr-2" /> Individual Leaderboard
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Rank</th>
                  <th className="text-left py-3">Name</th>
                  <th className="text-left py-3">Department</th>
                  <th className="text-left py-3">Points</th>
                  <th className="text-left py-3">Streak</th>
                  <th className="text-left py-3">Level</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, index) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-bold text-lg">{getRankIcon(index + 1)}</td>
                    <td className="py-3 font-medium">{user.name}</td>
                    <td className="py-3 text-gray-600">{user.department || 'N/A'}</td>
                    <td className="py-3 font-semibold text-primary-600">
                      {user.wellnessProfile?.totalPoints || 0}
                    </td>
                    <td className="py-3">{user.wellnessProfile?.currentStreak || 0} days</td>
                    <td className="py-3">Level {user.wellnessProfile?.level || 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiUsers className="mr-2" /> Team Leaderboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamLeaderboard.map((team, index) => (
              <div key={team._id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">{getRankIcon(index + 1)}</span>
                  <span className="font-semibold text-lg">{team.name}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{team.department || 'N/A'}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Points:</span>
                  <span className="font-semibold text-primary-600">{team.stats?.totalPoints || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Members:</span>
                  <span className="font-semibold">{team.memberCount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaderboard

