// Import React and useState hook
import React, { useState } from 'react'

// useNavigate is used to redirect after successful login
import { useNavigate } from 'react-router-dom'

// Axios instance with baseURL and token interceptor
import api from '../api/axios'

// Login component
const Login = () => {

  // State to store username and password input values
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  // Hook for page navigation
  const navigate = useNavigate()

  // Function runs when login form is submitted
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent page reload on submit

    try {
      // Send login request to backend
      const res = await api.post('/api/auth/login', formData)

      // Save JWT access token returned from backend
      localStorage.setItem('token', res.data.access_token)

      // Redirect user to dashboard after successful login
      navigate('/dashboard')

    } catch (err) {
      // Show error message if login fails
      alert("Invalid credentials")
    }
  }

  // JSX UI
  return (
    <div style={{ padding: '20px' }}>
      <h2>Login</h2>

      {/* Form submission handled by handleLogin */}
      <form onSubmit={handleLogin}>

        {/* Username input field */}
        <input
          type="text"
          placeholder="Username"
          required
          onChange={e =>
            setFormData({ ...formData, username: e.target.value })
          }
        /><br/>

        {/* Password input field */}
        <input
          type="password"
          placeholder="Password"
          required
          onChange={e =>
            setFormData({ ...formData, password: e.target.value })
          }
        /><br/>

        {/* Submit button */}
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

// Export Login component
export default Login
