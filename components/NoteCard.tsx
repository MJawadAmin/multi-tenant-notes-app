'use client';

import { motion } from 'framer-motion';
import { cn } from "@/lib/utils"; // Provided below
import { useRouter } from 'next/navigation';

interface NoteCardProps {
  title: string;
  content: string;
  visibility: 'private' | 'public';
  onClick?: () => void;
  className?: string;
}

const NoteCard = ({ title, content, visibility, onClick, className }: NoteCardProps) => {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-2xl shadow-md bg-white dark:bg-zinc-900 p-5 cursor-pointer border hover:border-blue-500 transition-all",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold text-zinc-800 dark:text-white">{title}</h3>
        <span
          className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            visibility === "private" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          )}
        >
          {visibility}
        </span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-4">
        {content}
      </p>
      <div className="mt-4 text-right">
        <button
          className="text-sm text-blue-600 hover:underline font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          View
        </button>
      </div>
    </motion.div>
  );
};

export default NoteCard;
