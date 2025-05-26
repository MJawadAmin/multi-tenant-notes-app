'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  title: string;
  description: string;
  icon: ReactNode;
}

export default function FeatureCard({ title, description, icon }: Props) {
  return (
    <motion.div
      className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-indigo-100"
      whileHover={{ y: -4, scale: 1.03 }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <div className="w-12 h-12 flex items-center justify-center mb-4 bg-indigo-50 rounded-lg">
        <span className="text-indigo-600">{icon}</span>
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}