// components/usercomponents/NoteForm.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface NoteFormProps {
  initialNote?: { title: string; content: string; is_public: boolean };
  onSubmit: (note: { title: string; content: string; is_public: boolean }) => void;
  submitButtonText?: string;
  className?: string;
}

const NoteForm: React.FC<NoteFormProps> = ({
  initialNote = { title: '', content: '', is_public: false },
  onSubmit,
  submitButtonText = 'Create Note',
  className,
}) => {
  const [note, setNote] = useState(initialNote);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(note);
    setNote({ title: '', content: '', is_public: false }); // Reset form after submission
  };

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-xl p-6 ${className || ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold mb-5 text-gray-800 border-b pb-3">Add New Note</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={note.title}
            onChange={(e) => setNote({ ...note, title: e.target.value })}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Your note title"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={note.content}
            onChange={(e) => setNote({ ...note, content: e.target.value })}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            rows={5}
            placeholder="Write your note content here..."
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_public"
            checked={note.is_public}
            onChange={(e) => setNote({ ...note, is_public: e.target.checked })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
            Make this note public
          </label>
        </div>
        <motion.button
          type="submit"
          className="w-full py-2.5 px-4 border border-transparent rounded-md shadow-sm text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {submitButtonText}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default NoteForm;