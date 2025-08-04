import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import './App.css'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<div>Sign Up Page (Coming Soon)</div>} />
        <Route path="/login" element={<div>Login Page (Coming Soon)</div>} />
      </Routes>
    </div>
  )
}

export default App