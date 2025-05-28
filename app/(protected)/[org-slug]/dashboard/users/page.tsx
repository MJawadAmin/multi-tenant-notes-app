'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Adjust path if needed
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building, Briefcase, LogOut } from 'lucide-react'; // Icons for the profile info

// Define a type for your user profile data
interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  phone: string | null;
  role: string;
  organization_slug: string;
  created_at: string;
}

export default function UserDashboardPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        // Not logged in or session expired
        toast.error('Please log in to view your dashboard.', { duration: 3000 });
        router.push('/login'); // Redirect to login
        setLoading(false);
        return;
      }

      // Fetch user profile from public.users table
      const { data, error: profileError } = await supabase
        .from('users')
        .select('id, email, username, phone, role, organization_slug, created_at')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        let errorMessage = 'Failed to load user profile.';
        if (profileError.code === '42501') {
          errorMessage = 'Permission denied (RLS). Ensure RLS policy for `public.users` SELECT is correct.';
        } else if (profileError.details?.includes('zero rows')) {
          errorMessage = 'User profile not found in database. Please contact support.';
        }
        setError(errorMessage);
        toast.error(errorMessage, { duration: 5000 });
        setLoading(false);
        return;
      }

      if (data) {
        setUserProfile(data);
      } else {
        setError('User profile data is empty.');
        toast.error('User profile data is empty. Please contact support.', { duration: 5000 });
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [router]); // Dependency array includes router

  const handleLogout = async () => {
    setLoading(true); // Indicate loading for logout
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) {
      toast.error('Logout failed: ' + logoutError.message, { duration: 3000 });
      setLoading(false); // Reset loading state
    } else {
      toast.success('Logged out successfully!', { duration: 2000 });
      router.push('/login'); // Redirect to login page
    }
  };

  // Framer Motion variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Delay between child animations
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-t-4 border-indigo-500 rounded-full"
        ></motion.div>
        <p className="ml-4 text-xl">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 text-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-red-800/30 border border-red-700 rounded-lg p-8 shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md transition duration-300"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 text-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-yellow-800/30 border border-yellow-700 rounded-lg p-8 shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p>No user profile data available. Please try logging in again or contact support.</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md transition duration-300"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 p-4">
      <motion.div
        className="w-full max-w-2xl bg-[#0e131fcc] backdrop-blur-md p-8 rounded-xl shadow-2xl text-white border border-gray-700"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.h1
          className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Welcome, {userProfile.username || 'User'}!
        </motion.h1>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Profile Info Items */}
          <motion.div variants={itemVariants} className="flex items-center space-x-4 bg-gray-800/50 p-4 rounded-lg">
            <User size={24} className="text-indigo-400" />
            <div>
              <p className="text-sm text-gray-400">Username</p>
              <p className="text-lg font-medium">{userProfile.username || 'N/A'}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center space-x-4 bg-gray-800/50 p-4 rounded-lg">
            <Mail size={24} className="text-indigo-400" />
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-lg font-medium">{userProfile.email}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center space-x-4 bg-gray-800/50 p-4 rounded-lg">
            <Phone size={24} className="text-indigo-400" />
            <div>
              <p className="text-sm text-gray-400">Phone</p>
              <p className="text-lg font-medium">{userProfile.phone || 'N/A'}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center space-x-4 bg-gray-800/50 p-4 rounded-lg">
            <Briefcase size={24} className="text-indigo-400" />
            <div>
              <p className="text-sm text-gray-400">Role</p>
              <p className="text-lg font-medium capitalize">{userProfile.role}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center space-x-4 bg-gray-800/50 p-4 rounded-lg">
            <Building size={24} className="text-indigo-400" />
            <div>
              <p className="text-sm text-gray-400">Organization</p>
              <p className="text-lg font-medium">{userProfile.organization_slug}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center space-x-4 bg-gray-800/50 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Member Since</p>
            <p className="text-lg font-medium">
              {userProfile.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </motion.div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full mt-8 py-3 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center space-x-2 transition-colors duration-300 shadow-lg"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}