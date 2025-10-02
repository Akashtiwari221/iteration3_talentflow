import React, { useState, useEffect } from 'react';
import AssessmentCard from './AssessmentCard';
import AssessmentBuilder from './AssessmentBuilder';
import AssessmentResults from './AssessmentResults';
import JobDeployModal from './JobDeployModal';
import Notification from '../common/Notification';
import './AssessmentBuilder.css';
import './AssessmentCard.css';
import './AssessmentsHome.css';

const AssessmentsHome = () => {
  const [assessments, setAssessments] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [viewingResultsOf, setViewingResultsOf] = useState(null);
  const [deployingAssessment, setDeployingAssessment] = useState(null);
  const [notice, setNotice] = useState(null);

  const loadAssessments = async () => {
    try {
      const res = await fetch('/api/assessments');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load assessments');
      setAssessments(data.items || []);
    } catch (e) {
      setAssessments([]);
      setNotice({ message: `Failed to load assessments: ${e.message}`, type: 'error' });
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  const handleDeploy = (assessment) => {
    setDeployingAssessment(assessment);
  };

  const confirmDeploy = async (job, selectedTimeLimit) => {
    if (!deployingAssessment || !job) return;
    try {
      const body = {
        title: deployingAssessment.title,
        description: deployingAssessment.description,
        timeLimit: Number(selectedTimeLimit || deployingAssessment.timeLimit || 60),
        sections: deployingAssessment.sections || deployingAssessment.rounds || [],
        isActive: true
      };
      const res = await fetch(`/api/assessments/${job.id}` , {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to deploy');
      setNotice({ message: `Assessment deployed to "${job.title}"`, type: 'success' });
      setDeployingAssessment(null);
      loadAssessments();
    } catch (e) {
      setNotice({ message: `Deployment failed: ${e.message}`, type: 'error' });
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
      <div className="assessments-header">
        <h2>Assessments</h2>
        <button
          className="btn btn-primary assessments-create-btn"
          onClick={() => setShowBuilder(true)}
        >
          Create New Assessment
        </button>
      </div>
      <div>
        {assessments.map((assessment) => (
          <AssessmentCard
            key={`${assessment.jobId || assessment.id}-${assessment.title}`}
            assessment={assessment}
            onDeploy={() => handleDeploy(assessment)}
            onViewResults={handleViewResults}
          />
        ))}
        {assessments.length === 0 && (
          <div className="card empty-assessments">
            No assessments yet.
          </div>
        )}
      </div>

      {deployingAssessment && (
        <JobDeployModal
          isOpen={!!deployingAssessment}
          onClose={() => setDeployingAssessment(null)}
          onConfirm={confirmDeploy}
          title={`Deploy: ${deployingAssessment.title}`}
        />
      )}

      {notice && (
        <Notification
          message={notice.message}
          type={notice.type}
          onClose={() => setNotice(null)}
        />
      )}
    </div>
  );
};

export default AssessmentsHome;
