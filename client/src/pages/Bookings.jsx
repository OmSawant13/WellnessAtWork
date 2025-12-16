import { useEffect, useState } from 'react'
import { bookingService } from '../api/services'
import toast from 'react-hot-toast'
import { FiCalendar, FiPlus, FiX } from 'react-icons/fi'

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    sessionType: 'yoga',
    title: '',
    description: '',
    scheduledDate: '',
    duration: 60,
    location: 'online'
  })

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await bookingService.getMyBookings()
      setBookings(response.data.data)
    } catch (error) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await bookingService.bookSession(formData)
      toast.success('Session booked successfully!')
      setShowForm(false)
      setFormData({
        sessionType: 'yoga',
        title: '',
        description: '',
        scheduledDate: '',
        duration: 60,
        location: 'online'
      })
      loadBookings()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book session')
    }
  }

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.cancelBooking(bookingId, 'User cancelled')
        toast.success('Booking cancelled successfully')
        loadBookings()
      } catch (error) {
        toast.error('Failed to cancel booking')
      }
    }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center">
          <FiPlus className="mr-2" />
          Book Session
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Book Wellness Session</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                <select
                  name="sessionType"
                  value={formData.sessionType}
                  onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="yoga">Yoga</option>
                  <option value="meditation">Meditation</option>
                  <option value="counseling">Counseling</option>
                  <option value="webinar">Webinar</option>
                  <option value="fitness">Fitness</option>
                  <option value="nutrition">Nutrition</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="online">Online</option>
                  <option value="onsite">Onsite</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="3"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Book Session</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking._id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <FiCalendar className="mr-2 text-primary-600" />
                    <h3 className="font-semibold text-lg">{booking.title}</h3>
                    <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{booking.description || 'No description'}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="capitalize">{booking.sessionType}</span>
                    <span>•</span>
                    <span>{new Date(booking.scheduledDate).toLocaleString()}</span>
                    <span>•</span>
                    <span>{booking.duration} minutes</span>
                    <span>•</span>
                    <span className="capitalize">{booking.location}</span>
                  </div>
                  {booking.instructor && (
                    <p className="text-sm text-gray-600 mt-2">Instructor: {booking.instructor}</p>
                  )}
                  {booking.meetingLink && (
                    <a
                      href={booking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block"
                    >
                      Join Meeting →
                    </a>
                  )}
                </div>
                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                  <button
                    onClick={() => handleCancel(booking._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FiX className="text-xl" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 card">
            <FiCalendar className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500">No bookings yet</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
              Book Your First Session
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Bookings

