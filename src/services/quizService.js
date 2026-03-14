import { quizAPI } from './apiService';

export const getQuizzesByCourse = (courseId) => quizAPI.getByCourse(courseId);
export const getQuiz = (id) => quizAPI.getOne(id);
export const generateQuiz = (opts) => quizAPI.generate(opts);
export const submitAttempt = (quizId, data) => quizAPI.attempt(quizId, data);
export const getQuizResults = (id) => quizAPI.getResults(id);
