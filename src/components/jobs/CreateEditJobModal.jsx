import React, { useState, useEffect } from 'react'

export default function CreateEditJobModal({ existing, onClose, onSaved, isOpen }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: 'Engineering',
    location: 'Remote',
    tags: [],
    status: 'active',
    autoArchiveEnabled: false,
    autoArchiveHours: 24,
    autoArchiveDate: null
  })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Initialize form data when modal opens or existing job changes
  useEffect(() => {
    if (existing) {
      setFormData({
        title: existing.title || '',
        description: existing.description || '',
        department: existing.department || 'Engineering',
        location: existing.location || 'Remote',
        tags: existing.tags || [],
        status: existing.status || 'active',
        autoArchiveEnabled: !!existing.autoArchiveDate,
        autoArchiveHours: existing.autoArchiveHours || 24,
        autoArchiveDate: existing.autoArchiveDate || null
      })
    } else {
      // Reset form for new job
      setFormData({
        title: '',
        description: '',
        department: 'Engineering',
        location: 'Remote',
        tags: [],
        status: 'active',
        autoArchiveEnabled: false,
        autoArchiveHours: 24,
        autoArchiveDate: null
      })
    }
    setTagInput('')
    setError(null)
  }, [existing, isOpen])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleAutoArchiveToggle = (enabled) => {
    setFormData(prev => ({
      ...prev,
      autoArchiveEnabled: enabled,
      autoArchiveDate: enabled 
        ? new Date(Date.now() + prev.autoArchiveHours * 60 * 60 * 1000).toISOString()
        : null
    }))
  }

  const handleAutoArchiveHoursChange = (hours) => {
    const newHours = Math.max(1, Math.min(8760, hours)) // 1 hour to 1 year
    setFormData(prev => ({
      ...prev,
      autoArchiveHours: newHours,
      autoArchiveDate: prev.autoArchiveEnabled 
        ? new Date(Date.now() + newHours * 60 * 60 * 1000).toISOString()
        : null
    }))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('Job title is required')
      return
    }

    setSaving(true)
    setError(null)
    
    const payload = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      tags: formData.tags,
      autoArchiveDate: formData.autoArchiveEnabled ? formData.autoArchiveDate : null,
      autoArchiveHours: formData.autoArchiveEnabled ? formData.autoArchiveHours : null
    }
    
    try {
      const url = existing ? `/api/jobs/${existing.id}` : '/api/jobs'
      const method = existing ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Save failed')
      
      if (onSaved) onSaved(data)
      if (onClose) onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.name === 'tagInput') {
      e.preventDefault()
      handleAddTag()
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>
            {existing ? 'Edit Job' : 'Create New Job'}
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #f5c6cb'
          }}>
            ❌ {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Job Title */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Job Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Job Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Department and Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Data">Data</option>
                <option value="Security">Security</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              >
                <option value="Remote">Remote</option>
                <option value="New York">New York</option>
                <option value="San Francisco">San Francisco</option>
                <option value="Austin">Austin</option>
                <option value="Seattle">Seattle</option>
                <option value="Boston">Boston</option>
                <option value="Chicago">Chicago</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Skills/Tags
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                name="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a skill or tag"
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {formData.tags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#e9ecef',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      lineHeight: 1
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Auto-Archive Settings */}
          <div style={{
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '1rem',
            background: '#f8f9fa'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="checkbox"
                id="autoArchive"
                checked={formData.autoArchiveEnabled}
                onChange={(e) => handleAutoArchiveToggle(e.target.checked)}
              />
              <label htmlFor="autoArchive" style={{ fontWeight: 'bold' }}>
                🕒 Auto-Archive Job
              </label>
            </div>

            {formData.autoArchiveEnabled && (
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Archive after (hours):
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    min="1"
                    max="8760"
                    value={formData.autoArchiveHours}
                    onChange={(e) => handleAutoArchiveHoursChange(parseInt(e.target.value) || 1)}
                    style={{
                      width: '100px',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                  <span style={{ color: '#666' }}>hours</span>
                  <div style={{ marginLeft: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    Quick: 
                    <button type="button" onClick={() => handleAutoArchiveHoursChange(24)} style={{ margin: '0 0.25rem', padding: '0.25rem 0.5rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>1 day</button>
                    <button type="button" onClick={() => handleAutoArchiveHoursChange(168)} style={{ margin: '0 0.25rem', padding: '0.25rem 0.5rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>1 week</button>
                    <button type="button" onClick={() => handleAutoArchiveHoursChange(720)} style={{ margin: '0 0.25rem', padding: '0.25rem 0.5rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>1 month</button>
                  </div>
                </div>
                {formData.autoArchiveDate && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                    📅 Will be archived on: {new Date(formData.autoArchiveDate).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'flex-end',
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #eee'
        }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.title.trim()}
            style={{
              background: saving ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: (saving || !formData.title.trim()) ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            {saving ? '💾 Saving...' : existing ? '💾 Update Job' : '💾 Create Job'}
          </button>
        </div>
      </div>
    </div>
  )
}