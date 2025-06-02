'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import NotesGrid from '@/components/notes/NotesGrid';
import { Button } from '@/components/ui/button';
import { Note } from '@/types/note';
import { toast } from 'sonner';
import { generatePDF } from '@/utils/pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { Download } from 'lucide-react';
import NoteReader from '@/components/notes/NoteReader';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimePayload {
  new: Note;
  old: Note;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

export default function UserDashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const supabase = createClientComponentClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Please login to access your notes');
        redirect('/login');
      }

      setCurrentUserUid(session.user.id);

      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(notes || []);
      toast.success('Notes loaded successfully');
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to load notes');
      toast.error('Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const supabase = createClientComponentClient();
    const channel = supabase
      .channel('notes_changes')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'notes',
        },
        (payload: RealtimePayload) => {
          if (payload.eventType === 'INSERT') {
            setNotes(prev => [payload.new, ...prev]);
            toast.success('New note added to your collection');
          } else if (payload.eventType === 'UPDATE') {
            setNotes(prev =>
              prev.map(note =>
                note.id === payload.new.id ? payload.new : note
              )
            );
            toast.success('Note updated successfully');
          } else if (payload.eventType === 'DELETE') {
            setNotes(prev => prev.filter(note => note.id !== payload.old.id));
            if (selectedNotes.includes(payload.old.id)) {
              setSelectedNotes(prev => prev.filter(id => id !== payload.old.id));
              toast.error('A selected note was deleted');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedNotes]);

  const handleSelectNote = (noteId: string) => {
    const isSelected = selectedNotes.includes(noteId);
    setSelectedNotes(prev =>
      isSelected
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
    toast.success(isSelected ? 'Note deselected' : 'Note selected');
  };

  const handleSelectAll = () => {
    if (selectedNotes.length === notes.length) {
      setSelectedNotes([]);
      toast.success('All notes deselected');
    } else {
      setSelectedNotes(notes.map(note => note.id));
      toast.success(`All ${notes.length} notes selected`);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedNotes.length === 0) {
      toast.error('Please select at least one note to download');
      return;
    }

    try {
      toast.loading('Preparing download...');
      const selectedNotesData = notes.filter(note => selectedNotes.includes(note.id));
      for (const note of selectedNotesData) {
        await generatePDF(note);
      }
      toast.dismiss();
      toast.success(`Successfully downloaded ${selectedNotes.length} note${selectedNotes.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error downloading notes:', error);
      toast.dismiss();
      toast.error('Failed to download notes. Please try again.');
    }
  };

  const handleUpdateNote = async (id: string, title: string, description: string | null, content: string | null) => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      setIsUpdating(true);
      toast.loading('Updating note...');
      const supabase = createClientComponentClient();
      const { error } = await supabase
        .from('notes')
        .update({
          title,
          description,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setNotes(prev =>
        prev.map(note =>
          note.id === id ? { ...note, title, description, content } : note
        )
      );
      setEditingNoteId(null);
      toast.dismiss();
      toast.success('Note updated successfully');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.dismiss();
      toast.error('Failed to update note. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      toast.info('Note deletion cancelled');
      return;
    }

    try {
      toast.loading('Deleting note...');
      const supabase = createClientComponentClient();
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== noteId));
      setSelectedNotes(prev => prev.filter(id => id !== noteId));
      toast.dismiss();
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.dismiss();
      toast.error('Failed to delete note. Please try again.');
    }
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    toast.success('Opening note viewer');
  };

  const handleCloseReader = () => {
    setSelectedNote(null);
    toast.success('Note viewer closed');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Notes</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleSelectAll}
            className={selectedNotes.length > 0 ? 'bg-primary/10' : ''}
          >
            {selectedNotes.length === notes.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </div>

      {/* Selected Notes Popup */}
      <AnimatePresence>
        {selectedNotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 bg-white rounded-lg shadow-xl p-4 z-50"
          >
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {selectedNotes.length} note{selectedNotes.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleDownloadSelected}
                className="px-4 py-2 bg-green-600 text-white rounded-full font-semibold shadow-lg hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Selected</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NotesGrid
        notes={notes}
        onUpdate={handleUpdateNote}
        onDelete={handleDeleteNote}
        editingNoteId={editingNoteId}
        setEditingNoteId={setEditingNoteId}
        isUpdating={isUpdating}
        setIsUpdating={setIsUpdating}
        onNoteClick={handleNoteClick}
        canEditOrDelete={true}
        currentUserUid={currentUserUid}
        selectedNotes={selectedNotes}
        onSelectNote={handleSelectNote}
      />

      {selectedNote && (
        <NoteReader note={selectedNote} onClose={handleCloseReader} />
      )}
    </div>
  );
} 