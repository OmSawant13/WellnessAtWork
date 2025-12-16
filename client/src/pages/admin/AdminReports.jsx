import { useEffect, useState } from 'react'
import { adminService } from '../../api/services'
import toast from 'react-hot-toast'
import { FiDownload, FiFileText, FiFile } from 'react-icons/fi'

const AdminReports = () => {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async () => {
    try {
      setLoading(true)
      const params = {}
      if (dateRange.startDate) params.startDate = dateRange.startDate
      if (dateRange.endDate) params.endDate = dateRange.endDate
      const response = await adminService.generateReport(params)
      setReport(response.data.data)
    } catch (error) {
      toast.error('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async (type = 'activities') => {
    try {
      const params = { type }
      if (dateRange.startDate) params.startDate = dateRange.startDate
      if (dateRange.endDate) params.endDate = dateRange.endDate
      const response = await adminService.exportCSV(params)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `export_${type}_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('CSV exported successfully')
    } catch (error) {
      toast.error('Failed to export CSV')
    }
  }

  const handleExportPDF = async () => {
    try {
      const params = {}
      if (dateRange.startDate) params.startDate = dateRange.startDate
      if (dateRange.endDate) params.endDate = dateRange.endDate
      const response = await adminService.exportPDF(params)
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `wellness_report_${Date.now()}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('PDF exported successfully')
    } catch (error) {
      toast.error('Failed to export PDF')
    }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Reports & Analytics</h1>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Date Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button onClick={loadReport} className="btn-primary w-full">
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {report && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Summary Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-primary-600">{report.summary?.totalUsers || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-green-600">{report.summary?.totalActivities || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Challenges</p>
              <p className="text-2xl font-bold text-purple-600">{report.summary?.totalChallenges || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-orange-600">{report.summary?.totalBookings || 0}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Active Users (Last 30 days)</p>
            <p className="text-xl font-semibold">{report.participation?.activeUsers || 0}</p>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Export Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleExportCSV('activities')}
            className="btn-secondary flex items-center justify-center"
          >
            <FiFileText className="mr-2" />
            Export Activities CSV
          </button>
          <button
            onClick={() => handleExportCSV('users')}
            className="btn-secondary flex items-center justify-center"
          >
            <FiFileText className="mr-2" />
            Export Users CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="btn-primary flex items-center justify-center col-span-2"
          >
            <FiFile className="mr-2" />
            Export PDF Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminReports

