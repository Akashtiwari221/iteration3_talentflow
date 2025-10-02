import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CandidatePortal.css';

// Mock function to fetch applied jobs for a candidate
const fetchAppliedJobs = async () => {
  // In a real app, this would be an API call
  return [
    { id: 1, title: 'Software Engineer', department: 'Technology', status: 'Applied', hasAssessment: true },
    { id: 2, title: 'Product Manager', department: 'Product', status: 'Under Review', hasAssessment: false },
    { id: 3, title: 'Data Scientist', department: 'Analytics', status: 'Applied', hasAssessment: true },
  ];
};

const CandidatePortal = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAppliedJobs = async () => {
      const jobs = await fetchAppliedJobs();
      setAppliedJobs(jobs);
      setLoading(false);
    };

    getAppliedJobs();
  }, []);

  if (loading) {
    return <div>Loading applied jobs...</div>;
  }

  return (
    <div>
      <h2>Applied Jobs</h2>
      {appliedJobs.map((job) => (
        <div key={job.id} className="job-card">
          <h3>{job.title}</h3>
          <div className="job-card-details">
            <p><strong>Department:</strong> {job.department}</p>
            <p><strong>Status:</strong> {job.status}</p>
          </div>
          <div className="job-card-actions">
            {job.hasAssessment && (
              <Link to={`/assessment/${job.id}`}>
                <button className="btn btn-primary">Start Assessment</button>
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CandidatePortal;
