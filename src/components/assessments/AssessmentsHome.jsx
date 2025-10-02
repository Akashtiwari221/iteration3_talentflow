import React, { useState, useEffect } from 'react';
import AssessmentCard from './AssessmentCard';
import AssessmentBuilder from './AssessmentBuilder';
import AssessmentResults from './AssessmentResults';

const AssessmentsHome = () => {
  const [assessments, setAssessments] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [viewingResultsOf, setViewingResultsOf] = useState(null);

  useEffect(() => {
    // In a real app, you would fetch the list of saved assessments
    // For now, we'll use a mock list
    setAssessments([
      { id: 1, title: 'Frontend Developer Assessment', rounds: [{ title: 'Coding Challenge', questions: [] }] },
      { id: 2, title: 'Backend Developer Assessment', rounds: [{ title: 'System Design', questions: [] }] },
    ]);
  }, []);

  const handleDeploy = (assessmentId) => {
    const jobId = prompt('Enter the Job ID to deploy this assessment to:');
    if (jobId) {
      console.log(`Deploying assessment ${assessmentId} to job ${jobId}`);
      // Here you would typically make an API call to associate the assessment with the job
      alert(`Assessment ${assessmentId} deployed to Job ID: ${jobId}`);
    }
  };

  const handleViewResults = (assessmentId) => {
    setViewingResultsOf(assessmentId);
  };

  if (showBuilder) {
    return <AssessmentBuilder />;
  }

  if (viewingResultsOf) {
    return (
      <div>
        <button className="btn" onClick={() => setViewingResultsOf(null)}>
          &larr; Back to Assessments
        </button>
        <AssessmentResults assessmentId={viewingResultsOf} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Assessments</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowBuilder(true)}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
        >
          Create New Assessment
        </button>
      </div>
      <div>
        {assessments.map((assessment) => (
          <AssessmentCard
            key={assessment.id}
            assessment={assessment}
            onDeploy={handleDeploy}
            onViewResults={handleViewResults}
          />
        ))}
      </div>
    </div>
  );
};

export default AssessmentsHome;
