// components/usercomponents/NoteCard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Save, X, RotateCw } from 'lucide-react';

interface Note {
  id: string;
  created_at: string;
  user_id: string | null;
  organization_slug: string | null; // Changed to allow null
  title: string;
  description: string | null;
  content: string | null;
  is_public: boolean; // Added
  updated_at: string | null; // Added
}

interface NoteCardProps {
  note: Note;
  onUpdate: (id: string, title: string, description: string | null, content: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  editingNoteId: string | null;
  setEditingNoteId: (id: string | null) => void;
  isUpdating: boolean;
  setIsUpdating: (state: boolean) => void;
  onClick: (note: Note) => void;
  canEditOrDelete: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8, rotateY: -5, rotateX: 2 },
  visible: { opacity: 1, y: 0, scale: 1, rotateY: 0, rotateX: 0, transition: { type: "spring", stiffness: 180, damping: 20 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export default function NoteCard({
  note,
  onUpdate,
  onDelete,
  editingNoteId,
  setEditingNoteId,
  isUpdating,
  setIsUpdating,
  onClick,
  canEditOrDelete,
}: NoteCardProps) {
  const isEditing = editingNoteId === note.id;
  const [currentTitle, setCurrentTitle] = useState(note.title);
  const [currentDescription, setCurrentDescription] = useState(note.description);
  const [currentContent, setCurrentContent] = useState(note.content);

  useEffect(() => {
    if (!isEditing) {
      setCurrentTitle(note.title);
      setCurrentDescription(note.description);
      setCurrentContent(note.content);
    }
  }, [isEditing, note.title, note.description, note.content]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNoteId(note.id);
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    await onUpdate(note.id, currentTitle, currentDescription, currentContent);
    setIsUpdating(false);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNoteId(null);
    setCurrentTitle(note.title); // Reset to original values
    setCurrentDescription(note.description);
    setCurrentContent(note.content);
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative group"
      variants={cardVariants}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(note)}
    >
      {isEditing ? (
        <div className="p-6 flex flex-col flex-grow">
          <input
            type="text"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="text-2xl font-bold text-gray-800 mb-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Note Title"
            disabled={isUpdating}
          />
          <textarea
            value={currentDescription || ''}
            onChange={(e) => setCurrentDescription(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="text-gray-700 mb-4 flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            rows={2}
            placeholder="Description (optional)"
            disabled={isUpdating}
          />
          <textarea
            value={currentContent || ''}
            onChange={(e) => setCurrentContent(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="text-gray-700 mb-4 flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            rows={4}
            placeholder="Content (optional)"
            disabled={isUpdating}
          />
          <div className="flex justify-end space-x-2 mt-auto">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSaveClick}
              className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Save note"
              disabled={isUpdating}
            >
              {isUpdating ? <RotateCw className="animate-spin" size={18} /> : <Save size={18} />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCancelClick}
              className="p-2 rounded-full bg-gray-400 hover:bg-gray-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Cancel edit"
              disabled={isUpdating}
            >
              <X size={18} />
            </motion.button>
          </div>
        </div>
      ) : (
        <>
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-2xl font-bold text-gray-800 mb-2 truncate">
              {note.title}
            </h3>
            <p className="text-gray-700 mb-4 flex-grow overflow-hidden whitespace-pre-wrap line-clamp-3">
              {note.description || 'No description provided.'}
            </p>
            <div className="flex justify-between items-center mt-auto text-sm text-gray-500 z-10">
              <span>Created: {new Date(note.created_at).toLocaleDateString()}</span>
              <div className="flex space-x-2">
                {canEditOrDelete && (
                  <>
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
                      onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                      className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition"
                      aria-label="Delete note"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}