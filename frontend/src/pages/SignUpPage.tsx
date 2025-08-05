import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiService } from '../services/api'
import '../styles/SignUpPage.css'

const SignUpPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)

  const validateForm = async () => {
    const newErrors: Record<string, string> = {}
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    } else {
      try {
        const response = await apiService.validateEmail(formData.email)
        if (!response.available) {
          newErrors.email = 'Email is already registered'
        }
      } catch (error) {
        console.error('Email validation error:', error)
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter'
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter'
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number'
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
    
    const isValid = await validateForm()
    if (!isValid) return
    
    setIsLoading(true)
    
    try {
      const response = await apiService.signUp({
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        role: formData.role as 'designer' | 'buyer' | 'customer'
      })
      
      // Store token and user info in localStorage
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      // Redirect to dashboard
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Signup error:', error)
      if (error.response?.data?.detail) {
        setErrors(prev => ({ ...prev, form: error.response.data.detail }))
      } else {
        setErrors(prev => ({ ...prev, form: 'An error occurred during sign up. Please try again.' }))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <div className="signup-container">
      <div className="signup-form-container">
        <h1>Create Your Account</h1>
        <p className="signup-subtitle">Join our fashion platform to connect with designers and buyers worldwide</p>
        
        {errors.form && <div className="error-message form-error">{errors.form}</div>}
        
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email && formSubmitted ? 'error' : ''}
              placeholder="your.email@example.com"
              disabled={isLoading}
            />
            {errors.email && formSubmitted && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password && formSubmitted ? 'error' : ''}
                placeholder="Create a strong password"
                disabled={isLoading}
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && formSubmitted && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword && formSubmitted ? 'error' : ''}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && formSubmitted && <div className="error-message">{errors.confirmPassword}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="role">I am a</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={errors.role && formSubmitted ? 'error' : ''}
              disabled={isLoading}
            >
              <option value="designer">Designer</option>
              <option value="buyer">Buyer</option>
              <option value="customer">Customer</option>
            </select>
            {errors.role && formSubmitted && <div className="error-message">{errors.role}</div>}
          </div>
          
          <button 
            type="submit" 
            className={`signup-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
      
      <div className="signup-image-container">
        <div className="signup-overlay">
          <h2>Join Our Fashion Community</h2>
          <p>Connect with designers, buyers, and fashion enthusiasts from around the world</p>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage