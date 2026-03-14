import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function QuizCard({ quiz }) {
  const diffColors = { easy: 'bg-green-100 text-green-800', medium: 'bg-amber-100 text-amber-800', hard: 'bg-red-100 text-red-800' };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-heading text-lg">{quiz.title}</h3>
          <p className="text-sm text-gray-500">{quiz.topic}</p>
          <span className={`text-xs px-2 py-0.5 rounded mt-2 inline-block ${diffColors[quiz.difficulty] || diffColors.medium}`}>
            {quiz.difficulty}
          </span>
        </div>
        <span className="text-sm text-gray-400">{quiz.questions?.length || 0} questions</span>
      </div>
      <Link
        to={`/quiz-play/${quiz._id}`}
        className="mt-4 block text-center bg-primary text-white py-2 rounded-lg font-medium"
      >
        Start Quiz
      </Link>
    </motion.div>
  );
}
