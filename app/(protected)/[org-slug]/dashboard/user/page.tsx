// app/(protected)/[org-slug]/dashboard/user/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Import reusable components
import NoteForm from '@/components/usercomponents/NoteForm';
import NotesGrid from '@/components/usercomponents/NotesGrid';
import NoteReader from '@/components/usercomponents/NotesReader';

interface Note {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  is_public: boolean; // Ensured this exists
  created_at: string;
  updated_at: string | null; // Ensured this exists and allows null
  user_id: string | null;
  organization_slug: string | null; // Ensured this exists and allows null
}

export default function Page({ params }: { params: Promise<{ "org-slug": string }> }) {
  const [orgSlug, setOrgSlug] = useState<string>('');

  useEffect(() => {
    params.then((resolvedParams) => {
      setOrgSlug(resolvedParams["org-slug"]);
    });
  }, [params]);

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null); // New state for user's name/email

  const supabase = createClientComponentClient();
  const router = useRouter();

 useEffect(() => {
  fetchNotes();
  const fetchUserUidAndName = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserUid(user.id);
      // Set user name from user_metadata.full_name or fallback to email (without @gmail.com)
      let userName = user.user_metadata?.full_name || user.email;
      if (userName.includes('@gmail.com')) {
        userName = userName.split('@')[0]; // Remove everything after the @
      }
      setCurrentUserName(userName);
    }
  };
  fetchUserUidAndName();
}, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
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

  const handleCreateNote = async (title: string, description: string | null, content: string | null) => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setIsUpdating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notes')
        .insert([
          {
            title,
            description,
            content,
            is_public: false,
            user_id: user.id,
            organization_slug: orgSlug, // Used orgSlug which is unwrapped from params
          },
        ]);

      if (error) throw error;

      toast.success('Note created successfully!');
      setIsCreating(false);
      fetchNotes();
    } catch (error: any) {
      console.error('Error creating note:', error);
      toast.error('Error creating note: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateNote = async (id: string, title: string, description: string | null, content: string | null) => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('notes')
        .update({ title, description, content, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast.success('Note updated successfully!');
      setEditingNoteId(null);
      fetchNotes();
    } catch (error: any) {
      console.error('Error updating note:', error);
      toast.error('Error updating note: ' + error.message);
    } finally {
      setIsUpdating(false);
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
        .eq('id', noteId);

      if (error) throw error;

      toast.success('Note deleted successfully!');
      setNotes(notes.filter((note) => note.id !== noteId));
      if (selectedNote && selectedNote.id === noteId) {
        setSelectedNote(null);
      }
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
        router.push('/login');
      }
    } catch (error: any) {
      console.error('Unexpected logout error:', error);
      toast.error('An unexpected error occurred during logout.');
    }
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
  };

  const handleCloseReader = () => {
    setSelectedNote(null);
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-50 to-pink-50 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-6 rounded-lg shadow-md border-b-4 border-purple-500">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 md:mb-0">
            {currentUserName ? (
              <>
                <span className="text-purple-600">Welcome to </span> {currentUserName}!
              </>
            ) : (
              <span className="text-purple-600">My</span>
            )}{' '}
            Notes
          </h1>
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            <button
              onClick={handleExportNotes}
              className="px-6 py-3 bg-green-600 text-white rounded-full font-semibold shadow-lg hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Export All Notes</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-full font-semibold shadow-lg hover:bg-red-700 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h6a1 1 0 110 2H4v10h12V8a1 1 0 112 0v10a2 2 0 01-2 2H4a2 2 0 01-2-2V3zm9.3-1.3a1 1 0 011.4 0l3 3a1 1 0 010 1.4l-3 3a1 1 0 01-1.4-1.4L13.59 9H8a1 1 0 110-2h5.59l-1.3-1.3a1 1 0 010-1.4z" clipRule="evenodd" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Create Note Form Button */}
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="mb-8 px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold shadow-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Create New Note</span>
          </button>
        )}

        {/* Create/Edit Note Form */}
        {isCreating && (
          <div className="mb-8">
            <NoteForm
              onSubmit={handleCreateNote}
              onCancel={() => setIsCreating(false)}
              isSubmitting={isUpdating}
              submitButtonText="Save Note"
              titlePlaceholder="Note Title"
              descriptionPlaceholder="A brief description of your note (optional)"
              contentPlaceholder="Start writing your note here..."
              isCreateMode={true}
            />
          </div>
        )}

        {editingNoteId && (
          <div className="mb-8">
            <NoteForm
              initialTitle={notes.find(note => note.id === editingNoteId)?.title || ''}
              initialDescription={notes.find(note => note.id === editingNoteId)?.description || ''}
              initialContent={notes.find(note => note.id === editingNoteId)?.content || ''}
              onSubmit={(title, description, content) => handleUpdateNote(editingNoteId, title, description, content)}
              onCancel={() => setEditingNoteId(null)}
              isSubmitting={isUpdating}
              submitButtonText="Update Note"
              titlePlaceholder="Note Title"
              descriptionPlaceholder="A brief description of your note (optional)"
              contentPlaceholder="Start writing your note here..."
              isCreateMode={false}
            />
          </div>
        )}

        {/* Notes List */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-5 text-gray-800 border-b pb-3">My Notes</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
              <p className="text-lg">No notes found. Start by creating your first note above!</p>
            </div>
          ) : (
            <NotesGrid
              notes={notes}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
              editingNoteId={editingNoteId}
              setEditingNoteId={setEditingNoteId}
              isUpdating={isUpdating}
              setIsUpdating={setIsUpdating}
              onNoteClick={handleNoteClick}
              currentUserUid={currentUserUid}
            />
          )}
        </div>
      </div>

      {/* Note Reader Modal */}
      {selectedNote && (
        <NoteReader note={selectedNote} onClose={handleCloseReader} />
      )}
    </div>
  );
}