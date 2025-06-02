import { motion, AnimatePresence } from 'framer-motion';
import { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generatePDF } from '@/utils/pdf';
import { useState } from 'react';
import { toast } from 'sonner';

interface NoteViewerProps {
  note: Note | null;
  onClose: () => void;
}

export default function NoteViewer({ note, onClose }: NoteViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!note) return;
    try {
      setIsDownloading(true);
      await generatePDF(note);
      toast.success('Note downloaded successfully');
    } catch (error) {
      console.error('Error downloading note:', error);
      toast.error('Failed to download note');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!note) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-3xl translate-x-[-50%] translate-y-[-50%]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Book Animation Container */}
            <motion.div
              initial={{ rotateY: 90 }}
              animate={{ rotateY: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative perspective-1000"
            >
              <div className="relative bg-white p-8 min-h-[60vh] max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{note.title || 'Untitled Note'}</h2>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="flex items-center space-x-2"
                    >
                      <Download className={`h-4 w-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                      <span>Download</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Close
                    </Button>
                  </div>
                </div>

                {/* Description */}
                {note.description && (
                  <p className="text-gray-600 mb-6">{note.description}</p>
                )}

                {/* Content */}
                {note.content && (
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap">{note.content}</div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-8 pt-4 border-t text-sm text-gray-500">
                  Last updated: {note.updated_at ? new Date(note.updated_at).toLocaleDateString() : 'Never'}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 