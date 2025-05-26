'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      alert('Password updated successfully!');
      router.push('/login');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-20 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-semibold mb-4">Set New Password</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="password"
        className="border p-2 w-full mb-3"
        placeholder="New password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-indigo-600 text-white py-2 px-4 rounded w-full" onClick={handleUpdate}>
        Update Password
      </button>
    </div>
  );
}
