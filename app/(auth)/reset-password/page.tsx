'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Password reset email sent!');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-20 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-semibold mb-4">Reset Password</h2>
      <input
        type="email"
        className="border p-2 w-full mb-3"
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="bg-indigo-600 text-white py-2 px-4 rounded w-full" onClick={handleReset}>
        Send Reset Link
      </button>
      <p className="text-sm text-center mt-4 text-green-600">{message}</p>
    </div>
  );
}
