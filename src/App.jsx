import React, { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { UserProvider, useUser } from './contexts/UserContext'
import LandingPage from './components/pages/LandingPage'
import JobsBoard from './components/jobs/JobsBoard'
import CandidateJobsBoard from './components/jobs/CandidateJobsBoard'
import JobDetail from './components/jobs/JobDetail'
import CandidatesBoard from './components/candidates/CandidatesBoard'
import CandidateDetail from './components/candidates/CandidateDetail'
import AssessmentsHome from './components/assessments/AssessmentsHome'
import CandidatePortal from './components/candidate/CandidatePortal'
import AssessmentRuntime from './components/assessments/AssessmentRuntime'
import SideNav from './components/ui/SideNav'
import RoleSwitcher from './components/ui/RoleSwitcher'
import './utils/autoArchiveService.jsx' // Import to start the service
import './App.css'

function AppContent() {
  const location = useLocation()
  const { user, loading } = useUser()
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false)

  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/' || location.pathname === '/landing'

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        🔄 Loading...
      </div>
    )
  }

  // If on landing page, render it without the app shell
  if (isLandingPage) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    )
  }

  const isCandidate = user?.role === 'candidate'

  return (
    <div className="app-shell">
      <SideNav userRole={user?.role} />
      <button 
        onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1001,
          padding: '10px 15px',
          borderRadius: '5px',
          border: 'none',
          background: '#007bff',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        Toggle Role Switcher
      </button>
      {showRoleSwitcher && <RoleSwitcher />}
      
      <main className="main-content">
        <Routes>
          {/* Jobs routes - different components based on role */}
          <Route 
            path="/jobs" 
            element={isCandidate ? <CandidateJobsBoard /> : <JobsBoard />} 
          />
          <Route 
            path="/jobs/applied" 
            element={isCandidate ? <CandidatePortal /> : <JobsBoard />} 
          />
          <Route path="/jobs/:jobId" element={<JobDetail />} />
          <Route path="/assessment/:jobId" element={<AssessmentRuntime />} />
          
          {/* Admin-only routes */}
          {!isCandidate && (
            <>
              <Route path="/candidates" element={<CandidatesBoard />} />
              <Route path="/candidates/:candidateId" element={<CandidateDetail />} />
              <Route path="/assessments/*" element={<AssessmentsHome />} />
            </>
          )}
          
          {/* Redirect candidates trying to access admin routes */}
          {isCandidate && (
            <>
              <Route path="/candidates/*" element={<div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Access Denied</h2>
                <p>This section is only available to administrators.</p>
              </div>} />
              <Route path="/assessments/*" element={<div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Access Denied</h2>
                <p>This section is only available to administrators.</p>
              </div>} />
            </>
          )}
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  )
}
