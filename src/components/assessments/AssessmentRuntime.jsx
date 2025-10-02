import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import PreAssessmentForm from './PreAssessmentForm';
import './AssessmentRuntime.css';

const AssessmentRuntime = () => {
  const { jobId } = useParams();
  const { user } = useUser();
  const [candidate, setCandidate] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(null);

  const handleFormSubmit = (details) => {
    setCandidate(details);
  };

  const handleAnswerChange = (sectionIndex, questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [`${sectionIndex}-${questionId}`]: value,
    }));
  };

  const serializeAnswers = () => ({
    sectionIndex: currentSection,
    responses: answers,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/assessments/${jobId}/submit`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          candidateId: user?.id || 0,
          answers: serializeAnswers(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      alert(`Assessment submitted successfully! Score: ${data.score}`);
    } catch (e) {
      alert(`Failed to submit: ${e.message}`);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/assessments/${jobId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load assessment');
        if (mounted) setAssessment(data);
        if (mounted) {
          const limit = Number(data.timeLimit || 0)
          if (limit > 0) setSecondsLeft(limit * 60)
        }
      } catch (e) {
        if (mounted) setAssessment(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (jobId) load();
    return () => { mounted = false };
  }, [jobId]);

  useEffect(() => {
    if (secondsLeft == null) return
    if (secondsLeft <= 0) {
      const fakeEvent = { preventDefault: () => {} }
      handleSubmit(fakeEvent)
      return
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s == null ? s : s - 1)), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft])

  useEffect(() => {
    if (user?.role === 'candidate' && user?.name && user?.email) {
      setCandidate({ name: user.name, email: user.email });
    }
  }, [user?.role, user?.name, user?.email]);

  const current = useMemo(() => {
    if (!assessment) return null;
    const sections = assessment.sections || assessment.rounds || [];
    return sections[currentSection] || null;
  }, [assessment, currentSection]);

  if (!candidate) {
    return <PreAssessmentForm onSubmit={handleFormSubmit} />;
  }

  if (loading) {
    return <div>Loading assessment...</div>;
  }

  if (!assessment || !(assessment.sections || assessment.rounds)?.length) {
    return <div>No assessment available for this job.</div>;
  }

  return (
    <div>
      <h2>{assessment.title || `Assessment for Job #${jobId}`}</h2>

      <form onSubmit={handleSubmit}>
        {current && (
          <div>
            <h4>{current.title}</h4>
            {(current.questions || []).map((q, idx) => {
              const qId = q.id ?? idx + 1;
              const key = `${currentSection}-${qId}`;
              const type = q.type || 'short';
              const required = !!q.required;

              if (type === 'single') {
                return (
                  <div key={key} style={{ marginBottom: '1rem' }}>
                    <label>{idx + 1}. {q.label}</label>
                    <div>
                      {(q.options || []).map((opt, i) => (
                        <label key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginRight: '12px' }}>
                          <input
                            type="radio"
                            name={`q-${key}`}
                            value={opt}
                            onChange={(e) => handleAnswerChange(currentSection, qId, e.target.value)}
                            required={required}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              }

              if (type === 'multi') {
                return (
                  <div key={key} style={{ marginBottom: '1rem' }}>
                    <label>{idx + 1}. {q.label}</label>
                    <div>
                      {(q.options || []).map((opt, i) => (
                        <label key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginRight: '12px' }}>
                          <input
                            type="checkbox"
                            value={opt}
                            onChange={(e) => {
                              const existing = answers[key] || [];
                              const next = e.target.checked
                                ? Array.from(new Set([...existing, opt]))
                                : existing.filter((v) => v !== opt);
                              handleAnswerChange(currentSection, qId, next);
                            }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              }

              if (type === 'long') {
                return (
                  <div key={key} style={{ marginBottom: '1rem' }}>
                    <label>{idx + 1}. {q.label}</label>
                    <textarea
                      rows={4}
                      placeholder={q.placeholder}
                      onChange={(e) => handleAnswerChange(currentSection, qId, e.target.value)}
                      required={required}
                      style={{ width: '100%' }}
                    />
                  </div>
                );
              }

              if (type === 'numeric') {
                return (
                  <div key={key} style={{ marginBottom: '1rem' }}>
                    <label>{idx + 1}. {q.label}</label>
                    <input
                      type="number"
                      min={q.validation?.min}
                      max={q.validation?.max}
                      placeholder={q.placeholder}
                      onChange={(e) => handleAnswerChange(currentSection, qId, e.target.value)}
                      required={required}
                    />
                  </div>
                );
              }

              return (
                <div key={key} style={{ marginBottom: '1rem' }}>
                  <label>{idx + 1}. {q.label || q.text}</label>
                  <input
                    type="text"
                    placeholder={q.placeholder}
                    onChange={(e) => handleAnswerChange(currentSection, qId, e.target.value)}
                    required={required}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '1rem' }}>
          {currentSection > 0 && (
            <button type="button" onClick={() => setCurrentSection(currentSection - 1)}>
              Previous Section
            </button>
          )}
          {currentSection < ((assessment.sections || assessment.rounds)?.length - 1) && (
            <button type="button" onClick={() => setCurrentSection(currentSection + 1)}>
              Next Section
            </button>
          )}
          {currentSection === ((assessment.sections || assessment.rounds)?.length - 1) && (
            <button type="submit">Submit Assessment</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AssessmentRuntime;
