import api from './axios'

// Auth services
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  connectGoogleFit: () => api.get('/auth/google-fit/connect'),
  getGoogleFitStatus: () => api.get('/auth/google-fit/status'),
  disconnectGoogleFit: () => api.post('/auth/google-fit/disconnect')
}

// User services
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getLeaderboard: (type = 'overall') => api.get(`/users/leaderboard?type=${type}`),
  getBadges: () => api.get('/users/badges'),
  getActivitySummary: (startDate, endDate) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    return api.get(`/users/activity-summary?${params}`)
  },
  getStats: () => api.get('/users/stats')
}

// Challenge services
export const challengeService = {
  getChallenges: (params) => api.get('/challenges', { params }),
  getChallenge: (id) => api.get(`/challenges/${id}`),
  getMyProgress: (id) => api.get(`/challenges/${id}/my-progress`),
  createChallenge: (data) => api.post('/challenges', data),
  joinChallenge: (id) => api.post(`/challenges/${id}/join`),
  leaveChallenge: (id) => api.delete(`/challenges/${id}/leave`),
  getChallengeLeaderboard: (id) => api.get(`/challenges/${id}/leaderboard`),
  updateChallenge: (id, data) => api.put(`/challenges/${id}`, data),
  deleteChallenge: (id) => api.delete(`/challenges/${id}`)
}

// Activity services
export const activityService = {
  logActivity: (data) => {
    // If FormData, don't set Content-Type (browser will set it with boundary)
    if (data instanceof FormData) {
      return api.post('/activities', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }
    return api.post('/activities', data)
  },
  getMyActivities: (params) => api.get('/activities', { params }),
  getAllActivities: (params) => api.get('/activities/all', { params }),
  getUnverifiedActivities: (params) => api.get('/activities/unverified', { params }),
  getActivity: (id) => api.get(`/activities/${id}`),
  updateActivity: (id, data) => api.put(`/activities/${id}`, data),
  deleteActivity: (id) => api.delete(`/activities/${id}`),
  verifyActivity: (id) => api.post(`/activities/${id}/verify`),
  rejectActivity: (id, reason) => api.post(`/activities/${id}/reject`, { reason })
}

// Booking services
export const bookingService = {
  bookSession: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings', { params }),
  getAllBookings: (params) => api.get('/bookings/all', { params }),
  getBooking: (id) => api.get(`/bookings/${id}`),
  updateBooking: (id, data) => api.put(`/bookings/${id}`, data),
  cancelBooking: (id, reason) => api.delete(`/bookings/${id}`, { data: { reason } })
}

// Resource services
export const resourceService = {
  getResources: (params) => api.get('/resources', { params }),
  getResource: (id) => api.get(`/resources/${id}`),
  createResource: (data) => api.post('/resources', data),
  updateResource: (id, data) => api.put(`/resources/${id}`, data),
  deleteResource: (id) => api.delete(`/resources/${id}`),
  trackAccess: (id) => api.post(`/resources/${id}/access`),
  rateResource: (id, rating) => api.post(`/resources/${id}/rating`, { rating }),
  anonymousCheckIn: (data) => api.post('/resources/check-in', data)
}

// Reward services
export const rewardService = {
  getRewards: (params) => api.get('/rewards', { params }),
  getReward: (id) => api.get(`/rewards/${id}`),
  createReward: (data) => api.post('/rewards', data),
  updateReward: (id, data) => api.put(`/rewards/${id}`, data),
  deleteReward: (id) => api.delete(`/rewards/${id}`),
  claimReward: (id) => api.post(`/rewards/${id}/claim`),
  getMyRedemptions: () => api.get('/rewards/my/redemptions')
}

// Battle services
export const battleService = {
  createBattle: (data) => api.post('/battles', data),
  getMyBattles: () => api.get('/battles'),
  respondToBattle: (id, response) => api.put(`/battles/${id}/respond`, { response }),
  updateBattleProgress: (id, progress) => api.put(`/battles/${id}/progress`, { progress })
}

// Wellness Post services
export const wellnessPostService = {
  createPost: (data) => api.post('/wellness-posts', data),
  getPosts: (params) => api.get('/wellness-posts', { params }),
  likePost: (id) => api.post(`/wellness-posts/${id}/like`),
  commentPost: (id, text) => api.post(`/wellness-posts/${id}/comment`, { text }),
  deletePost: (id) => api.delete(`/wellness-posts/${id}`)
}

// Loot Box services
export const lootBoxService = {
  openLootBox: () => api.post('/loot-boxes/open'),
  getMyLootBoxes: () => api.get('/loot-boxes'),
  checkLootBox: () => api.get('/loot-boxes/check')
}

// Quick Snap services
export const quickSnapService = {
  startQuickSnap: (data) => api.post('/quick-snaps', data),
  completeQuickSnap: (id, shared) => api.put(`/quick-snaps/${id}/complete`, { shared }),
  getMyQuickSnaps: () => api.get('/quick-snaps'),
  getQuickSnapTypes: () => api.get('/quick-snaps/types')
}

// Admin services
export const adminService = {
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  generateReport: (params) => api.get('/admin/reports', { params }),
  exportCSV: (params) => api.get('/admin/export/csv', { params, responseType: 'blob' }),
  exportPDF: (params) => api.get('/admin/export/pdf', { params, responseType: 'blob' }),
  getParticipationStats: (params) => api.get('/admin/participation', { params }),
  getTeamLeaderboard: () => api.get('/admin/team-leaderboard'),
  getUserActivities: (params) => api.get('/admin/user-activities', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserChallenges: (params) => api.get('/admin/user-challenges', { params }),
  getDepartmentAnalytics: (params) => api.get('/admin/department-analytics', { params }),
  assignChallengeToDepartment: (challengeId, department) => api.post(`/admin/challenges/${challengeId}/assign-department`, { department }),
  assignChallengeToUsers: (challengeId, userIds) => api.post(`/admin/challenges/${challengeId}/assign-users`, { userIds })
}

