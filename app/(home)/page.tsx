// app/(home)/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Download } from 'lucide-react';
import { generateSingleNotePDF, generateMultipleNotesPDF } from '@/utils/pdfGenerator';

import NotesGrid from '@/components/notes/NotesGrid';
import NoteReader from '@/components/notes/NoteReader';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import { Note } from '@/types/note';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);

  const PUBLIC_ORG_SLUG = 'public-notes';

  // Function to download a single note as PDF
  const handleDownloadSingleNote = async (note: Note) => {
    try {
      await generateSingleNotePDF(note, {
        title: 'Note Details',
        includeMetadata: true,
        fileName: `note-${note.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
      });
      toast.success('Note downloaded successfully!');
    } catch (error: any) {
      console.error('Error downloading note:', error);
      toast.error('Error downloading note: ' + error.message);
    }
  };

  // Function to download selected notes as PDF
  const handleDownloadSelectedNotes = async () => {
    if (selectedNotes.length === 0) {
      toast.error('Please select at least one note to download');
      return;
    }

    try {
      const selectedNotesList = notes.filter(note => selectedNotes.includes(note.id));
      await generateMultipleNotesPDF(selectedNotesList, {
        title: 'Selected Notes Collection',
        includeMetadata: true,
        fileName: `selected-notes-${new Date().toISOString().split('T')[0]}.pdf`
      });
      toast.success('Selected notes downloaded successfully!');
    } catch (error: any) {
      console.error('Error downloading notes:', error);
      toast.error('Error downloading notes: ' + error.message);
    }
  };

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
      className="min-h-screen flex flex-col items-center p-2 sm:p-2 md:p-2 lg:p-2 bg-gradient-to-br from-blue-50 to-indigo-100 relative"
    >
      {/* Background Texture */}
      <div 
        className="absolute inset-0 z-0 bg-repeat opacity-10" 
        style={{ 
          backgroundImage: 'url("/paper-texture.png")', 
          backgroundSize: '200px' 
        }}
      />

      {/* Header Section */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center space-y-2 sm:space-y-2 md:space-y-3 ">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
        >
          <Image 
            src="/Logo.png" 
            alt="Logo" 
            width={112} 
            height={112} 
            className="w-full h-full object-contain"
          />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-indigo-800 text-center px-4">
          Public Notes Whiteboard
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-indigo-700 max-w-xl text-center px-4">
          View and read public notes. Sign in to create and manage your own notes.
        </p>
      </div>

      {/* Main Content Section */}
      <div className="relative z-10 w-full max-w-7xl mx-auto mt-3 sm:mt-3 md:mt-3 mb-8 sm:mb-12 md:mb-16">
        <div className="bg-white shadow-xl rounded-lg border border-gray-200 p-4 sm:p-6 md:p-8">
          {/* Header with Actions */}
          <header className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 text-center sm:text-left">
              Global Notes Board
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSelectAll}
                className={`
                  w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300
                  ${selectedNotes.length === 0 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }
                `}
              >
                {selectedNotes.length === 0 ? 'Select All' : 'Deselect All'}
              </motion.button>

              {selectedNotes.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadSelectedNotes}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Download Selected ({selectedNotes.length})</span>
                  <Download size={18} />
                </motion.button>
              )}
            </div>
          </header>

          {/* Notes Grid */}
          <NotesGrid
            notes={notes}
            onUpdate={async () => Promise.resolve()}
            onDelete={async () => Promise.resolve()}
            editingNoteId={null}
            setEditingNoteId={() => {}}
            isUpdating={false}
            setIsUpdating={() => {}}
            onNoteClick={handleNoteClick}
            canEditOrDelete={false}
            currentUserUid={null}
            onDownload={handleDownloadSingleNote}
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
                  <button
                    onClick={() => handleDownloadSingleNote(selectedNote)}
                    className="flex-1 sm:flex-none bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => setSelectedNote(null)}
                    className="flex-1 sm:flex-none bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto flex-grow">
                <NoteReader note={selectedNote} onClose={() => setSelectedNote(null)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="relative z-10 text-sm sm:text-base text-gray-600 mt-6 sm:mt-8 text-center px-4">
        Want to create and manage your own notes?{' '}
        <a href="/login" className="text-indigo-600 hover:underline">
          Log in or Sign up
        </a>
        .
      </div>
    </motion.div>
  );
}
