'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async () => {
    const { email, password, confirmPassword } = formData;

    if (!email || !password || !confirmPassword) {
      return setError('All fields are required.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: formData.username,
          phone: formData.phone,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccessMsg('Check your email to confirm your account.');
      setTimeout(() => router.push('/login'), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Create Your Account</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {successMsg && <p className="text-green-600 text-sm mb-4">{successMsg}</p>}

        <div className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="input-style"
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input-style"
            onChange={handleChange}
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            className="input-style"
            onChange={handleChange}
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              className="input-style pr-10"
              onChange={handleChange}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="input-style"
            onChange={handleChange}
          />
        </div>

        <button
          onClick={handleSignUp}
          className="mt-6 w-full bg-sky-600 hover:bg-sky-300 text-white font-semibold py-2 rounded-xl transition"
        >
          Sign Up
        </button>

        <p className="text-sm text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <a className="text-blue-600 font-medium underline" href="/login">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
