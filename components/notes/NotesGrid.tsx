// components/notes/NotesGrid.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NoteCard from './NoteCard';

interface Note {
  id: string;
  created_at: string;
  user_id: string | null;
  organization_slug: string;
  title: string;
  content: string | null;
}

interface NotesGridProps {
  notes: Note[];
  onUpdate: (id: string, title: string, content: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  editingNoteId: string | null;
  setEditingNoteId: (id: string | null) => void;
  isUpdating: boolean;
  setIsUpdating: (state: boolean) => void;
}

export default function NotesGrid({
  notes,
  onUpdate,
  onDelete,
  editingNoteId,
  setEditingNoteId,
  isUpdating,
  setIsUpdating,
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" /* Increased gap for book effect */
      initial="hidden"
      animate="visible"
      variants={gridVariants}
    >
      <AnimatePresence>
        {notes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center text-gray-500 py-12"
          >
            <p className="text-xl">No public notes found yet.</p>
            <p className="text-lg">Be the first to create one!</p>
          </motion.div>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onUpdate={onUpdate}
              onDelete={onDelete}
              editingNoteId={editingNoteId}
              setEditingNoteId={setEditingNoteId}
              isUpdating={isUpdating}
              setIsUpdating={setIsUpdating}
            />
          ))
        )}
      </AnimatePresence>
    </motion.div>
  );
}