import React, { useState, useEffect } from 'react';
import PreAssessmentForm from './PreAssessmentForm';

const AssessmentRuntime = () => {
  const [candidate, setCandidate] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentRound, setCurrentRound] = useState(0);
  const [jobId, setJobId] = useState('');

  const handleFormSubmit = (details) => {
    setCandidate(details);
  };

  const handleAnswerChange = (roundIndex, questionIndex, value) => {
    setAnswers((prev) => ({
      ...prev,
      [`${roundIndex}-${questionIndex}`]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Assessment Submitted:', { candidate, answers });
    alert('Assessment submitted successfully!');
  };

  useEffect(() => {
    if (jobId) {
      // In a real app, you would fetch the assessment for the given jobId
      // For now, we'll use a mock assessment structure
      setAssessment({
        title: `Assessment for Job #${jobId}`,
        rounds: [
          { title: 'Round 1: Aptitude', questions: Array(15).fill({ text: 'Sample Question', type: 'text' }) },
          { title: 'Round 2: Technical', questions: Array(15).fill({ text: 'Sample Question', type: 'text' }) },
          { title: 'Round 3: HR', questions: Array(15).fill({ text: 'Sample Question', type: 'text' }) },
        ],
      });
    }
  }, [jobId]);

  if (!candidate) {
    return <PreAssessmentForm onSubmit={handleFormSubmit} />;
  }

  return (
    <div>
      <h2>Assessment</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>Enter Job ID to load assessment: </label>
        <input type="text" value={jobId} onChange={(e) => setJobId(e.target.value)} />
      </div>

      {assessment ? (
        <form onSubmit={handleSubmit}>
          <h3>{assessment.title}</h3>
          <h4>{assessment.rounds[currentRound].title}</h4>
          {assessment.rounds[currentRound].questions.map((q, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <label>{index + 1}. {q.text}</label>
              <input
                type="text"
                onChange={(e) => handleAnswerChange(currentRound, index, e.target.value)}
                required
              />
            </div>
          ))}
          <div style={{ marginTop: '1rem' }}>
            {currentRound > 0 && (
              <button type="button" onClick={() => setCurrentRound(currentRound - 1)}>
                Previous Round
              </button>
            )}
            {currentRound < assessment.rounds.length - 1 && (
              <button type="button" onClick={() => setCurrentRound(currentRound + 1)}>
                Next Round
              </button>
            )}
            {currentRound === assessment.rounds.length - 1 && (
              <button type="submit">Submit Assessment</button>
            )}
          </div>
        </form>
      ) : (
        <p>Enter a Job ID to load the assessment.</p>
      )}
    </div>
  );
};

export default AssessmentRuntime;
