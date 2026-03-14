import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, submitAttempt } from '../services/quizService';

export default function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    getQuiz(id).then((r) => setQuiz(r.data.quiz)).catch(() => navigate('/quiz-generator'));
  }, [id]);

  const q = quiz?.questions?.[idx];
  if (!quiz) return <div className="p-8">Loading...</div>;

  const handleSelect = (opt) => {
    const newAns = [...answers];
    newAns[idx] = { questionIdx: idx, selectedOption: opt };
    setAnswers(newAns);
    if (idx < quiz.questions.length - 1) {
      setIdx(idx + 1);
    } else {
      handleSubmit(newAns);
    }
  };

  const handleSubmit = async (ans) => {
    // Fill in any skipped blanks up to the length of questions
    const full = [];
    for (let i = 0; i < quiz.questions.length; i++) {
      full.push({
        questionIdx: i,
        selectedOption: ans[i]?.selectedOption || '',
      });
    }
    
    try {
      const { data } = await submitAttempt(id, {
        answers: full,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
      });
      navigate(`/quiz-results/${data.attempt.id}`);
    } catch (e) {
      alert('Failed to submit: ' + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between mb-6">
        <span>Question {idx + 1} of {quiz.questions.length}</span>
        <div className="w-32 h-2 bg-gray-200 rounded">
          <div
            className="h-full bg-accent rounded"
            style={{ width: `${((idx + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
        <h2 className="font-heading text-xl mb-6">{q?.question}</h2>
        <div className="space-y-2">
          {(q?.options || []).map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className={`w-full text-left p-4 rounded-lg border ${
                answers[idx]?.selectedOption === opt
                  ? 'border-primary bg-primary/10'
                  : 'hover:border-primary/50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setIdx(Math.max(0, idx - 1))}
          disabled={idx === 0}
          className="px-4 py-2 rounded-lg border disabled:opacity-50"
        >
          Previous
        </button>
        {idx < quiz.questions.length - 1 && (
          <button
            onClick={() => setIdx(idx + 1)}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
