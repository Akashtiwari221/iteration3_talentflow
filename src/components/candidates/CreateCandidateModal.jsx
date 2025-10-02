import React, { useState, useEffect } from 'react';
import './CreateCandidateModal.css';

const CreateCandidateModal = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobId, setJobId] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setName('');
      setEmail('');
      setPhone('');
      setJobId('');
      setExperience('');
      setSkills('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const newCandidate = {
      name,
      email,
      phone,
      jobId: parseInt(jobId, 10),
      experience: parseInt(experience, 10),
      skills: skills.split(',').map(s => s.trim()).filter(s => s),
      stage: 'applied', // Default stage for new candidates
    };

    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCandidate),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create candidate');
      }

      onCreated(data); // Pass the new candidate data back
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Candidate</h2>
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="phone">Phone (Optional)</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="jobId">Job ID Applied For</label>
            <input
              type="number"
              id="jobId"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="experience">Years of Experience</label>
            <input
              type="number"
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="skills">Skills (comma-separated)</label>
            <textarea
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g., React, JavaScript, Node.js"
            ></textarea>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCandidateModal;
