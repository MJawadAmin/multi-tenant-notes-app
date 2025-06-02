'use client';

import React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils'; // helper for classnames

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({ content, onChange, placeholder, className }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your note...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div
      className={cn(
        'border rounded-lg p-4 bg-white dark:bg-zinc-900 dark:text-white shadow-sm min-h-[200px]',
        className
      )}
    >
      {editor && <EditorContent editor={editor} />}
    </div>
  );
};

export default WysiwygEditor;
