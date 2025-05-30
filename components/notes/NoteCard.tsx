// components/usercomponents/NoteCard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Save, X, RotateCw } from 'lucide-react';

interface Note {
  id: string;
  created_at: string;
  user_id: string | null;
  organization_slug: string;
  title: string;
  description: string | null;
  content: string | null;
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
  // --- ADDED: New prop to control edit/delete visibility ---
  canEditOrDelete: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8, rotateY: -5, rotateX: 2 },
  visible: { opacity: 1, y: 0, scale: 1, rotateY: 0, rotateX: 0, transition: { type: "spring", stiffness: 180, damping: 20 } },
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
  onClick,
  canEditOrDelete, // Destructure the new prop
}: NoteCardProps) {
  const isEditing = editingNoteId === note.id;
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedDescription, setEditedDescription] = useState(note.description);
  const [editedContent, setEditedContent] = useState(note.content);

  useEffect(() => {
    if (!isEditing) {
      setEditedTitle(note.title);
      setEditedDescription(note.description);
      setEditedContent(note.content);
    }
  }, [note, isEditing]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNoteId(note.id);
    setEditedTitle(note.title);
    setEditedDescription(note.description);
    setEditedContent(note.content);
  };

  const handleUpdateClick = async () => {
    await onUpdate(note.id, editedTitle, editedDescription, editedContent);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNoteId(null);
    setEditedTitle(note.title); // Reset to original values
    setEditedDescription(note.description);
    setEditedContent(note.content);
  };

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`
        relative p-6 rounded-lg border-t-4 border-l-4 border-r-2 border-b-2
        bg-gradient-to-br from-yellow-50 to-amber-100
        flex flex-col justify-between
        transform transition-all duration-400 ease-out
        ${!isEditing ? 'cursor-pointer' : ''}
      `}
      style={{
        borderColor: isEditing ? 'rgb(99 102 241)' : 'rgb(209 213 219)',
        boxShadow: isEditing
          ? '12px 12px 25px rgba(0, 0, 0, 0.3), inset -3px 0px 7px rgba(0, 0, 0, 0.15), 0 0 0 3px rgb(99 102 241, 0.5)'
          : '8px 8px 15px rgba(0, 0, 0, 0.2), inset -2px 0px 5px rgba(0, 0, 0, 0.1)',
        transformStyle: 'preserve-3d',
      }}
      whileHover={!isEditing ? {
        scale: 1.03,
        rotateY: 0,
        rotateX: 0,
        boxShadow: '15px 15px 30px rgba(0, 0, 0, 0.35), inset -4px 0px 8px rgba(0, 0, 0, 0.2)',
      } : {}}
      onClick={() => !isEditing && onClick(note)}
    >
      {/* Dynamic "Spine" Effect: A div simulating the binding of a book */}
      <div
        className="absolute top-0 bottom-0 left-0 w-3 rounded-l-lg opacity-90"
        style={{
          background: isEditing ? 'linear-gradient(to right, #6366f1, #4f46e5)' : 'linear-gradient(to right, #6b7280, #4b5563)',
          transform: isEditing ? 'translateX(-50%) rotateY(0deg) scaleX(1)' : 'translateX(-50%) rotateY(10deg) scaleX(0.8)',
          transformOrigin: 'left center',
          transition: 'transform 0.4s ease-out, background 0.4s ease-out',
          boxShadow: 'inset 2px 0px 5px rgba(0, 0, 0, 0.2)',
        }}
      />

      {isEditing ? (
        <div className="space-y-4 z-10 flex flex-col h-full">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xl font-bold"
            disabled={isUpdating}
            placeholder="Note Title"
          />
          {/* New Description Input */}
          <textarea
            value={editedDescription || ''}
            onChange={(e) => setEditedDescription(e.target.value)}
            rows={3} // Shorter rows for description
            className="w-full px-3 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y text-gray-700"
            disabled={isUpdating}
            placeholder="Short Description (e.g., summary, synopsis)"
          ></textarea>
          {/* Full Content Input - still present for editing */}
          <textarea
            value={editedContent || ''}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y text-gray-700 flex-grow"
            disabled={isUpdating}
            placeholder="Note Content (Full Book Text)"
          ></textarea>
          <div className="flex justify-end space-x-3 mt-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpdateClick} // Attach handler
              className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUpdating || !editedTitle.trim()}
              aria-label="Save note"
            >
              {isUpdating ? <RotateCw className="animate-spin" size={20} /> : <Save size={20} />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCancelEdit} // Attach handler
              className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition"
              aria-label="Cancel editing"
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
          {/* Displaying the dedicated description field */}
          <p className="text-gray-700 mb-4 flex-grow overflow-hidden whitespace-pre-wrap line-clamp-3">
            {note.description || 'No description provided.'} {/* Display description, not content */}
          </p>
          <div className="flex justify-between items-center mt-auto text-sm text-gray-500 z-10">
            <span>Created: {new Date(note.created_at).toLocaleDateString()}</span>
            <div className="flex space-x-2">
              {/* --- CONDITIONAL RENDERING FOR EDIT AND DELETE BUTTONS --- */}
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
        </>
      )}
    </motion.div>
  );
}