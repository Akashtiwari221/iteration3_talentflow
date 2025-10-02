import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import CreateEditJobModal from './CreateEditJobModal'
import LiveTimer from './LiveTimer'
import Notification from '../common/Notification'
import Pagination from '../common/Pagination'

export default function JobsBoard() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' or 'list'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [notification, setNotification] = useState(null)

  const loadJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // For Kanban view, load all jobs. For list view, use pagination
      const pageSize = viewMode === 'kanban' ? 1000 : itemsPerPage
      const currentPage = viewMode === 'kanban' ? 1 : page
      
      const effectiveSortBy = viewMode === 'kanban' ? 'order' : sortBy
      const effectiveSortOrder = viewMode === 'kanban' ? 'asc' : sortOrder

      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(effectiveSortBy && { sortBy: effectiveSortBy }),
        ...(effectiveSortOrder && { sortOrder: effectiveSortOrder })
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
  }, [page, itemsPerPage, search, statusFilter, sortBy, sortOrder, viewMode])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  // Listen for auto-archive events
  useEffect(() => {
    const handleAutoArchive = (event) => {
      const { archivedJobs } = event.detail
      console.log('🔄 Jobs auto-archived, refreshing list...')
      
      setNotification({
        message: `${archivedJobs.length} job${archivedJobs.length !== 1 ? 's' : ''} automatically archived due to timer expiration`,
        type: 'warning'
      })
      
      loadJobs()
    }

    window.addEventListener('jobsAutoArchived', handleAutoArchive)
    
    return () => {
      window.removeEventListener('jobsAutoArchived', handleAutoArchive)
    }
  }, [])

  const handleRetry = () => {
    loadJobs()
  }

  const handleCreateJob = () => {
    setEditingJob(null)
    setShowCreateModal(true)
  }

  const handleEditJob = (job) => {
    setEditingJob(job)
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingJob(null)
  }

  const handleJobSaved = (savedJob) => {
    // Refresh the jobs list
    loadJobs()
    handleCloseModal()
    
    setNotification({
      message: `Job "${savedJob.title}" ${editingJob ? 'updated' : 'created'} successfully!`,
      type: 'success'
    })
  }

  const handleJobExpired = async (jobId) => {
    try {
      // Auto-archive the expired job
      await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ 
          status: 'archived',
          autoArchiveDate: null // Clear the auto-archive date
        })
      })
      
      // Refresh the jobs list
      loadJobs()
    } catch (error) {
      console.error('Failed to auto-archive job:', error)
    }
  }

  const handleDragEnd = async (result) => {
    console.log('🎯 Drag ended:', result)
    
    if (!result.destination) {
      console.log('❌ No destination, drag cancelled')
      return
    }

    const { source, destination, draggableId } = result
    
    // If dropped in the same position, do nothing
    if (source.index === destination.index && source.droppableId === destination.droppableId) {
      console.log('❌ Same position, no change needed')
      return
    }

    console.log('📋 Drag details:', {
      from: source.droppableId,
      to: destination.droppableId,
      draggableId,
      sourceIndex: source.index,
      destIndex: destination.index
    })

    // Extract job ID from draggableId (format: "active-123" or "archived-123")
    const jobIdMatch = draggableId.match(/^(active|archived)-(\d+)$/)
    if (!jobIdMatch) {
      console.error('❌ Invalid draggableId format:', draggableId)
      setNotification({
        message: 'Invalid drag operation',
        type: 'error'
      })
      return
    }
    
    const jobId = parseInt(jobIdMatch[2])
    const job = jobs.find(j => j.id === jobId)
    
    if (!job) {
      console.error('❌ Job not found:', jobId)
      setNotification({
        message: 'Job not found',
        type: 'error'
      })
      return
    }

    console.log('📄 Found job:', job.title)

    // Handle status change (between columns)
    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId
      console.log(`🔄 Changing status from ${job.status} to ${newStatus}`)
      
      try {
        const response = await fetch(`/api/jobs/${jobId}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })
        
        console.log('📡 API response status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update job status')
        }
        
        const updatedJob = await response.json()
        console.log('✅ Job updated:', updatedJob)
        
        setNotification({
          message: `"${job.title}" moved to ${newStatus}`,
          type: 'success'
        })
        
        // Reload jobs to get updated data
        loadJobs()
      } catch (error) {
        console.error('❌ Failed to update job:', error)
        setNotification({
          message: `Failed to update job status: ${error.message}`,
          type: 'error'
        })
      }
    } else {
      // Handle reordering within the same column (by order index)
      try {
        const allSorted = jobs.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        const sourceItemIndex = allSorted.findIndex((it) => it.id === job.id)
        const fromOrder = sourceItemIndex === -1 ? (job.order ?? 0) : sourceItemIndex

        // Remove the dragged item to compute destination index correctly
        const withoutSource = allSorted.filter((it) => it.id !== job.id)
        const columnStatus = source.droppableId
        const columnIndices = withoutSource
          .map((it, idx) => ({ it, idx }))
          .filter(({ it }) => it.status === columnStatus)
          .map(({ idx }) => idx)

        // Map destination (column-based) index to global order index
        let toOrder
        if (destination.index >= columnIndices.length) {
          // Insert after the last item of the column (at the end)
          toOrder = columnIndices.length > 0 ? columnIndices[columnIndices.length - 1] + 1 : withoutSource.length
        } else {
          toOrder = columnIndices[destination.index]
        }

        const res = await fetch(`/api/jobs/${jobId}/reorder`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ fromOrder, toOrder })
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'Failed to reorder')
        }

        setNotification({
          message: `Reordered "${job.title}"`,
          type: 'success'
        })
        loadJobs()
      } catch (e) {
        console.error('❌ Reorder failed:', e)
        setNotification({
          message: `Failed to reorder: ${e.message}`,
          type: 'error'
        })
      }
    }
  }

  const handleStatusToggle = async (job) => {
    const newStatus = job.status === 'active' ? 'archived' : 'active'
    
    try {
      await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      setNotification({
        message: `Job "${job.title}" ${newStatus === 'active' ? 'activated' : 'archived'}`,
        type: 'success'
      })
      
      loadJobs()
    } catch (error) {
      setNotification({
        message: `Failed to update job status: ${error.message}`,
        type: 'error'
      })
    }
  }

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPage(1) // Reset to first page when sorting changes
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setPage(1) // Reset to first page when page size changes
  }

  if (error) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Jobs</h2>
          <Link to="/jobs/create">+ New Job</Link>
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

  const renderJobCard = (job, index, isDragging = false, dragHandleProps) => (
    <div 
      style={{ 
        border: '1px solid #eee', 
        borderRadius: '8px', 
        padding: '1rem',
        background: isDragging ? '#f0f8ff' : (job.status === 'active' ? '#f8fff8' : '#fff8f8'),
        boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
        transform: isDragging ? 'rotate(2deg)' : 'none',
        cursor: viewMode === 'kanban' ? 'grab' : 'default',
        userSelect: 'none',
        position: 'relative'
      }}
      {...dragHandleProps}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', flex: 1 }}>
              <Link 
                to={`/jobs/${job.id}`} 
                style={{ 
                  textDecoration: 'none', 
                  color: '#007bff',
                  cursor: 'pointer'
                }}
              >
                {job.title}
              </Link>
            </h3>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditJob(job)
                }}
                style={{
                  background: 'none',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  color: '#666'
                }}
                title="Edit job"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleStatusToggle(job)
                }}
                style={{
                  background: 'none',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  color: job.status === 'active' ? '#dc3545' : '#28a745'
                }}
                title={job.status === 'active' ? 'Archive job' : 'Activate job'}
              >
                {job.status === 'active' ? '📦' : '🚀'}
              </button>
            </div>
          </div>
          
          {job.description && (
            <p style={{ 
              margin: '0 0 0.5rem 0', 
              color: '#666', 
              fontSize: '0.85rem',
              lineHeight: '1.4'
            }}>
              {job.description.length > 100 
                ? `${job.description.substring(0, 100)}...` 
                : job.description
              }
            </p>
          )}
          
          <div style={{ color: '#666', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            {job.department} • {job.location} • {job.experienceLevel}
          </div>

          {job.salaryMin && job.salaryMax && (
            <div style={{ color: '#28a745', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              ${job.salaryMin.toLocaleString()}-${job.salaryMax.toLocaleString()}
              {job.salaryType === 'hourly' ? '/hr' : '/yr'}
            </div>
          )}

          {/* Auto-Archive Timer */}
          {job.autoArchiveDate && job.status === 'active' && (
            <div style={{ 
              background: '#fff3cd', 
              border: '1px solid #ffeaa7',
              borderRadius: '4px', 
              padding: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{ fontSize: '0.7rem', color: '#856404', marginBottom: '0.25rem' }}>
                🕒 Auto-archive in:
              </div>
              <LiveTimer 
                targetDate={job.autoArchiveDate}
                onExpired={() => handleJobExpired(job.id)}
                compact={true}
              />
            </div>
          )}
          
          {job.tags && job.tags.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              {job.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} style={{
                  background: '#e9ecef',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  marginRight: '0.25rem'
                }}>
                  {tag}
                </span>
              ))}
              {job.tags.length > 3 && (
                <span style={{ fontSize: '0.7rem', color: '#666' }}>
                  +{job.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
        
        <div style={{ 
          fontSize: '0.7rem', 
          color: '#999',
          textAlign: 'right',
          minWidth: '80px'
        }}>
          <div>
            {job.createdAt && new Date(job.createdAt).toLocaleDateString()}
          </div>
          {job.autoArchiveHours && (
            <div style={{ marginTop: '0.25rem' }}>
              Auto: {job.autoArchiveHours}h
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderKanbanView = () => {
    // Always ensure we have arrays, even if empty
    const activeJobs = jobs.filter(job => job.status === 'active') || []
    const archivedJobs = jobs.filter(job => job.status === 'archived') || []

    if (loading) {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', minHeight: '600px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            🔄 Loading active jobs...
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            🔄 Loading archived jobs...
          </div>
        </div>
      )
    }

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', minHeight: '600px' }}>
          {/* Active Jobs Column */}
          <Droppable droppableId="active" key="active-droppable">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  background: snapshot.isDraggingOver ? '#e8f5e8' : '#f8fff8',
                  borderRadius: '8px',
                  padding: '1rem',
                  border: '2px dashed #28a745',
                  minHeight: '500px'
                }}
              >
                <h3 style={{ 
                  margin: '0 0 1rem 0', 
                  color: '#28a745',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🚀 Active Jobs ({activeJobs.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeJobs.map((job, index) => (
                    <Draggable 
                      key={job.id.toString()} 
                      draggableId={`${job.status}-${job.id.toString()}`} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1
                          }}
                        >
                          {renderJobCard(job, index, snapshot.isDragging, provided.dragHandleProps)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {activeJobs.length === 0 && (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#666', 
                      padding: '2rem',
                      border: '2px dashed #ddd',
                      borderRadius: '8px'
                    }}>
                      No active jobs
                    </div>
                  )}
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Archived Jobs Column */}
          <Droppable droppableId="archived" key="archived-droppable">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  background: snapshot.isDraggingOver ? '#f8e8e8' : '#fff8f8',
                  borderRadius: '8px',
                  padding: '1rem',
                  border: '2px dashed #6c757d',
                  minHeight: '500px'
                }}
              >
                <h3 style={{ 
                  margin: '0 0 1rem 0', 
                  color: '#6c757d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📦 Archived Jobs ({archivedJobs.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {archivedJobs.map((job, index) => (
                    <Draggable 
                      key={job.id.toString()} 
                      draggableId={`${job.status}-${job.id.toString()}`} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1
                          }}
                        >
                          {renderJobCard(job, index, snapshot.isDragging, provided.dragHandleProps)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {archivedJobs.length === 0 && (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#666', 
                      padding: '2rem',
                      border: '2px dashed #ddd',
                      borderRadius: '8px'
                    }}>
                      No archived jobs
                    </div>
                  )}
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    )
  }

  const renderListView = () => (
    <div className="card">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>🔄 Loading jobs...</div>
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <p>No jobs found</p>
          {(search || statusFilter) && (
            <button onClick={() => { setSearch(''); setStatusFilter('') }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {jobs.map((job, index) => (
              <div key={job.id}>
                {renderJobCard(job, index)}
              </div>
            ))}
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
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Jobs ({total})</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                background: viewMode === 'kanban' ? '#007bff' : 'white',
                color: viewMode === 'kanban' ? 'white' : '#333',
                border: 'none',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              📋 Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? '#007bff' : 'white',
                color: viewMode === 'list' ? 'white' : '#333',
                border: 'none',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              📄 List
            </button>
          </div>
          
          <button 
            onClick={handleCreateJob}
            style={{ 
              background: '#28a745', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '4px', 
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            + New Job
          </button>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="createdAt">Created Date</option>
            <option value="title">Job Title</option>
            <option value="department">Department</option>
            <option value="location">Location</option>
            <option value="experienceLevel">Experience</option>
            <option value="salaryMin">Salary</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {sortOrder === 'asc' ? '↑' : '↓'} {sortOrder.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Main Content */}
      {error ? (
        <div className="card" style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>
          <p>❌ Error loading jobs: {error}</p>
          <button onClick={handleRetry} style={{ marginTop: '1rem' }}>
            🔄 Retry
          </button>
        </div>
      ) : (
        <div key={`${viewMode}-${jobs.length}`}>
          {viewMode === 'kanban' ? renderKanbanView() : renderListView()}
        </div>
      )}

      {/* Create/Edit Job Modal */}
      <CreateEditJobModal
        existing={editingJob}
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSaved={handleJobSaved}
      />

      {/* Notifications */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}
