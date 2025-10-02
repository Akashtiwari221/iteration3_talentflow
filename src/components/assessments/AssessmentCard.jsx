import React from 'react';
import './AssessmentCard.css';

const AssessmentCard = ({ assessment, onDeploy, onViewResults }) => {
  return (
    <div className="assessment-card">
      <h3>{assessment.title}</h3>
      <div className="assessment-card-details">
        <p>{assessment.rounds.length} Rounds</p>
        {/* You can add more details here, like total questions */}
      </div>
      <div className="assessment-card-actions">
        <button className="btn btn-secondary" onClick={() => onViewResults(assessment.id)}>
          View Results
        </button>
        <button className="btn btn-primary" onClick={() => onDeploy(assessment.id)}>
          Deploy
        </button>
      </div>
    </div>
  );
};

export default AssessmentCard;
