import { flashcardsAPI } from './apiService';

export const generateFromFile = (file, title) => {
  const formData = new FormData();
  formData.append('file', file);
  if (title) formData.append('title', title);
  return flashcardsAPI.generate(formData);
};
export const getDecks = () => flashcardsAPI.getDecks();
export const getDeck = (id) => flashcardsAPI.getDeck(id);
export const updateCardDifficulty = (id, difficulty) =>
  flashcardsAPI.updateCard(id, { difficulty });
export const generateFromCourse = (courseId) => flashcardsAPI.generateFromCourse(courseId);
export const getDueToday = () => flashcardsAPI.getDueToday();
