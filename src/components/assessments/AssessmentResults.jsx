import React, { useState, useEffect } from 'react';
import './AssessmentResults.css';

// Mock function to fetch assessment results
const fetchAssessmentResults = async (assessmentId) => {
  console.log(`Fetching results for assessment ${assessmentId}...`);
  // In a real app, this would be an API call
  return [
    { id: 1, name: 'John Doe', rollNo: 'CAND-001', score: 85 },
    { id: 2, name: 'Jane Smith', rollNo: 'CAND-002', score: 92 },
    { id: 3, name: 'Peter Jones', rollNo: 'CAND-003', score: 78 },
  ];
};

const AssessmentResults = ({ assessmentId }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getResults = async () => {
      const data = await fetchAssessmentResults(assessmentId);
      setResults(data);
      setLoading(false);
    };

    getResults();
  }, [assessmentId]);

  if (loading) {
    return <div>Loading results...</div>;
  }

  return (
    <div className="assessment-results">
      <h3>Assessment Results</h3>
      <table className="results-table">
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Name</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id}>
              <td>{result.rollNo}</td>
              <td>{result.name}</td>
              <td>{result.score}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssessmentResults;
