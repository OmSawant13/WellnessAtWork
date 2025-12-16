import { useEffect, useState } from 'react'
import { resourceService } from '../api/services'
import toast from 'react-hot-toast'
import { FiBook, FiVideo, FiHeadphones, FiFileText, FiStar } from 'react-icons/fi'

const Resources = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: ''
  })

  useEffect(() => {
    loadResources()
  }, [filters])

  const loadResources = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.type) params.type = filters.type
      if (filters.category) params.category = filters.category
      if (filters.search) params.search = filters.search
      const response = await resourceService.getResources(params)
      setResources(response.data.data)
    } catch (error) {
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <FiVideo />
      case 'podcast': return <FiHeadphones />
      case 'article': return <FiFileText />
      default: return <FiBook />
    }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mental Health Resources</h1>

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="podcast">Podcast</option>
              <option value="worksheet">Worksheet</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input-field"
            >
              <option value="">All Categories</option>
              <option value="stress-management">Stress Management</option>
              <option value="anxiety">Anxiety</option>
              <option value="depression">Depression</option>
              <option value="mindfulness">Mindfulness</option>
              <option value="sleep">Sleep</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-field"
              placeholder="Search resources..."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <div key={resource._id} className="card hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center text-primary-600 text-2xl">
                {getTypeIcon(resource.type)}
              </div>
              {resource.isFeatured && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Featured
                </span>
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span className="capitalize">{resource.category}</span>
              {resource.rating?.average > 0 && (
                <div className="flex items-center">
                  <FiStar className="text-yellow-400 mr-1" />
                  {resource.rating.average.toFixed(1)}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                resourceService.trackAccess(resource._id)
                if (resource.content?.url) {
                  window.open(resource.content.url, '_blank')
                }
              }}
              className="w-full btn-primary"
            >
              View Resource
            </button>
          </div>
        ))}
      </div>

      {resources.length === 0 && (
        <div className="text-center py-12 card">
          <FiBook className="mx-auto text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500">No resources found</p>
        </div>
      )}
    </div>
  )
}

export default Resources

