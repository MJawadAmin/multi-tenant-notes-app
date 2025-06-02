// components/notes/NoteReader.tsx (Example - ensure yours matches this structure)
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Note {
  id: string;
  created_at: string;
  user_id: string | null;
  organization_slug: string;
  title: string;
  description: string | null; // <--- ADDED: New description field
  content: string | null;
}

interface NoteReaderProps {
  note: Note;
  onClose: () => void;
}

const readerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  exit: { opacity: 0, y: 50, transition: { duration: 0.3 } },
};

export default function NoteReader({ note, onClose }: NoteReaderProps) {
  if (!note) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} // Close when clicking outside the modal content
      >
        <motion.div
          className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
          variants={readerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
            aria-label="Close note"
          >
            <X size={24} />
          </button>

          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 break-words">
            {note.title}
          </h2>

          {/* Optional: Display description in reader if desired */}
          {note.description && (
            <p className="text-gray-600 text-lg mb-6 italic border-l-4 border-indigo-400 pl-4">
              {note.description}
            </p>
          )}

          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed break-words">
            {/* Display the full content */}
            <p className="whitespace-pre-wrap">{note.content}</p>
          </div>

          <p className="text-sm text-gray-500 mt-6 pt-4 border-t border-gray-200">
            Created on: {new Date(note.created_at).toLocaleDateString()}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}