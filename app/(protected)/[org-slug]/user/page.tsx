'use client';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { NotesGrid } from '@/components/usercomponents/NotesGrid';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check } from 'lucide-react';
import { generateMultipleNotesPDF, generateSingleNotePDF } from '@/utils/pdfGenerator';
import { toast } from 'sonner';
import { Note } from '@/types/note';
import { motion, AnimatePresence } from 'framer-motion';
import NoteReader from '@/components/notes/NoteReader';

export default function UserDashboardPage({
  params,
}: {
  params: { 'org-slug': string };
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const fetchNotes = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          redirect('/login');
        }

        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotes(data || []);
      } catch (error) {
        console.error('Error fetching notes:', error);
        setError('Failed to fetch notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();

    const channel = supabase
      .channel('notes_changes')
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

  const handleSelectNote = (noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotes.length === notes.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(notes.map(note => note.id));
    }
  };

  const handleDownloadSelectedNotes = async () => {
    if (selectedNotes.length === 0) {
      toast.error('Please select at least one note to download');
      return;
    }

    try {
      const selectedNotesData = notes.filter(note => selectedNotes.includes(note.id));
      await generateMultipleNotesPDF(selectedNotesData, 'Selected Notes');
      toast.success('Notes downloaded successfully');
    } catch (error) {
      console.error('Error downloading notes:', error);
      toast.error('Failed to download notes');
    }
  };

  const handleDownloadSingleNote = async (note: Note) => {
    try {
      await generateSingleNotePDF(note, {
        title: 'Note Details',
        includeMetadata: true,
        fileName: `note-${note.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
      });
      toast.success('Note downloaded successfully');
    } catch (error) {
      console.error('Error downloading note:', error);
      toast.error('Failed to download note');
    }
  };

  const handleUpdateNote = async (id: string, title: string, description: string | null, content: string | null) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('notes')
        .update({ title, description, content, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setNotes(prev => prev.map(note => 
        note.id === id 
          ? { ...note, title, description, content, updated_at: new Date().toISOString() }
          : note
      ));
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  const handleDeleteNote = async (id: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== id));
      setSelectedNotes(prev => prev.filter(noteId => noteId !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Notes Collection
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage and organize your personal notes. Edit, delete, or download them as needed.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Your Notes</h2>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
                onClick={handleSelectAll}
              >
                <Check className="h-4 w-4 mr-2" />
                {selectedNotes.length === notes.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedNotes.length > 0 && (
                <Button
                  size="sm"
                  className="flex items-center"
                  onClick={handleDownloadSelectedNotes}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Selected ({selectedNotes.length})
                </Button>
              )}
            </div>
          </div>

          <NotesGrid
            notes={notes}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
            editingNoteId={editingNoteId}
            setEditingNoteId={setEditingNoteId}
            isUpdating={isUpdating}
            setIsUpdating={setIsUpdating}
            onNoteClick={handleNoteClick}
            currentUserUid={null}
            selectedNotes={selectedNotes}
            onSelectNote={handleSelectNote}
          />
        </div>
      </div>

      {/* Note Viewer Modal */}
      <AnimatePresence>
        {selectedNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-center sm:text-left">{selectedNote.title}</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => handleDownloadSingleNote(selectedNote)}
                    className="flex-1 sm:flex-none"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedNote(null)}
                    className="flex-1 sm:flex-none"
                  >
                    Close
                  </Button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto flex-grow">
                <NoteReader note={selectedNote} onClose={() => setSelectedNote(null)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 