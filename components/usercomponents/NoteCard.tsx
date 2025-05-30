// components/usercomponents/NoteCard.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface Note {
  id: string;
  title: string;
  content: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface NoteCardProps {
  note: Note;
  onDelete: (noteId: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  return (
    <motion.div
      className="border rounded-lg p-5 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-800">{note.title}</h3>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              note.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {note.is_public ? 'Public' : 'Private'}
          </span>
        </div>
        <p className="text-gray-600 mb-4 text-sm whitespace-pre-wrap line-clamp-4">
          {note.content || 'No content provided.'}
        </p>
      </div>
      <div className="flex justify-between items-center border-t pt-3">
        <span className="text-xs text-gray-500">
          Last updated: {new Date(note.updated_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <motion.button
          onClick={() => onDelete(note.id)}
          className="text-red-600 hover:text-red-800 px-3 py-1 rounded-md transition-colors duration-200 hover:bg-red-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Delete
        </motion.button>
      </div>
    </motion.div>
  );
};

export default NoteCard;