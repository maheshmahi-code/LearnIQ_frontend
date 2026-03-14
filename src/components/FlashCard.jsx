import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FlashCard({ card, onRate, showButtons = true }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      layout
      className="perspective-1000 cursor-pointer"
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        className="relative w-full h-48"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 backface-hidden flex flex-col justify-center items-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-lg text-center">{card.front}</p>
        </div>
        <div
          className="absolute inset-0 bg-accent/10 dark:bg-accent/20 rounded-xl shadow-lg p-6 backface-hidden flex flex-col justify-center items-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-lg text-center">{card.back}</p>
        </div>
      </motion.div>
      {showButtons && flipped && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center gap-4 mt-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onRate?.('hard')}
            className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
          >
            👎 Hard
          </button>
          <button
            onClick={() => onRate?.('ok')}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            😐 OK
          </button>
          <button
            onClick={() => onRate?.('easy')}
            className="px-4 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
          >
            👍 Easy
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
