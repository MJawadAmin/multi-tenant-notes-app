'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast'; // Changed from 'react-toastify' to 'react-hot-toast'
import { motion } from 'framer-motion';
// No need for 'react-toastify/dist/ReactToastify.css' if only using 'react-hot-toast'
// import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '@/lib/supabase';
// No need for useEffect here if not used
// import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // error state is no longer needed as react-hot-toast will handle messages
  // const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const handleLogin = async () => {
    setLoading(true); // Start loading

    if (!email || !password) {
      // setError('Email and password are required.'); // Replaced by toast
      toast.error('Email and password are required.');
      setLoading(false); // Stop loading
      return;
    }

    const { data: loginData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // setError(authError.message); // Replaced by toast
      toast.error('Login failed: ' + authError.message);
      setLoading(false); // Stop loading
      return;
    }

    // Check if user data is available from the login attempt
    if (!loginData.user) {
        toast.error('Authentication successful, but user data not found. Please try again.');
        setLoading(false);
        return;
    }

    // Fetch the user's role and org slug from your users table using the user's ID
    // This is the CRUCIAL CHANGE: using loginData.user.id instead of email
    const {
      data: userData,
      error: userProfileError,
    } = await supabase
      .from('users') // your custom user table
      .select('role, organization_slug') // Ensure this matches your column name 'organization_slug' (not 'org_slug')
      .eq('id', loginData.user.id) // <--- FIX IS HERE: Filter by the user's ID
      .single();

    if (userProfileError || !userData) {
      console.error('Error fetching user profile:', userProfileError); // Log the actual error for debugging
      let errorMessage = 'User role or organization not found.';
      if (userProfileError?.code === '42501') {
          errorMessage = 'Permission denied (RLS issue). Check your RLS policies for `public.users` SELECT.';
      } else if (userProfileError?.details?.includes('zero rows')) {
          errorMessage = 'User profile does not exist in the `public.users` table. Ensure signup trigger works.';
      }
      toast.error(errorMessage);
      setLoading(false);
      return;
    }

    // Ensure the column name here matches your database column: 'organization_slug'
    const { role, organization_slug } = userData;

    toast.success('Logged in successfully!');
    setLoading(false); // Stop loading after success

    setTimeout(() => {
      // Use the correct variable name: organization_slug
      router.push(`/app/(protected)/${organization_slug}/dashboard/${role}`);
    }, 1000);
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

          {/* Error display no longer uses local error state. Toast handles it. */}
          {/* {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mb-4 text-center"
            >
              {error}
            </motion.p>
          )} */}

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
              disabled={loading} // Disable input while loading
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
                disabled={loading} // Disable input while loading
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white" // Corrected text color for eye icon
                disabled={loading} // Disable button while loading
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
              disabled={loading} // Disable button while loading
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
            Don’t have an account?{' '}
            <a href="/signup" className="text-indigo-400 underline">
              Sign up
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}