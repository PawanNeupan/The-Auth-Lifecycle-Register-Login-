// Import React and useState hook for managing form state
import React, { useState } from 'react'

// useNavigate is used to redirect users after successful registration
import { useNavigate } from 'react-router-dom'

// Axios instance for making API requests
import api from '../api/axios'

// Register component
const Register = () => {

  // State to store form input values (email, username, password)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  })

  // Hook to navigate between routes (pages)
  const navigate = useNavigate()

  // Function runs when the form is submitted
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent page refresh on form submit

    try {
      // Send POST request to backend register API
      await api.post('/api/auth/register', formData)

      // Show success message
      alert("Account created! Please login.")

      // Redirect user to login page
      navigate('/login')

    } catch (err: any) {
      // Show backend error message if registration fails
      alert(err.response?.data?.message || "Registration Failed")
    }
  }

  // JSX UI
  return (
    <div style={{ padding: '20px' }}>
      <h2>Register</h2>

      {/* Form submission handled by handleSubmit */}
      <form onSubmit={handleSubmit}>

        {/* Email input */}
        <input
          type="email"
          placeholder="Email"
          required
          onChange={e =>
            setFormData({ ...formData, email: e.target.value })
          }
        /><br/>

        {/* Username input */}
        <input
          type="text"
          placeholder="Username"
          required
          onChange={e =>
            setFormData({ ...formData, username: e.target.value })
          }
        /><br/>

        {/* Password input */}
        <input
          type="password"
          placeholder="Password"
          required
          onChange={e =>
            setFormData({ ...formData, password: e.target.value })
          }
        /><br/>

        {/* Submit button */}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  )
}

// Export component so it can be used in routes
export default Register
