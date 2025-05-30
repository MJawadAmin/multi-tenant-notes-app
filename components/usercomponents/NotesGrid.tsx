// components/usercomponents/NotesGrid.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NoteCard from './NoteCard';

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

interface NotesGridProps {
  notes: Note[];
  onUpdate: (id: string, title: string, description: string | null, content: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  editingNoteId: string | null;
  setEditingNoteId: (id: string | null) => void;
  isUpdating: boolean;
  setIsUpdating: (state: boolean) => void;
  onNoteClick: (note: Note) => void;
  currentUserUid: string | null;
}

export default function NotesGrid({
  notes,
  onUpdate,
  onDelete,
  editingNoteId,
  setEditingNoteId,
  isUpdating,
  setIsUpdating,
  onNoteClick,
  currentUserUid,
}: NotesGridProps) {
  const gridVariants = {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      initial="hidden"
      animate="visible"
      variants={gridVariants}
    >
      <AnimatePresence mode="wait">
        {notes.length === 0 ? (
          <motion.div
            key="no-notes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="col-span-full text-center text-gray-500 py-12"
          >
            <p className="text-xl">No notes found yet.</p>
            <p className="text-lg">Be the first to create one!</p>
          </motion.div>
        ) : (
          notes.map((note) => (
            <motion.div key={note.id} layout>
              <NoteCard
                note={note}
                onUpdate={onUpdate}
                onDelete={onDelete}
                editingNoteId={editingNoteId}
                setEditingNoteId={setEditingNoteId}
                isUpdating={isUpdating}
                setIsUpdating={setIsUpdating}
                onClick={onNoteClick}
                canEditOrDelete={note.user_id === currentUserUid}
              />
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </motion.div>
  );
}