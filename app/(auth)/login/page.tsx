'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react'; // Optional: install lucide-react

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (email === '' || password === '') {
      setError('Email and password are required.');
      return;
    }

    setError('');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Login Form */}
      <div className="w-full md:w-1/2 bg-[#0e131f] text-white flex items-center justify-center p-8 relative">
        {/* Back Arrow */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-6 left-6 text-white hover:text-indigo-400 transition"
          aria-label="Back to Home"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold mb-8">Log in</h1>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#0e131f] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#0e131f] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex justify-between text-sm text-gray-400">
              <a href="/reset-password" className="hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              onClick={handleLogin}
              className="w-full py-2 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 transition"
            >
              Log in
            </button>
          </div>

          <div className="text-sm text-gray-400 mt-6 text-center">
            Don’t have an account?{' '}
            <a href="/signup" className="text-indigo-500 underline">
              Sign up
            </a>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden md:flex w-full md:w-1/2 bg-[#0e131f] items-center justify-center relative p-6">
        <Image
          src="/book.avif"
          alt="Writer Illustration"
          width={1200}
          height={1200}
          className="object-contain rounded-xl shadow-lg"
        />
      </div>
    </div>
  );
}
