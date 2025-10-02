import React from 'react'
import { useUser } from '../../contexts/UserContext'

const RoleSwitcher = () => {
  const { user, switchRole } = useUser()

  if (!user) return null

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 1001,
      minWidth: '200px'
    }}>
      <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
        Demo Role Switcher
      </div>
      <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: '#666' }}>
        Current: {user.role === 'admin' ? '⚙️ Admin' : '👤 Candidate'}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => switchRole('admin')}
          style={{
            background: user.role === 'admin' ? '#007bff' : '#f8f9fa',
            color: user.role === 'admin' ? 'white' : '#333',
            border: '1px solid #ddd',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            flex: 1
          }}
        >
          Admin
        </button>
        <button
          onClick={() => switchRole('candidate')}
          style={{
            background: user.role === 'candidate' ? '#007bff' : '#f8f9fa',
            color: user.role === 'candidate' ? 'white' : '#333',
            border: '1px solid #ddd',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            flex: 1
          }}
        >
          Candidate
        </button>
      </div>
    </div>
  )
}

export default RoleSwitcher