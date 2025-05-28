'use client'; // KEEP THIS if you want state, effects, and client-side libraries

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion'; // Still needed for other animations
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { PlusCircle } from 'lucide-react';

// Reusable Components
// import FeatureCard from '@/components/FeatureCard'; // REMOVED
import NoteForm from '@/components/notes/NoteForm';
import NotesGrid from '@/components/notes/NotesGrid';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';

interface Note {
  id: string;
  created_at: string;
  user_id: string | null;
  organization_slug: string;
  title: string;
  content: string | null;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for creating new notes
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // State for editing notes
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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
        console.log('Realtime change received!', payload);
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
        } else if (payload.eventType === 'DELETE') {
          setNotes((prevNotes) =>
            prevNotes.filter((note) => note.id !== (payload.old as Note).id)
          );
          toast.error('Note deleted!', { duration: 1500 });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreateNote = async (title: string, content: string | null) => {
    if (!title.trim()) {
      toast.error('Note title cannot be empty.');
      return;
    }
    setIsCreating(true);
    const { error } = await supabase
      .from('notes')
      .insert({
        organization_slug: PUBLIC_ORG_SLUG,
        title: title.trim(),
        content: content,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note: ' + error.message);
    } else {
      setNewNoteTitle('');
      setNewNoteContent('');
      setShowCreateForm(false);
    }
    setIsCreating(false);
  };

  const handleUpdateNote = async (noteId: string, title: string, content: string | null) => {
    if (!title.trim()) {
      toast.error('Note title cannot be empty.');
      return;
    }
    setIsUpdating(true);
    const { error } = await supabase
      .from('notes')
      .update({
        title: title.trim(),
        content: content,
      })
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note: ' + error.message);
    } else {
      setEditingNoteId(null);
    }
    setIsUpdating(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note: ' + error.message);
    }
  };

  // Removed the features array since FeatureCards are no longer used

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
      {/* Background overlay for subtle texture, mimicking paper or wall */}
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
          Your instant, collaborative workspace for notes and ideas.
        </p>
      </div>

      {/* --- Features Section (REMOVED) --- */}
      {/* The motion.div for features and the map over features are removed */}

      {/* --- Notes Section --- */}
      <div className="relative z-10 w-full max-w-6xl mt-12 mb-8 p-4 sm:p-6 bg-white shadow-xl rounded-lg border border-gray-200">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-4 sm:mb-0">
            Global Notes Board
          </h2>
          <motion.button
            onClick={() => setShowCreateForm(!showCreateForm)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
          >
            <PlusCircle size={20} className="mr-2" />
            {showCreateForm ? 'Cancel' : 'New Public Note'}
          </motion.button>
        </header>

        {/* New Note Form */}
        <AnimatePresence>
          {showCreateForm && (
            <NoteForm
              initialTitle={newNoteTitle}
              initialContent={newNoteContent}
              onSubmit={handleCreateNote}
              onCancel={() => {
                setShowCreateForm(false);
                setNewNoteTitle('');
                setNewNoteContent('');
              }}
              isSubmitting={isCreating}
              submitButtonText="Save Note"
              isCreateMode={true}
            />
          )}
        </AnimatePresence>

        {/* Notes Grid */}
        <NotesGrid
          notes={notes}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
          editingNoteId={editingNoteId}
          setEditingNoteId={setEditingNoteId}
          isUpdating={isUpdating}
          setIsUpdating={setIsUpdating}
        />
      </div>

      {/* Optional: Add a login link */}
      <div className="relative z-10 text-sm text-gray-600 mt-6 text-center">
        Looking for private notes and user management?{' '}
        <a href="/login" className="text-indigo-600 hover:underline">
          Log in or Sign up
        </a>
        .
      </div>
    </motion.div>
  );
}