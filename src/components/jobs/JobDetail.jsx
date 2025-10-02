import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LiveTimer from './LiveTimer'

export default function JobDetail() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    
    fetch(`/api/jobs?page=1&pageSize=100`)
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return
        const found = Array.isArray(d.items) 
          ? d.items.find((it) => String(it.id) === String(jobId)) 
          : null
        setJob(found)
        if (!found) {
          setError('Job not found')
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message)
          setJob(null)
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => { mounted = false }
  }, [jobId])

  const formatSalary = (min, max, type) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
    
    if (type === 'hourly') {
      return `${formatter.format(min)}-${formatter.format(max)}/hour`
    }
    return `${formatter.format(min)}-${formatter.format(max)}/year`
  }

  const handleStatusToggle = async () => {
    if (!job) return
    
    const newStatus = job.status === 'active' ? 'archived' : 'active'
    
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        const updatedJob = await response.json()
        setJob(updatedJob)
      }
    } catch (error) {
      console.error('Failed to update job status:', error)
    }
  }

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        🔄 Loading job details...
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#dc3545' }}>❌ {error || 'Job not found'}</p>
        <button 
          onClick={() => navigate('/jobs')}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          ← Back to Jobs
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
          <div>
            <button 
              onClick={() => navigate('/jobs')}
              style={{
                background: 'none',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                marginBottom: '1rem',
                color: '#666'
              }}
            >
              ← Back to Jobs
            </button>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>
              {job.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ 
                background: job.status === 'active' ? '#28a745' : '#6c757d',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                {job.status.toUpperCase()}
              </span>
              <span style={{ color: '#666' }}>{job.department}</span>
              <span style={{ color: '#666' }}>📍 {job.location}</span>
              <span style={{ color: '#666' }}>💼 {job.workType}</span>
            </div>
          </div>
          
          <button
            onClick={handleStatusToggle}
            style={{
              background: job.status === 'active' ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            {job.status === 'active' ? '📦 Archive Job' : '🚀 Activate Job'}
          </button>
        </div>

        {/* Auto-Archive Timer */}
        {job.autoArchiveDate && job.status === 'active' && (
          <div style={{ 
            background: '#fff3cd', 
            border: '1px solid #ffeaa7',
            borderRadius: '8px', 
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '1rem', color: '#856404', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              🕒 Auto-Archive Timer
            </div>
            <LiveTimer 
              targetDate={job.autoArchiveDate}
              compact={false}
            />
          </div>
        )}

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {job.tags.map((tag, idx) => (
              <span key={idx} style={{
                background: '#e9ecef',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                color: '#495057'
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Salary & Experience */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className="card">
          <h3 style={{ margin: '0 0 1rem 0', color: '#28a745' }}>💰 Compensation</h3>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>
            {job.salaryType === 'yearly' ? 'Annual Salary' : 'Hourly Rate'}
          </div>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 1rem 0', color: '#007bff' }}>🎯 Experience</h3>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {job.experienceLevel}
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>
            {job.experienceYears} required
          </div>
        </div>
      </div>

      {/* Job Description */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>📋 Job Description</h3>
        <p style={{ lineHeight: '1.6', color: '#333', margin: 0 }}>
          {job.description}
        </p>
      </div>

      {/* Responsibilities */}
      {job.responsibilities && job.responsibilities.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>🎯 Key Responsibilities</h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            {job.responsibilities.map((responsibility, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>
                {responsibility}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>✅ Requirements</h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            {job.requirements.map((requirement, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>
                {requirement}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {job.benefits && job.benefits.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>🎁 Benefits & Perks</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {job.benefits.map((benefit, idx) => (
              <span key={idx} style={{
                background: '#d4edda',
                color: '#155724',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                border: '1px solid #c3e6cb'
              }}>
                ✓ {benefit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Job Meta Info */}
      <div className="card">
        <h3 style={{ margin: '0 0 1rem 0' }}>📊 Job Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <strong>Created:</strong> {new Date(job.createdAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Updated:</strong> {new Date(job.updatedAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Job ID:</strong> #{job.id}
          </div>
          <div>
            <strong>Slug:</strong> {job.slug}
          </div>
        </div>
      </div>
    </div>
  )
}