// components/ui/ErrorState.tsx
import React from 'react';
import { motion } from 'framer-motion';

export default function ErrorState({ message = 'An unexpected error occurred.' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 text-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center bg-red-100 border border-red-400 text-red-700 rounded-lg p-8 shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>{message}</p>
      </motion.div>
    </div>
  );
}