import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CourseCard({ course, progress = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full group"
    >
      <Link to={`/curriculum/${course._id}`} className="flex flex-col h-full">
        <div className="h-28 sm:h-36 bg-gradient-to-br from-primary via-blue-500 to-accent relative object-cover flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
          <span className="text-4xl opacity-50 absolute right-4 bottom-4 group-hover:scale-110 transition-transform duration-300">📚</span>
        </div>
        <div className="p-4 sm:p-5 flex-grow flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-wider text-accent uppercase bg-accent/10 px-2 py-1 rounded-full">{course.category || 'General'}</span>
            <span className="text-[10px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{course.difficulty || 'Beginner'}</span>
          </div>
          <h3 className="font-heading text-base sm:text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
          {course.instructor?.name && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <span className="opacity-70">👨‍🏫</span> {course.instructor.name}
            </p>
          )}
          
          <div className="mt-auto pt-4">
            {progress > 0 ? (
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-gray-600 dark:text-gray-300">Progress</span>
                  <span className="text-accent">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            ) : (
              <div className="h-2 bg-transparent" />
            )}
            
            <div
              className={`mt-4 w-full block text-center py-2 sm:py-2.5 rounded-xl font-semibold transition-colors ${
                progress > 0 
                  ? 'bg-primary/10 text-primary group-hover:bg-primary/20 dark:bg-primary/20 dark:group-hover:bg-primary/30' 
                  : 'bg-primary text-white group-hover:bg-blue-600 shadow-md group-hover:shadow-lg'
              }`}
            >
              {progress > 0 ? 'Continue' : 'Start Course'}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
