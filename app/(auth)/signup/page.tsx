'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
// We are using react-hot-toast, so ToastContainer from 'react-toastify' is not needed.
// import { ToastContainer } from 'react-toastify';
import { toast } from 'react-hot-toast'; // Import toast from react-hot-toast
// import 'react-toastify/dist/ReactToastify.css'; // Not needed if only using react-hot-toast
import { motion } from 'framer-motion';

import { supabase } from '@/lib/supabase'; // Ensure this path is correct for your Supabase client

export default function SignupPage() {
  const router = useRouter();

  // State variables for form inputs
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user'); // Default role
  const [organizationSlug, setOrganizationSlug] = useState('default-org'); // Default organization slug
  const [loading, setLoading] = useState(false); // State for managing loading feedback and disabling button

  const handleSignup = async () => {
    setLoading(true); // Start loading state

    // 1. Client-side input validation
    if (!email || !password || !username || !phone || !organizationSlug) {
      toast.error('Please fill in all fields.', { duration: 3000 });
      setLoading(false); // Stop loading
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.', { duration: 3000 });
      setLoading(false); // Stop loading
      return;
    }

    try {
      // 2. Sign up the user with Supabase Auth
      // This call creates the user in Supabase's `auth.users` table.
      // Your database trigger (`on_auth_user_created`) will then automatically
      // create the corresponding entry in your `public.users` table.
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // IMPORTANT: This `emailRedirectTo` URL must be added to your Supabase project's
          // Authentication -> URL Configuration -> Redirect URLs.
          // For example: `http://localhost:3000/signup-success`
          // You should create a page at /signup-success to inform the user to check their email.
          emailRedirectTo: `${window.location.origin}/signup-success`,
        },
      });

      if (signUpError) {
        console.error('Supabase signup error:', signUpError);
        // Provide more context based on common signup errors
        if (signUpError.message.includes('already registered')) {
          toast.error('This email is already registered. Please log in or use a different email.', { duration: 5000 });
        } else if (signUpError.message.includes('password length')) {
          toast.error('Password must be at least 6 characters long.', { duration: 5000 });
        } else {
          toast.error(`Signup failed: ${signUpError.message}. Please check your Supabase Auth settings.`, { duration: 5000 });
        }
        setLoading(false);
        return;
      }

      // Check if a user object was returned.
      // If email confirmation is enabled in Supabase settings (recommended),
      // `signUpData.user` will be present, but `email_confirmed_at` will be null until they click the link.
      // `signUpData.session` will also be null if email confirmation is required and no auto-login occurs.
      if (signUpData.user?.email_confirmed_at === null) {
        // This path is taken when email confirmation is ON.
        toast.success('Account created! Please check your email to confirm your account and log in.', { duration: 7000 });
        router.push('/signup-success'); // Redirect to a page explaining email confirmation
      } else {
        // This path is usually taken if email confirmation is DISABLED in Supabase settings,
        // meaning the user is immediately signed up and logged in.
        toast.success('Signup successful! You are now logged in.', { duration: 5000 });
        router.push('/login'); // Or wherever your main authenticated area is
      }

    } catch (catchError: any) {
      // Catch any unexpected JavaScript errors during the process
      console.error('An unexpected error occurred during signup process:', catchError);
      toast.error(`An unexpected error occurred: ${catchError.message || 'Please try again.'}`, { duration: 5000 });
    } finally {
      setLoading(false); // Ensure loading state is reset regardless of success or failure
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* react-hot-toast uses <Toaster /> component for rendering toasts, not ToastContainer */}
      {/* <ToastContainer position="top-right" autoClose={3000} /> */}
      {/* You should place <Toaster /> in your root layout or highest common component */}
      {/* For a quick test, you can put it here, but typically it's global */}
      {/* <Toaster position="top-right" reverseOrder={false} /> */}


      {/* Background Image */}
      <Image
        src="/book.png" // Make sure this image exists in your /public folder
        alt="Background"
        fill
        priority // Optimizes image loading
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/60" /> {/* Overlay for readability */}

      {/* Main Content Area */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-6 left-6 text-white hover:text-indigo-400 transition"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Signup Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md bg-[#0e131fcc] backdrop-blur-md p-8 rounded-xl text-white shadow-xl"
        >
          {/* Title */}
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-bold mb-8 text-center"
          >
            Sign up
          </motion.h1>

          {/* Form Fields */}
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
            {/* Username Input */}
            <motion.input
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-transparent text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading} // Disable input while loading
            />

            {/* Phone Number Input */}
            <motion.input
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-transparent text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />

            {/* Email Input */}
            <motion.input
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-transparent text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />

            {/* Password Input with Toggle */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
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

            {/* Confirm Password Input */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="relative"
            >
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-md bg-transparent text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </motion.div>

            {/* Role Selection */}
            <motion.select
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-transparent text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </motion.select>

            {/* Organization Slug Input */}
            <motion.input
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              type="text"
              placeholder="Organization Slug"
              value={organizationSlug}
              onChange={(e) => setOrganizationSlug(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-transparent text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />

            {/* Sign up Button */}
            <motion.button
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              onClick={handleSignup}
              className="w-full py-3 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading} // Disable button when form is submitting
            >
              {loading ? 'Signing up...' : 'Sign up'}
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