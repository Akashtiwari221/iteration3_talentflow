import React, { useState } from 'react';
import './AssessmentBuilder.css';

const questionTypes = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'single-choice', label: 'Single Choice' },
  { value: 'text', label: 'Text' },
];

const AssessmentBuilder = () => {
  const [assessment, setAssessment] = useState({
    title: '',
    jobId: '',
    timeLimit: 60,
    rounds: [
      {
        title: '',
        questions: Array(15).fill({ text: '', type: 'text', options: [] }),
      },
    ],
  });

  const handleAssessmentChange = (e) => {
    const { name, value } = e.target;
    setAssessment((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoundChange = (index, e) => {
    const { name, value } = e.target;
    const rounds = [...assessment.rounds];
    rounds[index][name] = value;
    setAssessment((prev) => ({ ...prev, rounds }));
  };

  const handleQuestionChange = (roundIndex, questionIndex, e) => {
    const { name, value } = e.target;
    const rounds = [...assessment.rounds];
    rounds[roundIndex].questions[questionIndex][name] = value;
    setAssessment((prev) => ({ ...prev, rounds }));
  };

  const handleOptionChange = (roundIndex, questionIndex, optionIndex, e) => {
    const { value } = e.target;
    const rounds = [...assessment.rounds];
    rounds[roundIndex].questions[questionIndex].options[optionIndex] = value;
    setAssessment((prev) => ({ ...prev, rounds }));
  };

  const addOption = (roundIndex, questionIndex) => {
    const rounds = [...assessment.rounds];
    rounds[roundIndex].questions[questionIndex].options.push('');
    setAssessment((prev) => ({ ...prev, rounds }));
  };

  const removeOption = (roundIndex, questionIndex, optionIndex) => {
    const rounds = [...assessment.rounds];
    rounds[roundIndex].questions[questionIndex].options.splice(optionIndex, 1);
    setAssessment((prev) => ({ ...prev, rounds }));
  };

  const addQuestion = (roundIndex) => {
    const rounds = [...assessment.rounds];
    rounds[roundIndex].questions.push({ text: '', type: 'text', options: [] });
    setAssessment((prev) => ({ ...prev, rounds }));
  };

  const removeQuestion = (roundIndex, questionIndex) => {
    const rounds = [...assessment.rounds];
    rounds[roundIndex].questions.splice(questionIndex, 1);
    setAssessment((prev) => ({ ...prev, rounds }));
  };

  const addRound = () => {
    setAssessment((prev) => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        {
          title: '',
          questions: Array(15).fill({ text: '', type: 'text', options: [] }),
        },
      ],
    }));
  };

  const removeRound = (index) => {
    const rounds = [...assessment.rounds];
    rounds.splice(index, 1);
    setAssessment((prev) => ({ ...prev, rounds }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (assessment.rounds.length < 3) {
      alert('Please add at least 3 rounds.');
      return;
    }
    for (const round of assessment.rounds) {
      if (round.questions.length < 15) {
        alert('Each round must have at least 15 questions.');
        return;
      }
    }
    console.log('Assessment Submitted:', assessment);
    // Here you would typically send the data to a server
  };

  return (
    <div className="assessment-builder">
      <h2>Create Assessment</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Assessment Title</label>
          <input
            type="text"
            name="title"
            value={assessment.title}
            onChange={handleAssessmentChange}
            required
          />
        </div>
        <div className="input-group">
          <label>Job ID</label>
          <input
            type="text"
            name="jobId"
            value={assessment.jobId}
            onChange={handleAssessmentChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Time Limit (minutes)</label>
          <input
            type="number"
            name="timeLimit"
            min={5}
            max={240}
            step={5}
            value={assessment.timeLimit}
            onChange={handleAssessmentChange}
            required
          />
        </div>

        {assessment.rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="section">
            <h3>Round {roundIndex + 1}</h3>
            <div className="input-group">
              <label>Round Title</label>
              <input
                type="text"
                name="title"
                value={round.title}
                onChange={(e) => handleRoundChange(roundIndex, e)}
                required
              />
            </div>
            {round.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="question">
                <h4>Question {questionIndex + 1}</h4>
                <div className="input-group">
                  <label>Question Text</label>
                  <textarea
                    name="text"
                    value={question.text}
                    onChange={(e) =>
                      handleQuestionChange(roundIndex, questionIndex, e)
                    }
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Question Type</label>
                  <select
                    name="type"
                    value={question.type}
                    onChange={(e) =>
                      handleQuestionChange(roundIndex, questionIndex, e)
                    }
                  >
                    {questionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                {(question.type === 'multiple-choice' ||
                  question.type === 'single-choice') && (
                  <div>
                    <label>Options</label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(
                              roundIndex,
                              questionIndex,
                              optionIndex,
                              e
                            )
                          }
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() =>
                            removeOption(roundIndex, questionIndex, optionIndex)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn"
                      onClick={() => addOption(roundIndex, questionIndex)}
                    >
                      Add Option
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeQuestion(roundIndex, questionIndex)}
                >
                  Remove Question
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn"
              onClick={() => addQuestion(roundIndex)}
            >
              Add Question
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => removeRound(roundIndex)}
            >
              Remove Round
            </button>
          </div>
        ))}
        <button type="button" className="btn" onClick={addRound}>
          Add Round
        </button>
        <button type="submit" className="btn btn-primary">
          Save Assessment
        </button>
      </form>
    </div>
  );
};

export default AssessmentBuilder;
