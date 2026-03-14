import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getQuizResults } from '../services/quizService';

export default function QuizResults() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);

  useEffect(() => {
    getQuizResults(id).then((r) => setAttempt(r.data.attempt)).catch(() => {});
  }, [id]);

  if (!attempt) return <div className="p-8">Loading...</div>;

  const score = attempt.score;
  const total = attempt.totalQuestions;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="font-heading text-2xl mb-6">Quiz Results</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow text-center">
        <p className="text-5xl font-bold text-primary">{score}%</p>
        <p className="text-gray-500 mt-2">
          {attempt.answers?.filter((a) => a.isCorrect).length || 0} / {total} correct
        </p>
        <p className="text-accent mt-4">+15 XP for completing quiz</p>
        <Link
          to="/quiz-generator"
          className="mt-6 inline-block bg-primary text-white px-6 py-2 rounded-lg"
        >
          Take Another Quiz
        </Link>
      </div>
    </div>
  );
}
