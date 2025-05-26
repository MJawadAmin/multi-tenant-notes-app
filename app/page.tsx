// app/page.tsx
'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import FeatureCard from '@/components/FeatureCard';

const features = [
  {
    title: 'Secure Notes',
    description: 'Create private or shared notes within your organization.',
    icon: '📝',
  },
  {
    title: 'Live Collaboration',
    description: 'Share and edit notes with real-time sync & role control.',
    icon: '🔄',
  },
  {
    title: 'Invite Users',
    description: 'Admins can invite teammates and assign roles.',
    icon: '📩',
  },
];

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center space-y-12"
    >
      <div className="flex flex-col items-center space-y-4">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image src="/Logo.png" alt="Logo" width={100} height={100} />
        </motion.div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
          Multi-Tenant Notes App
        </h1>
        <p className="text-lg text-gray-600 max-w-xl">
          Write, share, and manage notes across your entire organization with security and elegance.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        {features.map((feature, i) => (
          <FeatureCard key={i} {...feature} />
        ))}
      </motion.div>
    </motion.div>
    
  );
}
