import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from '../common/Pagination'
import CreateCandidateModal from './CreateCandidateModal' // Import the new modal
import './CandidatesBoard.css'

export default function CandidatesBoard() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [total, setTotal] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false) // State for modal visibility

  const stages = ['applied', 'screening', 'interview', 'technical', 'final', 'offer', 'hired', 'rejected']

  const loadCandidates = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: itemsPerPage.toString(),
        ...(search && { search }),
        ...(stageFilter && { stage: stageFilter })
      })
      
      const response = await fetch(`/api/candidates?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load candidates')
      }
      
      // Enrich candidates with job information
      const candidatesWithJobs = await Promise.all(
        (data.items || []).map(async (candidate) => {
          try {
            const jobResponse = await fetch(`/api/jobs/${candidate.jobId}`)
            if (jobResponse.ok) {
              const job = await jobResponse.json()
              return { ...candidate, jobTitle: job.title, jobDepartment: job.department }
            }
          } catch (err) {
            console.warn(`Failed to load job ${candidate.jobId}:`, err)
          }
          return { ...candidate, jobTitle: `Job #${candidate.jobId}`, jobDepartment: 'Unknown' }
        })
      )
      
      setCandidates(candidatesWithJobs)
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.message)
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCandidates()
  }, [search, stageFilter, page, itemsPerPage])

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setPage(1) // Reset to first page when page size changes
  }

  const handleRetry = () => {
    loadCandidates()
  }

  const handleAddCandidate = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const handleCandidateCreated = (newCandidate) => {
    loadCandidates() // Refresh the list of candidates
    handleCloseModal()
    // Optionally show a success notification
    console.log('Candidate created:', newCandidate)
  }

  const stageColors = {
    applied: '#17a2b8',
    screening: '#ffc107',
    interview: '#fd7e14',
    technical: '#6f42c1',
    final: '#e83e8c',
    offer: '#20c997',
    hired: '#28a745',
    rejected: '#dc3545'
  };

  if (error) {
    return (
      <div>
        <h2>Candidates</h2>
        <div className="card" style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>
          <p>❌ Error loading candidates: {error}</p>
          <button onClick={handleRetry} style={{ marginTop: '1rem' }}>
            🔄 Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Candidates ({total})</h2>
        <button 
          onClick={handleAddCandidate} // Make the button open the modal
          style={{ 
            background: '#007bff', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          + Add Candidate
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">All Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div>🔄 Loading candidates...</div>
          </div>
        ) : candidates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>No candidates found</p>
            {(search || stageFilter) && (
              <button onClick={() => { setSearch(''); setStageFilter('') }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="candidates-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job Applied For</th>
                  <th>Skills</th>
                  <th>Stage</th>
                  <th>Score</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/candidates/${c.id}`} className="candidate-name">{c.name}</Link>
                      <div>{c.email}</div>
                      <div>{c.experience}y exp</div>
                    </td>
                    <td>
                      <div>{c.jobTitle || `Job #${c.jobId}`}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{c.jobDepartment || 'Unknown Dept'}</div>
                    </td>
                    <td>
                      {c.skills && c.skills.length > 0 ? (
                        c.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="skill-tag">{skill}</span>
                        ))
                      ) : 'N/A'}
                      {c.skills && c.skills.length > 3 && (
                        <span className="skill-tag-more">+{c.skills.length - 3} more</span>
                      )}
                    </td>
                    <td>
                      <span style={{ backgroundColor: stageColors[c.stage] || '#6c757d' }} className="stage-pill">
                        {c.stage.toUpperCase()}
                      </span>
                    </td>
                    <td>{c.assessmentScore}%</td>
                    <td>{c.appliedAt ? new Date(c.appliedAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(total / itemsPerPage)}
              totalItems={total}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPageOptions={[25, 50, 100, 200]}
            />
          </>
        )}
      </div>

      <CreateCandidateModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onCreated={handleCandidateCreated}
      />
    </div>
  )
}
