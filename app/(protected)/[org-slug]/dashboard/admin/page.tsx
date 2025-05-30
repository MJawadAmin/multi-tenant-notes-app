// app/admin/[org-slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import { use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection

// Import reusable components
import UserTable from '@/components/admincomponents/UserTable';
import InviteUserForm from '@/components/admincomponents/InviteUserForm';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
  organization_slug: string;
}

interface InviteForm {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export default function AdminDashboard({ params }: { params: Promise<{ 'org-slug': string }> }) {
  const resolvedParams = use(params);
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter(); // Initialize useRouter

  const organizationSlug = resolvedParams['org-slug'];

  useEffect(() => {
    fetchCurrentUser();
  }, []); // Fetch current user only once on component mount

  useEffect(() => {
    if (organizationSlug) {
      fetchUsers();
    }
  }, [organizationSlug]); // Re-fetch users when org-slug changes

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error: any) {
      console.error('Error fetching current user:', error);
      toast.error('Error fetching current user: ' + error.message);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log('Fetching users for organization:', organizationSlug);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_slug', organizationSlug)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching organization users:', error);
        throw error;
      }

      console.log('Fetched users for organization:', data);

      const adminUsers = data?.filter(user => user.role === 'admin') || [];
      const regularUsers = data?.filter(user => user.role !== 'admin') || [];

      setAdmins(adminUsers);
      setUsers(regularUsers);
    } catch (error: any) {
      console.error('Error in fetchUsers:', error);
      toast.error('Error fetching users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (inviteForm: InviteForm) => {
    if (!inviteForm.email || !inviteForm.role) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      console.log('Inviting user:', inviteForm.email, 'with role:', inviteForm.role);

      // 1. Create the user in auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
        inviteForm.email,
        {
          data: {
            role: inviteForm.role,
            organization_slug: organizationSlug
          }
        }
      );

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      console.log('Auth user created:', authData);

      // 2. Create the user record in our users table
      const { error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: inviteForm.email,
            role: inviteForm.role,
            organization_slug: organizationSlug
          }
        ]);

      if (userError) {
        console.error('User creation error:', userError);
        // Consider rolling back auth user creation if user table insert fails
        throw userError;
      }

      toast.success('User invited successfully! An invitation email has been sent.');
      setShowInviteForm(false);
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      console.error('Error in handleInviteUser:', error);
      toast.error('Error inviting user: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string, userRole: string) => {
    // Prevent deleting own account
    if (userId === currentUserId) {
      toast.error('You cannot delete your own account.');
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone. Public notes will be reassigned, and private notes will be deleted.`)) {
      return;
    }

    try {
      // 1. Get all notes for the user
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId);

      if (notesError) throw notesError;

      // 2. Create export data
      const exportData = {
        user_email: userEmail,
        deleted_by_admin: currentUserId,
        timestamp: new Date().toISOString(),
        notes: notes
      };

      // 3. Create and download export file for the user's notes
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notes-export-${userEmail}-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast('Downloading user notes backup...', { icon: '💾' });


      // 4. Reassign public notes to the current admin
      const { error: reassignError } = await supabase
        .from('notes')
        .update({ user_id: currentUserId })
        .eq('user_id', userId)
        .eq('is_public', true); // Only reassign public notes

      if (reassignError) {
        console.error('Error reassigning public notes:', reassignError);
        throw reassignError;
      }
      toast.success('Public notes reassigned to your account.');

      // 5. Delete private notes (is_public: false)
      const { error: deletePrivateError } = await supabase
        .from('notes')
        .delete()
        .eq('user_id', userId)
        .eq('is_public', false);

      if (deletePrivateError) {
        console.error('Error deleting private notes:', deletePrivateError);
        throw deletePrivateError;
      }
      toast.success('Private notes deleted.');

      // 6. Delete the user record from our 'users' table
      const { error: userTableDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (userTableDeleteError) {
        console.error('Error deleting user from users table:', userTableDeleteError);
        throw userTableDeleteError;
      }
      toast.success('User removed from organization records.');

      // 7. Delete the user from Supabase Auth (this is the final step)
      // This requires service_role key for admin actions, which is usually done on the server.
      // For client-side, you'd typically have a serverless function proxy this.
      // If `supabase.auth.admin.deleteUser` requires `service_role` key, this won't work directly from client.
      // A more robust solution involves a server-side API route.
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
      if (authDeleteError) {
        console.error('Error deleting user from Auth:', authDeleteError);
        throw authDeleteError;
      }
      toast.success('User account deleted from authentication system.');

      fetchUsers(); // Refresh the user list
      toast.success('User and their notes successfully managed/deleted!');
    } catch (error: any) {
      console.error('Error in handleDeleteUser:', error);
      toast.error('Error deleting user: ' + error.message);
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
        // Redirect to the login page
        router.push('/login'); // Adjust '/login' to your actual login page path
      }
    } catch (error: any) {
      console.error('Unexpected logout error:', error);
      toast.error('An unexpected error occurred during logout.');
    }
  };


  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-10 bg-white p-6 rounded-lg shadow-md border-b-4 border-indigo-500"
        >
          <h1 className="text-4xl font-extrabold text-gray-900">
            <span className="text-indigo-600">Admin</span> Dashboard
            <span className="block text-sm font-normal text-gray-500 mt-1">Organization: {organizationSlug}</span>
          </h1>
          <div className="flex items-center space-x-4"> {/* Container for buttons */}
            <motion.button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold shadow-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>{showInviteForm ? 'Close Form' : 'Invite New User'}</span>
            </motion.button>

            <motion.button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-full font-semibold shadow-lg hover:bg-red-700 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2"
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

        {/* Invite User Form */}
        <AnimatePresence>
          {showInviteForm && (
            <InviteUserForm onInvite={handleInviteUser} onCancel={() => setShowInviteForm(false)} />
          )}
        </AnimatePresence>

        {/* Admins List */}
        <UserTable
          users={admins}
          title="Administrators"
          loading={loading}
          currentUserId={currentUserId}
          onDeleteUser={handleDeleteUser}
        />

        {/* Regular Users List */}
        <UserTable
          users={users}
          title="Members"
          loading={loading}
          currentUserId={currentUserId}
          onDeleteUser={handleDeleteUser}
        />
      </div>
    </div>
  );
}