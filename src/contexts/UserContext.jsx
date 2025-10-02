import React, { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading user data
    // In a real app, this would fetch from an API or localStorage
    const loadUser = () => {
      const savedUser = localStorage.getItem('talentflow_user')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      } else {
        // Default to admin for now - in real app this would be determined by auth
        setUser({
          id: 1,
          name: 'Admin User',
          email: 'admin@talentflow.com',
          role: 'admin', // 'admin' or 'candidate'
          experience: 5,
          skills: ['Management', 'Strategy', 'Leadership'],
          phone: '+1-555-0123'
        })
      }
      setLoading(false)
    }

    loadUser()
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('talentflow_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('talentflow_user')
  }

  const switchRole = (role) => {
    if (user) {
      let updatedUser
      if (role === 'candidate') {
        updatedUser = {
          id: 1001, // Different ID for candidate
          name: 'John Candidate',
          email: 'john.candidate@example.com',
          role: 'candidate',
          experience: 3,
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          phone: '+1-555-0456'
        }
      } else {
        updatedUser = {
          id: 1,
          name: 'Admin User',
          email: 'admin@talentflow.com',
          role: 'admin',
          experience: 5,
          skills: ['Management', 'Strategy', 'Leadership'],
          phone: '+1-555-0123'
        }
      }
      setUser(updatedUser)
      localStorage.setItem('talentflow_user', JSON.stringify(updatedUser))
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    switchRole,
    isAdmin: user?.role === 'admin',
    isCandidate: user?.role === 'candidate'
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}