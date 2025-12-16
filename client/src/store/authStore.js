import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import api from '../api/axios'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post('/auth/login', { email, password })
          const userData = response.data.data.user
          const tokenData = response.data.data.token
          
          // Set state synchronously
          set({
            user: userData,
            token: tokenData,
            loading: false,
            error: null
          })
          
          // Set token in axios defaults
          if (tokenData) {
            api.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`
          }
          
          return { success: true, user: userData }
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed'
          set({ loading: false, error: message, user: null, token: null })
          return { success: false, message }
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post('/auth/register', userData)
          set({
            user: response.data.data.user,
            token: response.data.data.token,
            loading: false,
            error: null
          })
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed'
          set({ loading: false, error: message })
          return { success: false, message }
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({ user: null, token: null })
          delete api.defaults.headers.common['Authorization']
        }
      },

      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      },

      refreshUser: async () => {
        try {
          const response = await api.get('/auth/me')
          set({ user: response.data.data })
        } catch (error) {
          console.error('Failed to refresh user:', error)
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token })
    }
  )
)

// Initialize axios token if available
const token = useAuthStore.getState().token
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export { useAuthStore }
export default useAuthStore

