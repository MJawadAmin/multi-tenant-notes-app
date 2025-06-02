<<<<<<< HEAD
'use client';

=======
>>>>>>> 4f4fcd5d876077c03f367ce43f308f1bf4611046
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Note } from '@/types/note';
import NotesGrid from '@/components/notes/NotesGrid';
import NoteReader from '@/components/notes/NoteReader';
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';

const handleDownloadNote = async (note: Note) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yOffset = 20;
    const lineHeight = 7;

    // Add title
    doc.setFontSize(20);
    doc.text('Note Details', pageWidth / 2, yOffset, { align: 'center' });
    yOffset += lineHeight * 2;

    // Add note title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(note.title, pageWidth - (margin * 2));
    doc.text(titleLines, margin, yOffset);
    yOffset += lineHeight * titleLines.length + lineHeight;

    // Add description if exists
    if (note.description) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const descriptionLines = doc.splitTextToSize(note.description, pageWidth - (margin * 2));
      
      // Check if we need a new page for description
      if (yOffset + (lineHeight * descriptionLines.length) > pageHeight - margin) {
        doc.addPage();
        yOffset = margin;
      }
      
      doc.text(descriptionLines, margin, yOffset);
      yOffset += lineHeight * descriptionLines.length + lineHeight;
    }

    // Add content if exists
    if (note.content) {
      doc.setFontSize(11);
      const contentLines = doc.splitTextToSize(note.content, pageWidth - (margin * 2));
      
      // Handle content pagination
      let currentLine = 0;
      while (currentLine < contentLines.length) {
        // Check if we need a new page
        if (yOffset + lineHeight > pageHeight - margin) {
          doc.addPage();
          yOffset = margin;
        }
        
        // Calculate how many lines can fit on current page
        const linesPerPage = Math.floor((pageHeight - yOffset - margin) / lineHeight);
        const linesToAdd = Math.min(linesPerPage, contentLines.length - currentLine);
        
        // Add lines to current page
        doc.text(contentLines.slice(currentLine, currentLine + linesToAdd), margin, yOffset);
        yOffset += lineHeight * linesToAdd;
        currentLine += linesToAdd;
      }
    }

    // Add metadata on a new page
    doc.addPage();
    yOffset = margin;
    doc.setFontSize(10);
    doc.text(`Created: ${new Date(note.created_at).toLocaleString()}`, margin, yOffset);
    yOffset += lineHeight;
    if (note.updated_at) {
      doc.text(`Last Updated: ${new Date(note.updated_at).toLocaleString()}`, margin, yOffset);
    }

    // Save the PDF
    const fileName = `note-${note.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    toast.success('Note downloaded successfully!');
  } catch (error: any) {
    console.error('Error downloading note:', error);
    toast.error('Error downloading note: ' + error.message);
  }
};

export default function DashboardPage() {
  const params = useParams();
  const orgSlug = params['org-slug'] as string;
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Your existing JSX */}
    </div>
  );
} 