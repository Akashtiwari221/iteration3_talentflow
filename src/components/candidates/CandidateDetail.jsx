import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './CandidateDetail.css';

const stages = ['applied', 'screening', 'interview', 'technical', 'final', 'offer', 'hired', 'rejected']

export default function CandidateDetail() {
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const loadCandidate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/candidates/${candidateId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load candidate');
      setCandidate(data);
      setNotes(data.notes || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeline = async () => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/timeline`);
      const data = await res.json();
      if (Array.isArray(data)) setTimeline(data);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadCandidate();
    loadTimeline();
  }, [candidateId]);

  const handleStageChange = async (e) => {
    const stage = e.target.value;
    if (!candidate) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/candidates/${candidate.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ stage })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update stage');
      setCandidate(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!candidate) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/candidates/${candidate.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save notes');
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = async () => {
    const skill = newSkill.trim();
    if (!skill || !candidate) return;
    const skills = Array.from(new Set([...(candidate.skills || []), skill]));
    setNewSkill('');
    await updateSkills(skills);
  };

  const removeSkill = async (skill) => {
    if (!candidate) return;
    const skills = (candidate.skills || []).filter(s => s !== skill);
    await updateSkills(skills);
  };

  const updateSkills = async (skills) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/candidates/${candidate.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ skills })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update skills');
      setCandidate(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const quickAdvance = () => {
    if (!candidate) return;
    const idx = stages.indexOf(candidate.stage);
    const next = stages[Math.min(idx + 1, stages.length - 1)] || candidate.stage;
    handleStageChange({ target: { value: next } });
  };

  const quickReject = () => handleStageChange({ target: { value: 'rejected' } });
  const quickHire = () => handleStageChange({ target: { value: 'hired' } });

  const assessmentLink = useMemo(() => candidate ? `${window.location.origin}/assessment/${candidate.jobId}` : '' , [candidate]);

  const copyAssessmentLink = async () => {
    try {
      await navigator.clipboard.writeText(assessmentLink);
      alert('Assessment link copied');
    } catch (e) {
      alert('Copy failed');
    }
  };

  if (loading) return <div>Loading candidate details...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!candidate) return <div>Candidate not found.</div>;

  return (
    <div className="candidate-detail-page">
      <div className="candidate-card">
        <div className="candidate-header">
          <div>
            <h1 className="candidate-name">{candidate.name}</h1>
            <div>
              <Link to={`/jobs/${candidate.jobId}`}>Job #{candidate.jobId}</Link>
            </div>
          </div>
          <div>
            <select className="stage-select" value={candidate.stage} onChange={handleStageChange} disabled={saving}>
              {stages.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>
        </div>

        <div className="meta-grid">
          <div><strong>Email:</strong> {candidate.email}</div>
          <div><strong>Phone:</strong> {candidate.phone || 'N/A'}</div>
          <div><strong>Experience:</strong> {candidate.experience} years</div>
          <div><strong>Applied:</strong> {candidate.appliedAt ? new Date(candidate.appliedAt).toLocaleDateString() : 'N/A'}</div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <div><strong>Skills</strong></div>
          <div className="skill-chips">
            {(candidate.skills || []).map((s, i) => (
              <span key={i} className="skill-chip">{s}<button className="remove" onClick={() => removeSkill(s)}>×</button></span>
            ))}
          </div>
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add skill" style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '8px' }} />
            <button className="btn btn-primary" type="button" onClick={addSkill} disabled={!newSkill.trim()}>Add</button>
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <div><strong>Notes</strong></div>
          <textarea className="notes-area" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div style={{ marginTop: '8px' }}>
            <button className="btn btn-primary" onClick={handleSaveNotes} disabled={saving}>Save Notes</button>
          </div>
        </div>
      </div>

      <div className="actions-col">
        <div className="candidate-card">
          <h3>Quick Actions</h3>
          <button className="btn btn-primary" onClick={quickAdvance} disabled={saving}>Advance Stage →</button>
          <button className="btn" onClick={quickHire} disabled={saving}>✅ Mark Hired</button>
          <button className="btn" onClick={quickReject} disabled={saving}>❌ Mark Rejected</button>
        </div>

        <div className="candidate-card">
          <h3>Assessment</h3>
          <div><strong>Score:</strong> {candidate.assessmentScore}%</div>
          <div style={{ margin: '6px 0' }}><progress value={candidate.assessmentScore} max="100" style={{ width: '100%' }}></progress></div>
          <div style={{ color: '#555', fontSize: '0.9rem' }}>{candidate.assessmentAnalysis}</div>
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <a className="btn" href={assessmentLink} target="_blank" rel="noreferrer">Open Assessment</a>
            <button className="copy-link" type="button" onClick={copyAssessmentLink}>Copy Link</button>
          </div>
        </div>

        <div className="candidate-card">
          <h3>Timeline</h3>
          <ul className="timeline">
            {timeline.map(t => (
              <li key={t.id} className="timeline-item">
                <div><strong>{t.type}</strong> — {t.description}</div>
                <div style={{ color: '#666', fontSize: '0.85rem' }}>{new Date(t.date).toLocaleDateString()}</div>
              </li>
            ))}
            {timeline.length === 0 && <li className="timeline-item">No activity yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
