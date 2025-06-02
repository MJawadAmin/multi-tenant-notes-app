// app/(home)/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';

import NotesGrid from '@/components/notes/NotesGrid';
import NoteReader from '@/components/notes/NoteReader';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';

interface Note {
  id: string;
  created_at: string;
  updated_at: string | null;
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
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);

  const PUBLIC_ORG_SLUG = 'public-notes';

  // Function to download a single note as PDF
  const handleDownloadSingleNote = async (note: Note) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yOffset = 20;
      const lineHeight = 7;

      // Add title
      doc.setFontSize(20);
      doc.text('Note Details', pageWidth / 2, yOffset, { align: 'center' });
      yOffset += lineHeight * 2;

      // Add note title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(note.title, pageWidth - (margin * 2));
      doc.text(titleLines, margin, yOffset);
      yOffset += lineHeight * titleLines.length + lineHeight;

      // Add description if exists
      if (note.description) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const descriptionLines = doc.splitTextToSize(note.description, pageWidth - (margin * 2));
        
        if (yOffset + (lineHeight * descriptionLines.length) > pageHeight - margin) {
          doc.addPage();
          yOffset = margin;
        }
        
        doc.text(descriptionLines, margin, yOffset);
        yOffset += lineHeight * descriptionLines.length + lineHeight;
      }

      // Add content if exists
      if (note.content) {
        doc.setFontSize(11);
        const contentLines = doc.splitTextToSize(note.content, pageWidth - (margin * 2));
        
        let currentLine = 0;
        while (currentLine < contentLines.length) {
          if (yOffset + lineHeight > pageHeight - margin) {
            doc.addPage();
            yOffset = margin;
          }
          
          const linesPerPage = Math.floor((pageHeight - yOffset - margin) / lineHeight);
          const linesToAdd = Math.min(linesPerPage, contentLines.length - currentLine);
          
          doc.text(contentLines.slice(currentLine, currentLine + linesToAdd), margin, yOffset);
          yOffset += lineHeight * linesToAdd;
          currentLine += linesToAdd;
        }
      }

      // Add metadata on a new page
      doc.addPage();
      yOffset = margin;
      doc.setFontSize(10);
      doc.text(`Created: ${new Date(note.created_at).toLocaleString()}`, margin, yOffset);
      yOffset += lineHeight;
      if (note.updated_at) {
        doc.text(`Last Updated: ${new Date(note.updated_at).toLocaleString()}`, margin, yOffset);
      }

      // Save the PDF
      const fileName = `note-${note.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

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
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yOffset = 20;
      const lineHeight = 7;

      // Add title
      doc.setFontSize(20);
      doc.text('Selected Notes Collection', pageWidth / 2, yOffset, { align: 'center' });
      yOffset += lineHeight * 2;

      // Add export info
      doc.setFontSize(12);
      doc.text(`Exported on: ${new Date().toLocaleString()}`, margin, yOffset);
      yOffset += lineHeight * 2;

      // Add notes
      notes
        .filter(note => selectedNotes.includes(note.id))
        .forEach((note, index) => {
          // Always start a new note on a new page
          if (index > 0) {
            doc.addPage();
            yOffset = margin;
          }

          // Add note title
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          const titleLines = doc.splitTextToSize(`${index + 1}. ${note.title}`, pageWidth - (margin * 2));
          doc.text(titleLines, margin, yOffset);
          yOffset += lineHeight * titleLines.length + lineHeight;

          // Add description if exists
          if (note.description) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            const descriptionLines = doc.splitTextToSize(note.description, pageWidth - (margin * 2));
            
            if (yOffset + (lineHeight * descriptionLines.length) > pageHeight - margin) {
              doc.addPage();
              yOffset = margin;
            }
            
            doc.text(descriptionLines, margin, yOffset);
            yOffset += lineHeight * descriptionLines.length + lineHeight;
          }

          // Add content if exists
          if (note.content) {
            doc.setFontSize(11);
            const contentLines = doc.splitTextToSize(note.content, pageWidth - (margin * 2));
            
            let currentLine = 0;
            while (currentLine < contentLines.length) {
              if (yOffset + lineHeight > pageHeight - margin) {
                doc.addPage();
                yOffset = margin;
              }
              
              const linesPerPage = Math.floor((pageHeight - yOffset - margin) / lineHeight);
              const linesToAdd = Math.min(linesPerPage, contentLines.length - currentLine);
              
              doc.text(contentLines.slice(currentLine, currentLine + linesToAdd), margin, yOffset);
              yOffset += lineHeight * linesToAdd;
              currentLine += linesToAdd;
            }
          }

          // Add metadata
          doc.addPage();
          yOffset = margin;
          doc.setFontSize(10);
          doc.text(`Created: ${new Date(note.created_at).toLocaleString()}`, margin, yOffset);
          yOffset += lineHeight;
          if (note.updated_at) {
            doc.text(`Last Updated: ${new Date(note.updated_at).toLocaleString()}`, margin, yOffset);
          }
        });

      // Save the PDF
      const fileName = `selected-notes-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

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
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSelectAll}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all duration-300
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
                className="px-6 py-3 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 flex items-center gap-2"
              >
                <span>Download Selected ({selectedNotes.length})</span>
                <Download size={18} />
              </motion.button>
            )}
          </div>
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
          canEditOrDelete={false}
          currentUserUid={null}
          onDownload={handleDownloadSingleNote}
          selectedNotes={selectedNotes}
          onSelectNote={handleSelectNote}
        />
      </div>

      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">{selectedNote.title}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadSingleNote(selectedNote)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => setSelectedNote(null)}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto flex-grow">
                <NoteReader note={selectedNote} onClose={() => setSelectedNote(null)} />
              </div>
            </div>
          </div>
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
