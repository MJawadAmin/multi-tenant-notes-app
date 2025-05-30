// app/(home)/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

import NotesGrid from '@/components/notes/NotesGrid';
import NoteReader from '@/components/notes/NoteReader';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';

interface Note {
  id: string;
  created_at: string;
  user_id: string | null;
  organization_slug: string;
  title: string;
  description: string | null;
  content: string | null;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const PUBLIC_ORG_SLUG = 'public-notes';

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (notesError) {
        console.error('Error fetching notes:', notesError);
        setError('Failed to load notes. Please try again.');
        toast.error('Failed to load notes: ' + notesError.message, { duration: 5000 });
        setLoading(false);
        return;
      }
      setNotes(notesData || []);
      setLoading(false);
    };

    fetchNotes();

    const channel = supabase
      .channel('public_notes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotes((prevNotes) => [payload.new as Note, ...prevNotes]);
          toast.success('New note added!', { duration: 1500 });
        } else if (payload.eventType === 'UPDATE') {
          setNotes((prevNotes) =>
            prevNotes.map((note) =>
              note.id === (payload.old as Note).id ? (payload.new as Note) : note
            )
          );
          toast('Note updated!', { icon: '✏️', duration: 1500 });
          if (selectedNote && selectedNote.id === (payload.old as Note).id) {
            setSelectedNote(payload.new as Note);
          }
        } else if (payload.eventType === 'DELETE') {
          setNotes((prevNotes) =>
            prevNotes.filter((note) => note.id !== (payload.old as Note).id)
          );
          toast.error('Note deleted!', { duration: 1500 });
          if (selectedNote && selectedNote.id === (payload.old as Note).id) {
            setSelectedNote(null);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
  };

  if (loading) {
    return <LoadingState message="Loading public notes..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center space-y-12 min-h-screen flex flex-col items-center p-4 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 relative"
    >
      <div className="absolute inset-0 z-0 bg-repeat opacity-10" style={{ backgroundImage: 'url("/paper-texture.png")', backgroundSize: '200px' }}></div>
      <div className="relative z-10 flex flex-col items-center space-y-4">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image src="/Logo.png" alt="Logo" width={100} height={100} />
        </motion.div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-800">
          Public Notes Whiteboard
        </h1>
        <p className="text-lg text-indigo-700 max-w-xl">
          View and read public notes. Sign in to create and manage your own notes.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-8xl mt-12 mb-8 p-4 sm:p-6 bg-white shadow-xl rounded-lg border border-gray-200">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-4 sm:mb-0">
            Global Notes Board
          </h2>
        </header>

        <NotesGrid
          notes={notes}
          onUpdate={async () => Promise.resolve()}
          onDelete={async () => Promise.resolve()}
          editingNoteId={null}
          setEditingNoteId={() => {}}
          isUpdating={false}
          setIsUpdating={() => {}}
          onNoteClick={handleNoteClick}
          currentUserUid={null}
        />
      </div>

      <AnimatePresence>
        {selectedNote && (
          <NoteReader note={selectedNote} onClose={() => setSelectedNote(null)} />
        )}
      </AnimatePresence>

      <div className="relative z-10 text-sm text-gray-600 mt-6 text-center">
        Want to create and manage your own notes?{' '}
        <a href="/login" className="text-indigo-600 hover:underline">
          Log in or Sign up
        </a>
        .
      </div>
    </motion.div>
  );
}
