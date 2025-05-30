// components/Navbar.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm w-full">
      <div className="max-w-8xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 relative">
              <Image 
                src="/Logo.png" 
                alt="Logo" 
                fill 
                className="object-contain"
              />
            </div>
            <span className="hidden sm:block font-bold text-xl text-gray-800">
              MT Notes
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-600 p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-2 space-y-3">
                <Link 
                  href="/login" 
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="block px-4 py-2 bg-indigo-600 text-white rounded-lg shadow text-center hover:bg-indigo-700"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}