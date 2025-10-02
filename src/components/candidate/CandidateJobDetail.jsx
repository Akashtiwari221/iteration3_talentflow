import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Mock function to check if an assessment is deployed for a job
const checkAssessmentStatus = async (jobId) => {
  // In a real app, this would be an API call
  console.log(`Checking assessment status for job ${jobId}...`);
  // Let's assume jobs with odd IDs have an assessment for demonstration
  return jobId % 2 !== 0;
};

export default function CandidateJobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch job details
    const fetchJobDetails = async () => {
      // Mock job data
      const mockJob = {
        id: jobId,
        title: `Software Engineer (Job #${jobId})`,
        department: 'Technology',
        description: 'This is a detailed job description for the role of Software Engineer. We are looking for a skilled developer to join our team.',
        status: 'Applied'
      };
      setJob(mockJob);

      // Check for assessment
      const assessmentStatus = await checkAssessmentStatus(jobId);
      setHasAssessment(assessmentStatus);
      
      setLoading(false);
    };

    fetchJobDetails();
  }, [jobId]);

  if (loading) {
    return <div>Loading job details...</div>;
  }

  if (!job) {
    return <div>Job not found.</div>;
  }

  return (
    <div className="card">
      <h2>{job.title}</h2>
      <p><strong>Department:</strong> {job.department}</p>
      <p><strong>Status:</strong> {job.status}</p>
      <hr />
      <p>{job.description}</p>
      
      {hasAssessment ? (
        <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
          <h4>Assessment</h4>
          <p>An assessment is available for this job application.</p>
          <Link to={`/assessment/${jobId}`}>
            <button className="btn btn-primary">Take Assessment</button>
          </Link>
        </div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <p>Your application is being reviewed. If an assessment is required, it will appear here.</p>
        </div>
      )}
    </div>
  );
}
