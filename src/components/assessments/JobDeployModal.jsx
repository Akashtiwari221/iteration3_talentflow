import React, { useEffect, useMemo, useState } from 'react';
import './JobDeployModal.css';

export default function JobDeployModal({ isOpen, onClose, onConfirm, title = 'Deploy Assessment' }) {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: '1', pageSize: '1000', status: 'active', ...(search ? { search } : {}) });
        const res = await fetch(`/api/jobs?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load jobs');
        setJobs(data.items || []);
      } catch (e) {
        setError(e.message);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, search]);

  const selectedJob = useMemo(() => jobs.find(j => String(j.id) === String(selectedJobId)), [jobs, selectedJobId]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content job-deploy-modal">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="modal-body">
          <div className="search-row">
            <input
              type="text"
              className="search-input"
              placeholder="Search active jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {error && <div className="error-text">❌ {error}</div>}

          {loading ? (
            <div className="loading-text">Loading jobs...</div>
          ) : (
            <div className="jobs-list" role="list">
              {jobs.map((job) => (
                <label key={job.id} className={`job-row ${String(selectedJobId) === String(job.id) ? 'selected' : ''}`} role="listitem">
                  <input
                    type="radio"
                    name="selectedJob"
                    value={job.id}
                    checked={String(selectedJobId) === String(job.id)}
                    onChange={() => setSelectedJobId(job.id)}
                  />
                  <div className="job-info">
                    <div className="job-title">{job.title}</div>
                    <div className="job-meta">{job.department} • {job.location} • {job.experienceLevel}</div>
                  </div>
                </label>
              ))}
              {jobs.length === 0 && (
                <div className="empty-state">No active jobs found.</div>
              )}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={!selectedJob}
            onClick={() => selectedJob && onConfirm(selectedJob)}
          >
            Deploy to Selected Job
          </button>
        </div>
      </div>
    </div>
  );
}
