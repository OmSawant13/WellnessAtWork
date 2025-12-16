import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const AdminRoute = ({ children }) => {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'admin' && user.role !== 'hr') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminRoute

