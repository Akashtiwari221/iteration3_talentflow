import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import './CandidatePortal.css';

const CandidatePortal = () => {
  const { user } = useUser();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAppliedJobs = async () => {
      try {
        if (!user?.id) return;
        const appsRes = await fetch(`/api/applications?candidateId=${user.id}`);
        const appsData = await appsRes.json();
        const applications = appsData.items || [];

        const jobs = await Promise.all(applications.map(async (app) => {
          const jobRes = await fetch(`/api/jobs/${app.jobId}`);
          const job = await jobRes.json();
          const asRes = await fetch(`/api/assessments/${app.jobId}`);
          const assessment = await asRes.json();
          return {
            id: job.id,
            title: job.title,
            department: job.department,
            status: app.status || 'Applied',
            hasAssessment: !!assessment?.isActive,
          };
        }));

        setAppliedJobs(jobs);
      } catch (e) {
        setAppliedJobs([]);
      } finally {
        setLoading(false);
      }
    };

    getAppliedJobs();
  }, [user?.id]);

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
      {appliedJobs.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#666' }}>
          No applied jobs yet.
        </div>
      )}
    </div>
  );
};

export default CandidatePortal;
