// app/user/[org-slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation'; // Import useRouter

// Import reusable components
import NoteForm from '@/components/usercomponents/NoteForm'; // Adjust path as needed
import NoteCard from '@/components/usercomponents/NoteCard'; // Adjust path as needed

interface Note {
  id: string;
  title: string;
  content: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function UserDashboard({ params }: { params: { 'org-slug': string } }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter(); // Initialize useRouter

  // The organization slug from params can be used if needed for user-specific features related to their org
  // const organizationSlug = params['org-slug'];

  useEffect(() => {
    fetchNotes();
  }, []); // Empty dependency array means this runs once on mount

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // If no user, redirect to login (or handle as unauthorized)
        router.push('/login'); // Adjust to your login page path
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      console.error('Error fetching notes:', error);
      toast.error('Error fetching notes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (noteData: { title: string; content: string; is_public: boolean }) => {
    if (!noteData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notes')
        .insert([
          {
            title: noteData.title,
            content: noteData.content,
            is_public: noteData.is_public,
            user_id: user.id,
          },
        ]);

      if (error) throw error;

      toast.success('Note created successfully!');
      fetchNotes(); // Re-fetch notes to update the list
    } catch (error: any) {
      console.error('Error creating note:', error);
      toast.error('Error creating note: ' + error.message);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId); // Ensure RLS policies prevent deleting other users' notes

      if (error) throw error;

      toast.success('Note deleted successfully!');
      setNotes(notes.filter((note) => note.id !== noteId)); // Optimistic UI update
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error('Error deleting note: ' + error.message);
    }
  };

  const handleExportNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userNotes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const exportData = {
        user_email: user.email,
        timestamp: new Date().toISOString(),
        notes: userNotes,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notes-export-${user.email}-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Notes exported successfully!');
    } catch (error: any) {
      console.error('Error exporting notes:', error);
      toast.error('Error exporting notes: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error('Error logging out: ' + error.message);
      } else {
        toast.success('Successfully logged out!');
        router.push('/login'); // Redirect to your login page
      }
    } catch (error: any) {
      console.error('Unexpected logout error:', error);
      toast.error('An unexpected error occurred during logout.');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-50 to-pink-50 font-sans">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-6 rounded-lg shadow-md border-b-4 border-purple-500"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 md:mb-0">
            <span className="text-purple-600">My</span> Notes
          </h1>
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            <motion.button
              onClick={handleExportNotes}
              className="px-6 py-3 bg-green-600 text-white rounded-full font-semibold shadow-lg hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Export All Notes</span>
            </motion.button>
            <motion.button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-full font-semibold shadow-lg hover:bg-red-700 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h6a1 1 0 110 2H4v10h12V8a1 1 0 112 0v10a2 2 0 01-2 2H4a2 2 0 01-2-2V3zm9.3-1.3a1 1 0 011.4 0l3 3a1 1 0 010 1.4l-3 3a1 1 0 01-1.4-1.4L13.59 9H8a1 1 0 110-2h5.59l-1.3-1.3a1 1 0 010-1.4z" clipRule="evenodd" />
              </svg>
              <span>Logout</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Create Note Form */}
        <NoteForm onSubmit={handleCreateNote} className="mb-8" submitButtonText="Create Note" />

        {/* Notes List */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-5 text-gray-800 border-b pb-3">My Notes</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <motion.div
              className="text-center py-8 text-gray-500 bg-gray-50 rounded-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-lg">No notes found. Start by creating your first note above!</p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              <AnimatePresence>
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}