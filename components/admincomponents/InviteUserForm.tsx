// components/InviteUserForm.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface InviteFormProps {
  onInvite: (formData: { email: string; role: 'admin' | 'editor' | 'viewer' }) => Promise<void>;
  onCancel: () => void;
}

export default function InviteUserForm({ onInvite, onCancel }: InviteFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await onInvite({ email: email.trim(), role });
    } catch (error) {
      console.error('Error inviting user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-xl p-6 mb-8"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Invite New User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="user@example.com"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'editor' | 'viewer')}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isSubmitting}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {role === 'admin' && 'Admins can manage users and organization settings'}
            {role === 'editor' && 'Editors can create and edit notes'}
            {role === 'viewer' && 'Viewers can only view notes'}
          </p>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <motion.button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending Invite...' : 'Send Invite'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}