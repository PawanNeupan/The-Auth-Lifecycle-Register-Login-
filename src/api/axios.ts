// Import axios library
import axios from 'axios'

// Create an axios instance with default configuration
const api = axios.create({
  // Base URL for all API requests
  baseURL: 'http://88.222.242.12:1738',
})

// Add a request interceptor
api.interceptors.request.use((config) => {

  // Get token stored in browser localStorage
  const token = localStorage.getItem('token')

  // If token exists and headers object is available
  if (token && config.headers) {
    // Attach token to Authorization header
    config.headers.Authorization = `Bearer ${token}`
  }

  // Return updated config before request is sent
  return config
})

// Export axios instance for use in the app
export default api


