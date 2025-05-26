'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!session || sessionError) {
        router.push('/login');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      const { data: profile, error: profileError } = await supabase
        .from('profiles') // Make sure you have a 'profiles' table with username
        .select('username')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError.message);
        return;
      }

      setUsername(profile?.username || user?.email?.split('@')[0]);
    };

    getUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome, <span className="text-green-600">{username}</span> 👋
        </h1>
        <p className="text-gray-600">
          This is your dashboard. Explore features and manage your account here.
        </p>
      </motion.div>
    </div>
  );
}
