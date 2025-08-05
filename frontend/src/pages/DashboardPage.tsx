import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/DashboardPage.css'

interface User {
  id: string
  email: string
  role: string
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      // Redirect to login if not authenticated
      navigate('/login')
      return
    }
    
    try {
      const userData = JSON.parse(userStr)
      setUser(userData)
    } catch (error) {
      console.error('Error parsing user data:', error)
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome to Your Dashboard</h1>
        <div className="user-info">
          <span>{user?.email}</span>
          <span className="user-role">{user?.role}</span>
          <button 
            className="logout-button"
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              navigate('/')
            }}
          >
            Log Out
          </button>
        </div>
      </header>
      
      <div className="dashboard-content">
        <div className="dashboard-welcome">
          <h2>Welcome to the Fashion Designer Platform!</h2>
          <p>Your account has been successfully created. You are now logged in as a <strong>{user?.role}</strong>.</p>
        </div>
        
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Getting Started</h3>
            <p>Complete your profile to get the most out of our platform.</p>
            <button className="card-button">Complete Profile</button>
          </div>
          
          <div className="dashboard-card">
            <h3>Explore Collections</h3>
            <p>Browse the latest fashion collections from our designers.</p>
            <button className="card-button">View Collections</button>
          </div>
          
          <div className="dashboard-card">
            <h3>Connect</h3>
            <p>Find and connect with designers, buyers, and customers.</p>
            <button className="card-button">Find Connections</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage