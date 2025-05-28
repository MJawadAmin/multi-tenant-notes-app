// components/notes/NoteForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, X, RotateCw } from 'lucide-react'; // Icons

interface NoteFormProps {
  initialTitle?: string;
  initialContent?: string | null;
  onSubmit: (title: string, content: string | null) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitButtonText: string;
  cancelButtonText?: string;
  titlePlaceholder?: string;
  contentPlaceholder?: string;
  isCreateMode?: boolean; // Added to handle autofocus for new note
}

const formVariants = {
  hidden: { opacity: 0, height: 0, transition: { duration: 0.3 } },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function NoteForm({
  initialTitle = '',
  initialContent = '',
  onSubmit,
  onCancel,
  isSubmitting,
  submitButtonText,
  cancelButtonText = 'Cancel',
  titlePlaceholder = 'Note Title',
  contentPlaceholder = 'Note Content (optional)',
  isCreateMode = false,
}: NoteFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [initialTitle, initialContent]);

  useEffect(() => {
    if (isCreateMode && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isCreateMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title, content);
  };

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={formVariants}
      className="bg-indigo-50/50 p-6 rounded-lg mb-8 shadow-inner border border-indigo-200"
      onSubmit={handleSubmit}
    >
      <h3 className="text-2xl font-bold mb-4 text-indigo-700">
        {isCreateMode ? 'Create New Note' : 'Edit Note'}
      </h3>
      <input
        ref={titleInputRef}
        type="text"
        placeholder={titlePlaceholder}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-3 mb-4 rounded-md bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={isSubmitting}
      />
      <textarea
        placeholder={contentPlaceholder}
        value={content || ''} // Ensure it's a string for textarea
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="w-full px-4 py-3 mb-4 rounded-md bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
        disabled={isSubmitting}
      ></textarea>
      <div className="flex justify-end space-x-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="py-3 px-6 rounded-md bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center space-x-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? <RotateCw className="animate-spin mr-2" size={20} /> : <Save size={20} className="mr-2" />}
          {isSubmitting ? 'Saving...' : submitButtonText}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          className="py-3 px-6 rounded-md bg-gray-600 hover:bg-gray-700 text-white font-semibold flex items-center justify-center space-x-2 transition"
        >
          <X size={20} className="mr-2" />
          {cancelButtonText}
        </motion.button>
      </div>
    </motion.form>
  );
}