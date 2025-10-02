import React from 'react';
import './AssessmentCard.css';

const AssessmentCard = ({ assessment, onDeploy, onViewResults }) => {
  const roundsOrSections = Array.isArray(assessment.rounds)
    ? assessment.rounds
    : Array.isArray(assessment.sections) ? assessment.sections : [];

  return (
    <div className="assessment-card">
      <h3>{assessment.title}</h3>
      <div className="assessment-card-details">
        <p>{roundsOrSections.length} Rounds</p>
      </div>
      <div className="assessment-card-actions">
        <button className="btn btn-secondary" onClick={() => onViewResults(assessment.id || assessment.jobId)}>
          View Results
        </button>
        <button className="btn btn-primary" onClick={onDeploy}>
          Deploy
        </button>
      </div>
    </div>
  );
};

export default AssessmentCard;
