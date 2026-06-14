import { flashcardsAPI } from './apiService';

export const getDecks = () => flashcardsAPI.getDecks();
export const getDeck = (id) => flashcardsAPI.getDeck(id);
export const updateCardDifficulty = (id, difficulty) =>
  flashcardsAPI.updateCard(id, { difficulty });
export const generateFromCourse = (courseId) => flashcardsAPI.generateFromCourse(courseId);
export const getDueToday = () => flashcardsAPI.getDueToday();
