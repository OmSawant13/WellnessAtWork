import { useEffect, useState } from 'react'
import { resourceService } from '../../api/services'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi'

const AdminResources = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'article',
    category: 'general',
    tags: '',
    content: { url: '' },
    isFeatured: false
  })

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    try {
      setLoading(true)
      const response = await resourceService.getResources()
      setResources(response.data.data)
    } catch (error) {
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      }
      await resourceService.createResource(data)
      toast.success('Resource created successfully!')
      setShowForm(false)
      loadResources()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create resource')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceService.deleteResource(id)
        toast.success('Resource deleted successfully')
        loadResources()
      } catch (error) {
        toast.error('Failed to delete resource')
      }
    }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Resources</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center">
          <FiPlus className="mr-2" />
          Add Resource
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Resource</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="podcast">Podcast</option>
                  <option value="worksheet">Worksheet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="general">General</option>
                  <option value="stress-management">Stress Management</option>
                  <option value="anxiety">Anxiety</option>
                  <option value="depression">Depression</option>
                  <option value="mindfulness">Mindfulness</option>
                  <option value="sleep">Sleep</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={formData.content.url}
                  onChange={(e) => setFormData({
                    ...formData,
                    content: { ...formData.content, url: e.target.value }
                  })}
                  className="input-field"
                  required
                />
              </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input-field"
                placeholder="stress, wellness, mindfulness"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="featured" className="text-sm text-gray-700">Featured Resource</label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Create Resource</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <div key={resource._id} className="card">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{resource.title}</h3>
              {resource.isFeatured && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Featured
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{resource.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 capitalize">{resource.type}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(resource._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminResources

