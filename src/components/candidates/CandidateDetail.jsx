import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function CandidateDetail() {
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCandidate = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/candidates/${candidateId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load candidate');
        }
        setCandidate(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCandidate();
  }, [candidateId]);

  if (loading) {
    return <div>Loading candidate details...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!candidate) {
    return <div>Candidate not found.</div>;
  }

  return (
    <div className="candidate-detail">
      <h1>{candidate.name}</h1>
      <p><strong>Email:</strong> {candidate.email}</p>
      <p><strong>Phone:</strong> {candidate.phone}</p>
      <p><strong>Experience:</strong> {candidate.experience} years</p>
      <p><strong>Skills:</strong> {candidate.skills && Array.isArray(candidate.skills) ? candidate.skills.join(', ') : 'N/A'}</p>
      <p><strong>Applied for:</strong> Job #{candidate.jobId}</p>
      <p><strong>Stage:</strong> {candidate.stage}</p>
      <p><strong>Applied on:</strong> {new Date(candidate.appliedAt).toLocaleDateString()}</p>
      <p><strong>Resume:</strong> {candidate.resume}</p>
      
      <h2>Assessment</h2>
      <p><strong>Score:</strong> {candidate.assessmentScore}%</p>
      <p><strong>Analysis:</strong> {candidate.assessmentAnalysis}</p>
    </div>
  );
}
