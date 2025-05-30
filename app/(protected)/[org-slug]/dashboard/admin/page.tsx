'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import { use } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
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
  const [inviteForm, setInviteForm] = useState<InviteForm>({ email: '', role: 'viewer' });
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, [resolvedParams['org-slug']]);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error: any) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users for organization:', resolvedParams['org-slug']);
      
      // First, let's check all users without organization filter
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('*');

      if (allUsersError) {
        console.error('Error fetching all users:', allUsersError);
      } else {
        console.log('All users in database:', allUsers);
      }

      // Now fetch users for the specific organization
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_slug', resolvedParams['org-slug'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching organization users:', error);
        throw error;
      }

      console.log('Fetched users for organization:', data);

      // Log each user's role and organization
      data?.forEach(user => {
        console.log(`User: ${user.email}, Role: ${user.role}, Organization: ${user.organization_slug}`);
      });

      // Separate users and admins
      const adminUsers = data?.filter(user => user.role === 'admin') || [];
      const regularUsers = data?.filter(user => user.role !== 'admin') || [];

      console.log('Admin users:', adminUsers);
      console.log('Regular users:', regularUsers);

      // Check if any users are missing organization_slug
      const usersWithoutOrg = data?.filter(user => !user.organization_slug);
      if (usersWithoutOrg?.length > 0) {
        console.warn('Users without organization_slug:', usersWithoutOrg);
      }

      setAdmins(adminUsers);
      setUsers(regularUsers);
    } catch (error: any) {
      console.error('Error in fetchUsers:', error);
      toast.error('Error fetching users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
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
            organization_slug: resolvedParams['org-slug']
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
            organization_slug: resolvedParams['org-slug']
          }
        ]);

      if (userError) {
        console.error('User creation error:', userError);
        throw userError;
      }

      toast.success('User invited successfully');
      setInviteForm({ email: '', role: 'viewer' });
      setShowInviteForm(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error in handleInviteUser:', error);
      toast.error('Error inviting user: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string, userRole: string) => {
    // Prevent deleting own account
    if (userId === currentUserId) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (!confirm('Are you sure you want to delete this user? They will be able to export their notes before deletion.')) {
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
        user: userEmail,
        timestamp: new Date().toISOString(),
        notes: notes
      };

      // 3. Create and download export file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notes-export-${userEmail}-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // 4. Reassign public notes to admin
      const { error: reassignError } = await supabase
        .from('notes')
        .update({ user_id: currentUserId })
        .eq('user_id', userId)
        .eq('is_public', true);

      if (reassignError) throw reassignError;

      // 5. Delete private notes
      const { error: deletePrivateError } = await supabase
        .from('notes')
        .delete()
        .eq('user_id', userId)
        .eq('is_public', false);

      if (deletePrivateError) throw deletePrivateError;

      // 6. Delete the user
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (userError) throw userError;

      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error('Error deleting user: ' + error.message);
    }
  };

  const renderUserTable = (users: User[], title: string) => (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {loading ? (
        <div className="text-center py-4">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No {title.toLowerCase()} found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email, user.role)}
                      className={`text-red-600 hover:text-red-900 ${user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={user.id === currentUserId}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {showInviteForm ? 'Cancel' : 'Invite User'}
          </button>
        </div>

        {/* Invite User Form */}
        {showInviteForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Invite New User</h2>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  id="role"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as 'admin' | 'editor' | 'viewer' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Send Invitation
              </button>
            </form>
          </div>
        )}
        
        {/* Admins List */}
        {renderUserTable(admins, 'Administrators')}

        {/* Regular Users List */}
        {renderUserTable(users, 'Users')}
      </div>
    </div>
  );
} 