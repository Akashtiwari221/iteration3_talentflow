import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Notification from '../common/Notification'
import Pagination from '../common/Pagination'
import { useUser } from '../../contexts/UserContext'
import ApplyJobModal from './ApplyJobModal'

export default function CandidateJobsBoard() {
  const location = useLocation()
  const { user } = useUser()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [notification, setNotification] = useState(null)
  const [appliedJobs, setAppliedJobs] = useState(new Set())
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)

  const isAppliedJobsView = location.pathname.includes('/applied')

  const loadJobs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: itemsPerPage.toString(),
        status: 'active', // Candidates only see active jobs
        ...(search && { search }),
        ...(isAppliedJobsView && { candidateId: user?.id })
      })
      
      const response = await fetch(`/api/jobs?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load jobs')
      }
      
      setJobs(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.message)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const loadAppliedJobs = async () => {
    if (!user?.id) return
    
    try {
      const response = await fetch(`/api/applications?candidateId=${user.id}`)
      const data = await response.json()
      
      if (response.ok) {
        const appliedJobIds = new Set(data.items?.map(app => app.jobId) || [])
        setAppliedJobs(appliedJobIds)
      }
    } catch (err) {
      console.error('Failed to load applied jobs:', err)
    }
  }

  useEffect(() => {
    loadJobs()
    loadAppliedJobs()
  }, [page, itemsPerPage, search, isAppliedJobsView, user?.id])

  const handleOpenApplyModal = (job) => {
    if (!user?.id) {
      setNotification({
        message: 'Please log in to apply for jobs',
        type: 'error',
      });
      return;
    }
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  const handleCloseApplyModal = () => {
    setIsApplyModalOpen(false);
    setSelectedJob(null);
  };

  const handleApplyToJob = async (jobId, applicationData) => {
    try {
      // First create the application
      const applicationResponse = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          jobId,
          candidateId: user.id,
          status: 'applied',
          appliedAt: new Date().toISOString(),
        }),
      });

      if (!applicationResponse.ok) {
        const errorData = await applicationResponse.json();
        throw new Error(errorData.error || 'Failed to apply for job');
      }

      // Then create/update the candidate record for HR dashboard
      const candidateResponse = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: applicationData.name,
          email: applicationData.email,
          phone: applicationData.phone,
          stage: 'applied',
          jobId: jobId,
          experience: user.experience || Math.floor(Math.random() * 10) + 1,
          skills: user.skills || ['JavaScript', 'React'],
          appliedAt: new Date().toISOString(),
          notes: `Applied through candidate portal`,
          resume: applicationData.resume?.name, // Add resume info
        }),
      });

      if (!candidateResponse.ok) {
        console.warn('Failed to create candidate record, but application was successful');
      }

      setAppliedJobs((prev) => new Set([...prev, jobId]));
      setNotification({
        message: 'Successfully applied for the job!',
        type: 'success',
      });
    } catch (error) {
      setNotification({
        message: `Failed to apply: ${error.message}`,
        type: 'error',
      });
      // Re-throw the error to be caught in the modal
      throw error;
    }
  };

  const handleRetry = () => {
    loadJobs()
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setPage(1)
  }

  const renderJobCard = (job) => (
    <div key={job.id} style={{ 
      border: '1px solid #eee', 
      borderRadius: '8px', 
      padding: '1.5rem',
      background: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>
            <Link 
              to={`/jobs/${job.id}`} 
              style={{ 
                textDecoration: 'none', 
                color: '#007bff'
              }}
            >
              {job.title}
            </Link>
          </h3>
          
          {job.description && (
            <p style={{ 
              margin: '0 0 1rem 0', 
              color: '#666', 
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              {job.description.length > 150 
                ? `${job.description.substring(0, 150)}...` 
                : job.description
              }
            </p>
          )}
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1rem', 
            marginBottom: '1rem',
            color: '#666', 
            fontSize: '0.9rem' 
          }}>
            <span>🏢 {job.department}</span>
            <span>📍 {job.location}</span>
            <span>⭐ {job.experienceLevel}</span>
          </div>

          {job.salaryMin && job.salaryMax && (
            <div style={{ 
              color: '#28a745', 
              fontSize: '1rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem' 
            }}>
              💰 ${job.salaryMin.toLocaleString()}-${job.salaryMax.toLocaleString()}
              {job.salaryType === 'hourly' ? '/hr' : '/yr'}
            </div>
          )}
          
          {job.tags && job.tags.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              {job.tags.slice(0, 5).map((tag, idx) => (
                <span key={idx} style={{
                  background: '#e9ecef',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  marginRight: '0.5rem',
                  marginBottom: '0.25rem',
                  display: 'inline-block'
                }}>
                  {tag}
                </span>
              ))}
              {job.tags.length > 5 && (
                <span style={{ fontSize: '0.8rem', color: '#666' }}>
                  +{job.tags.length - 5} more
                </span>
              )}
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: '1rem'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#999' }}>
              Posted: {job.createdAt && new Date(job.createdAt).toLocaleDateString()}
            </div>
            
            {appliedJobs.has(job.id) ? (
              <div style={{
                background: '#28a745',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ✓ Applied
              </div>
            ) : (
              <button
                onClick={() => handleOpenApplyModal(job)}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => e.target.style.background = '#0056b3'}
                onMouseOut={(e) => e.target.style.background = '#007bff'}
              >
                📝 Apply Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (error) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{isAppliedJobsView ? 'Applied Jobs' : 'All Jobs'}</h2>
        </div>
        <div className="card" style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>
          <p>❌ Error loading jobs: {error}</p>
          <button onClick={handleRetry} style={{ marginTop: '1rem' }}>
            🔄 Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>
          {isAppliedJobsView ? `Applied Jobs (${total})` : `All Jobs (${total})`}
        </h2>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ 
            width: '100%',
            padding: '12px', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Jobs List */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.2rem' }}>🔄 Loading jobs...</div>
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {isAppliedJobsView ? '📋' : '💼'}
            </div>
            <h3>
              {isAppliedJobsView ? 'No applied jobs yet' : 'No jobs found'}
            </h3>
            <p>
              {isAppliedJobsView 
                ? 'Start applying to jobs to see them here!' 
                : search 
                  ? 'Try adjusting your search terms'
                  : 'Check back later for new opportunities'
              }
            </p>
            {search && (
              <button 
                onClick={() => setSearch('')}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {jobs.map(renderJobCard)}
            </div>
            
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(total / itemsPerPage)}
              totalItems={total}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </div>

      {/* Notifications */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {selectedJob && (
        <ApplyJobModal
          job={selectedJob}
          isOpen={isApplyModalOpen}
          onClose={handleCloseApplyModal}
          onApplied={handleApplyToJob}
        />
      )}
    </div>
  )
}
