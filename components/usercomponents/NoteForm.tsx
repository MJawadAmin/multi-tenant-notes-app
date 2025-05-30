// components/notes/NoteForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, X, RotateCw } from 'lucide-react';

interface NoteFormProps {
  initialTitle?: string;
  initialDescription?: string | null;
  initialContent?: string | null;
  onSubmit: (title: string, description: string | null, content: string | null) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitButtonText: string;
  cancelButtonText?: string;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
  contentPlaceholder?: string;
  isCreateMode?: boolean;
}

const formVariants = {
  hidden: { opacity: 0, height: 0, transition: { duration: 0.3 } },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function NoteForm({
  initialTitle = '',
  initialDescription = '',
  initialContent = '',
  onSubmit,
  onCancel,
  isSubmitting,
  submitButtonText,
  cancelButtonText = 'Cancel',
  titlePlaceholder = 'Note Title',
  descriptionPlaceholder = 'A brief description (optional)',
  contentPlaceholder = 'Start writing your note here...',
  isCreateMode = false,
}: NoteFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setContent(initialContent);
  }, [initialTitle, initialDescription, initialContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title, description, content);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-xl border-t-4 border-indigo-500"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
        {isCreateMode ? 'Create New Note' : 'Edit Note'}
      </h2>
      <input
        type="text"
        placeholder={titlePlaceholder}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-3 mb-4 rounded-md bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={isSubmitting}
        required
      />
      <textarea
        placeholder={descriptionPlaceholder}
        value={description || ''}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full px-4 py-3 mb-4 rounded-md bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
        disabled={isSubmitting}
      ></textarea>
      <textarea
        placeholder={contentPlaceholder}
        value={content || ''}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
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
          className="py-3 px-6 rounded-md bg-gray-500 hover:bg-gray-600 text-white font-semibold flex items-center justify-center space-x-2 transition"
          disabled={isSubmitting}
        >
          <X size={20} className="mr-2" />
          {cancelButtonText}
        </motion.button>
      </div>
    </motion.form>
  );
}