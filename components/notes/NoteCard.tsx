// components/notes/NoteCard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Save, X, RotateCw } from 'lucide-react';
import NoteForm from './NoteForm'; // Import the new NoteForm component

interface Note {
  id: string;
  created_at: string;
  user_id: string | null;
  organization_slug: string;
  title: string;
  content: string | null;
}

interface NoteCardProps {
  note: Note;
  onUpdate: (id: string, title: string, content: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  editingNoteId: string | null; // Pass down for controlled editing state
  setEditingNoteId: (id: string | null) => void;
  isUpdating: boolean; // Pass down for loading state
  setIsUpdating: (state: boolean) => void; // Pass down to control updating state
}

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -50, scale: 0.8, transition: { duration: 0.3 } },
};

export default function NoteCard({
  note,
  onUpdate,
  onDelete,
  editingNoteId,
  setEditingNoteId,
  isUpdating,
  setIsUpdating,
}: NoteCardProps) {
  const isEditing = editingNoteId === note.id;
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);

  useEffect(() => {
    // Sync local state with note props when note changes or editing starts
    if (!isEditing) {
      setEditedTitle(note.title);
      setEditedContent(note.content);
    }
  }, [note, isEditing]);

  const handleEditClick = () => {
    setEditingNoteId(note.id);
    setEditedTitle(note.title);
    setEditedContent(note.content);
  };

  const handleSaveEdit = async (title: string, content: string | null) => {
    setIsUpdating(true);
    await onUpdate(note.id, title, content);
    setIsUpdating(false);
    // setEditingNoteId(null) will be handled by the parent's onUpdate success callback
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditedTitle(note.title); // Revert to original on cancel
    setEditedContent(note.content); // Revert to original on cancel
  };

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative bg-white p-6 rounded-lg shadow-xl border-t-4 border-l-4 border-r-2 border-b-2 border-gray-300
                 transform rotate-x-2 perspective-1000 origin-bottom-left transition-transform duration-300
                 flex flex-col justify-between
                 after:absolute after:inset-y-0 after:left-0 after:w-2 after:bg-gray-400 after:rounded-tl-lg after:rounded-bl-lg after:shadow-inner"
      style={{
        transformStyle: 'preserve-3d',
        transform: isEditing ? 'rotateY(0deg) rotateX(0deg) scale(1.02)' : 'rotateY(-5deg) rotateX(2deg) scale(1)', // Initial slight rotation for book look
        transition: 'transform 0.4s ease-out, box-shadow 0.4s ease-out',
        boxShadow: isEditing
          ? '12px 12px 25px rgba(0, 0, 0, 0.3), inset -3px 0px 7px rgba(0, 0, 0, 0.15)'
          : '8px 8px 15px rgba(0, 0, 0, 0.2), inset -2px 0px 5px rgba(0, 0, 0, 0.1)', // More pronounced shadow
      }}
      whileHover={{
        transform: 'rotateY(0deg) rotateX(0deg) scale(1.02)', // Straighten and slightly enlarge on hover
        boxShadow: '12px 12px 25px rgba(0, 0, 0, 0.3), inset -3px 0px 7px rgba(0, 0, 0, 0.15)',
      }}
    >
      {isEditing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xl font-bold"
            disabled={isUpdating}
          />
          <textarea
            value={editedContent || ''}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y text-gray-700"
            disabled={isUpdating}
          ></textarea>
          <div className="flex justify-end space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSaveEdit(editedTitle, editedContent)}
              className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUpdating}
            >
              {isUpdating ? <RotateCw className="animate-spin" size={20} /> : <Save size={20} />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCancelEdit}
              className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition"
            >
              <X size={20} />
            </motion.button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="text-2xl font-bold text-gray-800 mb-2 truncate">
            {note.title}
          </h3>
          <p className="text-gray-700 mb-4 flex-grow overflow-hidden whitespace-pre-wrap">
            {note.content || 'No content.'}
          </p>
          <div className="flex justify-between items-center mt-auto text-sm text-gray-500">
            <span>Created: {new Date(note.created_at).toLocaleDateString()}</span>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleEditClick}
                className="p-2 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white transition"
                aria-label="Edit note"
              >
                <Edit size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(note.id)}
                className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition"
                aria-label="Delete note"
              >
                <Trash2 size={18} />
              </motion.button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}