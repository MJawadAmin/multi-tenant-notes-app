'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import { motion } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!username || !phone || !email || !password) {
      setError('All fields are required.');
      return;
    }

    setError('');
    toast.success('Account created successfully!');
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

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
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-bold mb-8 text-center"
          >
            Sign up
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
            {/* Username */}
            <motion.input
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-transparent text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* Phone Number */}
            <motion.input
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-transparent text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </motion.div>

            {/* Signup Button */}
            <motion.button
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              onClick={handleSignup}
              className="w-full py-3 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 transition"
            >
              Sign up
            </motion.button>
          </motion.div>

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-gray-300 mt-6 text-center"
          >
            Already have an account?{' '}
            <a href="/login" className="text-indigo-400 underline">
              Log in
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
