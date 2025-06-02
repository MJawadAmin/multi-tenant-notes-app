// components/ui/LoadingState.tsx
import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 text-gray-800 p-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-t-4 border-indigo-500 rounded-full mb-4"
      ></motion.div>
      <p className="text-xl">{message}</p>
    </div>
  );
}