'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import { motion } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import {supabase } from '@/lib/supabase'; // Ensure you have supabase client set up
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
const handleLogin = async () => {
  if (email === '' || password === '') {
    setError('Email and password are required.');
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    toast.error('Login failed: ' + error.message);
    return;
  }

  toast.success('Logged in successfully!');
  setTimeout(() => {
    router.push('/dashboard');
  }, 1000);
};
useEffect(() => {
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push('/dashboard'); // already logged in
    }
  };
  checkUser();
}, []);


  return (
    <div className="relative min-h-screen w-full">
      {/* Toastify */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Background Image */}
      <Image
        src="/book.png"
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

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mb-4 text-center"
            >
              {error}
            </motion.p>
          )}

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
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-800 hover:text-gray-500"
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
              className="w-full py-3 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 transition"
            >
              Log in
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
