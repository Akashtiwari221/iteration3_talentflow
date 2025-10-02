import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './SideNav.css'

const SideNav = ({ userRole = 'admin' }) => {
  const location = useLocation()
  const [activeItem, setActiveItem] = useState('')

  useEffect(() => {
    const path = location.pathname
    if (path.startsWith('/jobs')) {
      if (path.includes('/applied')) {
        setActiveItem('applied-jobs')
      } else {
        setActiveItem('all-jobs')
      }
    } else if (path.startsWith('/candidates')) {
      setActiveItem('candidates')
    } else if (path.startsWith('/assessments')) {
      setActiveItem('assessments')
    } /* else if (path.startsWith('/ai-interviewer-setup')) {
      setActiveItem('ai-interviewer')
    } */
  }, [location])

  const adminNavItems = [
    {
      id: 'all-jobs',
      href: '/jobs',
      label: 'All Jobs',
      icon: '💼',
      ariaLabel: 'All jobs section'
    },
    {
      id: 'candidates',
      href: '/candidates',
      label: 'Candidates',
      icon: '👥',
      ariaLabel: 'Candidates section'
    },
    {
      id: 'assessments',
      href: '/assessments',
      label: 'Assessments',
      icon: '📝',
      ariaLabel: 'Assessments section'
    },
    // {
    //   id: 'ai-interviewer',
    //   href: '/ai-interviewer-setup',
    //   label: 'AI Interviewer',
    //   icon: '🤖',
    //   ariaLabel: 'AI Interviewer Setup'
    // }
  ]

  const candidateNavItems = [
    {
      id: 'all-jobs',
      href: '/jobs',
      label: 'All Jobs',
      icon: '💼',
      ariaLabel: 'All available jobs'
    },
    {
      id: 'applied-jobs',
      href: '/jobs/applied',
      label: 'Applied Jobs',
      icon: '📋',
      ariaLabel: 'Jobs you have applied to'
    }
  ]

  const navItems = userRole === 'candidate' ? candidateNavItems : adminNavItems

  return (
    <nav className="side-nav" aria-label="Main navigation">
      <div className="side-nav-header">
        <div className="side-nav-logo">
          <h2>TalentFlow</h2>
          <span className="side-nav-subtitle">HR Mini</span>
        </div>
        <div className="user-role-badge">
          {userRole === 'candidate' ? '👤 Candidate' : '⚙️ Admin'}
        </div>
      </div>
      
      <div className="side-nav-content">
        <ul className="side-nav-list">
          {navItems.map((item) => (
            <li key={item.id} className="side-nav-item">
              <Link
                to={item.href}
                className={`side-nav-link ${activeItem === item.id ? 'active' : ''}`}
                aria-label={item.ariaLabel}
              >
                <span className="side-nav-icon">{item.icon}</span>
                <span className="side-nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default SideNav
