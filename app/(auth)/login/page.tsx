'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-20 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="email"
        className="border p-2 w-full mb-3"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="border p-2 w-full mb-3"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-600 text-white py-2 px-4 rounded w-full" onClick={handleLogin}>
        Login
      </button>
      <div className="text-sm text-center mt-4 space-y-1">
        <p>
          Forgot your password?{' '}
          <a className="text-blue-600 underline" href="/reset-password">
            Reset
          </a>
        </p>
        <p>
          Don't have an account?{' '}
          <a className="text-blue-600 underline" href="/signup">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
