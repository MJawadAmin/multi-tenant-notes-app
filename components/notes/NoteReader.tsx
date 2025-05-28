// components/notes/NoteReader.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

interface NoteReaderProps {
  note: {
    id: string;
    title: string;
    content: string | null;
    created_at: string;
  };
  onClose: () => void;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const bookVariants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    rotateX: -30, // Initial rotation for a subtle 3D effect
  },
  visible: {
    scale: 1,
    opacity: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    rotateX: 30, // Rotate out
    transition: {
      duration: 0.3,
    },
  },
};

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function NoteReader({ note, onClose }: NoteReaderProps) {
  if (!note) return null;

  // Simple split content for two "pages" if it's long enough
  const content = note.content || '';
  const words = content.split(' ');
  const halfway = Math.ceil(words.length / 2);
  const leftPageContent = words.slice(0, halfway).join(' ');
  const rightPageContent = words.slice(halfway).join(' ');

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose} // Close when clicking outside
    >
      <motion.div
        className="relative bg-gradient-to-br from-yellow-50 to-amber-100 rounded-lg shadow-xl p-8 max-w-4xl w-full h-[80vh] overflow-hidden flex flex-col"
        variants={bookVariants}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the book
        style={{ perspective: '1000px' }} // Needed for 3D transforms
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 z-50"
        >
          <XCircle size={30} />
        </motion.button>

        <motion.h2
          className="text-3xl font-extrabold text-gray-800 mb-4 text-center"
          variants={pageVariants}
        >
          {note.title}
        </motion.h2>

        <div className="flex flex-grow border-t border-gray-300 pt-4 -mx-4 px-4">
          {/* Left Page */}
          <motion.div
            className="flex-1 p-4 border-r border-gray-300 overflow-y-auto text-left text-gray-700 leading-relaxed text-sm pr-6"
            variants={pageVariants}
          >
            <p className="whitespace-pre-wrap">{leftPageContent}</p>
          </motion.div>

          {/* Right Page */}
          <motion.div
            className="flex-1 p-4 overflow-y-auto text-left text-gray-700 leading-relaxed text-sm pl-6"
            variants={pageVariants}
          >
            <p className="whitespace-pre-wrap">{rightPageContent}</p>
          </motion.div>
        </div>

        <motion.div
          className="text-xs text-gray-500 mt-4 text-right"
          variants={pageVariants}
        >
          Created: {new Date(note.created_at).toLocaleString()}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}