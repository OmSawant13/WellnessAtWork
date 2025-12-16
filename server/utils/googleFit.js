const axios = require('axios');

/**
 * Fetch steps from Google Fit API for a specific date
 * @param {string} accessToken - Google Fit access token
 * @param {Date} date - Date to fetch steps for (default: today)
 * @returns {Promise<number>} - Number of steps
 */
async function fetchStepsFromGoogleFit(accessToken, date = new Date()) {
  try {
    // Set time range (whole day)
    const startTime = new Date(date);
    startTime.setHours(0, 0, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(23, 59, 59, 999);
    
    const response = await axios.post(
      'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
      {
        aggregateBy: [{
          dataTypeName: 'com.google.step_count.delta'
        }],
        bucketByTime: { durationMillis: 86400000 }, // 24 hours
        startTimeMillis: startTime.getTime(),
        endTimeMillis: endTime.getTime()
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract steps from response
    const bucket = response.data.bucket?.[0];
    if (!bucket || !bucket.dataset || bucket.dataset.length === 0) {
      return 0;
    }
    
    const dataset = bucket.dataset[0];
    if (!dataset.point || dataset.point.length === 0) {
      return 0;
    }
    
    // Sum all step counts for the day
    let totalSteps = 0;
    dataset.point.forEach(point => {
      if (point.value && point.value.length > 0) {
        point.value.forEach(val => {
          if (val.intVal !== undefined) {
            totalSteps += val.intVal;
          }
        });
      }
    });
    
    return totalSteps;
  } catch (error) {
    console.error('Error fetching steps from Google Fit:', error.response?.data || error.message);
    
    // Handle specific errors
    if (error.response?.status === 401) {
      throw new Error('Google Fit token expired. Please reconnect.');
    }
    if (error.response?.status === 403) {
      throw new Error('Google Fit access denied. Please check permissions.');
    }
    
    throw new Error('Failed to fetch steps from Google Fit');
  }
}

/**
 * Refresh Google Fit access token using refresh token
 * @param {string} refreshToken - Google Fit refresh token
 * @returns {Promise<string>} - New access token
 */
async function refreshGoogleFitToken(refreshToken) {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error refreshing Google Fit token:', error.response?.data || error.message);
    throw new Error('Failed to refresh Google Fit token');
  }
}

module.exports = {
  fetchStepsFromGoogleFit,
  refreshGoogleFitToken
};


