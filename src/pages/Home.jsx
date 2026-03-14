import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <section className="pt-24 pb-16 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-4xl md:text-6xl text-primary mb-4"
        >
          Learn Smarter with AI-Powered Education
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8"
        >
          AI tutoring, adaptive quizzes, leaderboard, weakness detection, and PDF flashcards.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20"
          >
            {user ? "Continue Learning" : "Start Learning Free"}
          </Link>
        </motion.div>
      </section>

      <section className="py-16 px-4 grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[
          { title: 'AI Tutoring', desc: '24/7 doubt solver', icon: '🤖', to: '/ai-study-assistant' },
          { title: 'Adaptive Quizzes', desc: 'AI-generated MCQs', icon: '❓', to: '/quiz-generator' },
          { title: 'Leaderboard', desc: 'See how you rank', icon: '🏅', to: '/leaderboard' },
          { title: 'Weakness Detector', desc: 'Find & fix weak areas', icon: '🎯', to: '/weakness-detector' },
          { title: 'PDF Flashcards', desc: 'AI-generated from PDFs', icon: '🃏', to: '/pdf-flashcards' },
          { title: 'PDF Notes', desc: 'Share & Access Study Material', icon: '🗒️', to: '/notes' },
          { title: 'Analytics', desc: 'Track your progress', icon: '📈', to: '/analytics' },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg"
          >
            <span className="text-4xl">{item.icon}</span>
            <h3 className="font-heading text-xl mt-2">{item.title}</h3>
            <p className="text-gray-500 mt-1">{item.desc}</p>
            <Link to={item.to} className="text-primary mt-4 inline-block font-medium">
              Learn more →
            </Link>
          </motion.div>
        ))}
      </section>

      <section className="py-12 bg-primary text-white text-center">
        <p className="text-2xl font-heading">Join thousands of learners</p>
        <p className="text-accent/90 mt-1">Start your journey today</p>
      </section>
    </div>
  );
}
