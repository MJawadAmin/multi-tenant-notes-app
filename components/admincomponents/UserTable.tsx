// components/UserTable.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  organization_slug: string;
}

interface UserTableProps {
  users: User[];
  title: string;
  loading: boolean;
  currentUserId: string | null;
  onDeleteUser: (userId: string, userEmail: string, userRole: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, title, loading, currentUserId, onDeleteUser }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-xl p-6 mb-8 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">{title}</h2>
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading {title.toLowerCase()}...</p>
        </div>
      ) : users.length === 0 ? (
        <motion.div
          className="text-center py-8 text-gray-500 bg-gray-50 rounded-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg">No {title.toLowerCase()} found.</p>
        </motion.div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                  variants={itemVariants}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 font-semibold">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <motion.button
                      onClick={() => onDeleteUser(user.id, user.email, user.role)}
                      className={`text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded-md transition-colors duration-200
                        ${user.id === currentUserId ? 'opacity-40 cursor-not-allowed bg-gray-100' : 'hover:bg-red-50'}
                      `}
                      disabled={user.id === currentUserId}
                      whileHover={{ scale: user.id === currentUserId ? 1 : 1.05 }}
                      whileTap={{ scale: user.id === currentUserId ? 1 : 0.95 }}
                    >
                      Delete
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default UserTable;