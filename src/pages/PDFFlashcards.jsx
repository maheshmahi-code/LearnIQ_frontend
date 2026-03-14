import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  generateFromFile, 
  generateFromCourse, 
  getDecks, 
  getDeck, 
  updateCardDifficulty 
} from '../services/flashcardService';
import { coursesAPI } from '../services/apiService';

export default function PDFFlashcards() {
  const [decks, setDecks] = useState([]);
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [view, setView] = useState('decks'); // 'decks' or 'study'

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getDecks(),
      coursesAPI.getAll({ enrolled: true }) // Assuming you have an "enrolled" filter, or you can filter in the frontend
    ]).then(([deckRes, courseRes]) => {
      setDecks(deckRes.data.decks || []);
      setEnrolledCourses(courseRes.data.courses || []);
    }).finally(() => setLoading(false));
  }, []);

  const loadDeck = (id) => {
    setLoading(true);
    getDeck(id).then((r) => {
      setDeck(r.data.deck);
      setCards(r.data.deck?.cards || []);
      setCardIdx(0);
      setIsFlipped(false);
      setView('study');
    }).finally(() => setLoading(false));
  };

  const handleGenerateFromCourse = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      const { data } = await generateFromCourse(selectedCourseId);
      setDecks((prev) => [data.deck, ...prev]);
      loadDeck(data.deck._id);
    } catch (err) {
      alert('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { data } = await generateFromFile(file);
      setDecks((prev) => [data.deck, ...prev]);
      loadDeck(data.deck._id);
    } catch (err) {
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (difficulty) => {
    const currentCard = cards[cardIdx];
    if (!currentCard) return;
    
    // Smoothly go to next card
    setIsFlipped(false);
    setTimeout(async () => {
      await updateCardDifficulty(currentCard._id, difficulty);
      if (cardIdx < cards.length - 1) {
        setCardIdx(cardIdx + 1);
      } else {
        // Deck finished
        setView('decks');
      }
    }, 200);
  };

  if (loading && view === 'decks') {
    return (
      <div className="p-6 min-h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-full bg-gray-50 dark:bg-gray-900">
      <AnimatePresence mode="wait">
        {view === 'decks' ? (
          <motion.div 
            key="decks"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-6xl mx-auto"
          >
            <div className="mb-8 sm:mb-10 text-center">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white font-heading mb-3 sm:mb-4">AI Flashcards</h1>
              <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto px-4">Master any subject with AI-generated flashcards from your courses or uploaded documents.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-10 sm:mb-12">
              <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 font-heading text-gray-800 dark:text-white flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">🎓</span> Generate from Course
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mb-5 sm:mb-6 leading-relaxed">Select an enrolled course to generate cards from its curriculum content.</p>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <select 
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm sm:text-base text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                  >
                    <option value="">Select a course...</option>
                    {enrolledCourses.map(c => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                  <button 
                    disabled={!selectedCourseId || loading}
                    onClick={handleGenerateFromCourse}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 text-sm sm:text-base"
                  >
                    {loading ? 'Generating...' : 'Start Flashcards'}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 border-dashed">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 font-heading text-gray-800 dark:text-white flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">📄</span> Upload PDF/DOCX
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mb-5 sm:mb-6 leading-relaxed">Want to study something specific? Just upload the file and our AI will do the rest.</p>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-5 sm:p-6 cursor-pointer hover:border-primary transition-colors hover:bg-primary/5 group">
                  <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" />
                  <span className="text-2xl sm:text-3xl mb-1.5 sm:mb-2 grayscale group-hover:grayscale-0 transition-all">📂</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-500">Pick a Study File</span>
                </label>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 font-heading text-gray-800 dark:text-white">Your Flashcard Decks</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((d) => (
                <motion.div 
                  key={d._id}
                  whileHover={{ y: -5 }}
                  onClick={() => loadDeck(d._id)}
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-all relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mt-10 -mr-10 transition-transform group-hover:scale-150"></div>
                  <h4 className="font-bold text-lg mb-2 dark:text-white line-clamp-1">{d.title}</h4>
                  <p className="text-sm text-gray-400 mb-4">{d.totalCards} Cards • Last studied: {new Date(d.updatedAt).toLocaleDateString()}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Open Deck</span>
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">→</span>
                  </div>
                </motion.div>
              ))}
              {decks.length === 0 && (
                <div className="col-span-full py-20 text-center opacity-40">
                  <span className="text-6xl mb-4 block">📭</span>
                  <h3 className="text-xl font-bold">No Study Decks Yet</h3>
                  <p>Generate one above to start mastering your subjects!</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="study"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex justify-between items-center mb-10">
              <button 
                onClick={() => setView('decks')}
                className="bg-white dark:bg-gray-800 text-gray-500 font-bold px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2"
              >
                <span>←</span> Back
              </button>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400">Card {cardIdx + 1} of {cards.length}</span>
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300" 
                    style={{ width: `${((cardIdx + 1) / cards.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <StudyCard 
              card={cards[cardIdx]} 
              isFlipped={isFlipped} 
              onFlip={() => setIsFlipped(!isFlipped)} 
              onRate={handleRate}
            />

            <div className="mt-12 text-center text-gray-400 text-sm italic">
              Click the card to flip it and reveal the answer.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StudyCard({ card, isFlipped, onFlip, onRate }) {
  if (!card) return null;

  return (
    <div className="perspective-1000 w-full h-[380px] sm:h-[450px]">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        onClick={onFlip}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full h-full relative cursor-pointer"
      >
        {/* Front */}
        <div 
          className="absolute inset-0 bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center overflow-hidden backface-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
          <span className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-primary mb-4 sm:mb-6">Front / Question</span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold dark:text-white font-heading px-2">{card.front}</h2>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 bg-blue-600 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-center text-center overflow-hidden backface-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-white opacity-20"></div>
          <span className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-white/60 mb-4 sm:mb-6">Back / Answer</span>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-relaxed px-2">{card.back}</h2>
          
          <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-4 w-full" onClick={(e) => e.stopPropagation()}>
            <StudyRatingButton label="Hard" color="bg-orange-500/20 text-white" onClick={() => onRate('hard')} />
            <StudyRatingButton label="Good" color="border-2 border-white/20 text-white" onClick={() => onRate('ok')} />
            <StudyRatingButton label="Easy" color="bg-emerald-400 text-blue-900" onClick={() => onRate('easy')} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StudyRatingButton({ label, color, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`py-3 px-4 rounded-xl font-black text-sm uppercase tracking-tighter transition-transform hover:scale-105 active:scale-95 ${color}`}
    >
      {label}
    </button>
  );
}
