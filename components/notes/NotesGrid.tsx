// components/notes/NotesGrid.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NoteCard from './NoteCard';
import { Note } from '@/types/note';

interface NotesGridProps {
  notes: Note[];
  onUpdate: (id: string, title: string, description: string | null, content: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  editingNoteId: string | null;
  setEditingNoteId: (id: string | null) => void;
  isUpdating: boolean;
  setIsUpdating: (state: boolean) => void;
  onNoteClick: (note: Note) => void;
  canEditOrDelete: boolean;
  currentUserUid: string | null;
  onDownload?: (note: Note) => Promise<void>;
  selectedNotes: string[];
  onSelectNote: (noteId: string) => void;
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
  canEditOrDelete,
  currentUserUid,
  onDownload,
  selectedNotes,
  onSelectNote,
}: NotesGridProps) {
  return (
    <motion.div
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
    >
      <AnimatePresence>
        {notes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="col-span-full text-center text-gray-500 py-8"
          >
            No notes found.
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
              onClick={onNoteClick}
              canEditOrDelete={canEditOrDelete}
              currentUserUid={currentUserUid}
              onDownload={onDownload ? () => onDownload(note) : undefined}
              isSelected={selectedNotes.includes(note.id)}
              onSelect={() => onSelectNote(note.id)}
            />
          ))
        )}
      </AnimatePresence>
    </motion.div>
  );
}