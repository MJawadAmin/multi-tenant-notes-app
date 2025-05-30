'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      // 2. Fetch user's role and organization from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, organization_slug')
        .eq('id', authData.user.id)
        .single();

      if (userError) throw userError;

      if (!userData) {
        throw new Error('User profile not found');
      }

      // 3. Redirect based on role
      const { role, organization_slug } = userData;
      const redirectPath = `/${organization_slug}/dashboard/${role}`;
      
      toast.success('Login successful!');
      router.push(redirectPath);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Toastify is replaced by react-hot-toast. The <Toaster /> component should be in your RootLayout. */}
      {/* <ToastContainer position="top-right" autoClose={3000} /> */}

      {/* Background Image */}
      <Image
        src="/book.png" // Make sure this path is correct
        alt="Background"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        {/* Back Arrow */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-6 left-6 text-white hover:text-indigo-400 transition"
          aria-label="Back to Home"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Animated Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md bg-[#0e131fcc] backdrop-blur-md p-8 rounded-xl text-white shadow-xl"
        >
          {/* Animated Title */}
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-bold mb-8 text-center"
          >
            Log in
          </motion.h1>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
            className="space-y-4"
          >
            {/* Email */}
            <motion.input
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-transparent text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />

            {/* Password */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              className="relative"
            >
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-md bg-transparent text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </motion.div>

            {/* Forgot Password */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              className="flex justify-between text-sm text-gray-300"
            >
              <a href="/reset-password" className="hover:underline">
                Forgot password?
              </a>
            </motion.div>

            {/* Login Button */}
            <motion.button
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              onClick={handleLogin}
              className="w-full py-3 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </motion.button>
          </motion.div>

          {/* Signup Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-gray-300 mt-6 text-center"
          >
            Don't have an account?{' '}
            <a href="/signup" className="text-indigo-400 underline">
              Sign up
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}