import { Note } from '@/types/note';
import { jsPDF } from 'jspdf';

export async function generatePDF(note: Note) {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set font styles
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  
  // Add title
  doc.text(note.title, 20, 20);
  
  // Add description if exists
  if (note.description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(note.description, 20, 30);
  }
  
  // Add content if exists
  if (note.content) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    // Split content into lines to handle long text
    const splitText = doc.splitTextToSize(note.content, 170);
    doc.text(splitText, 20, note.description ? 40 : 30);
  }
  
  // Add metadata
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  const date = new Date(note.updated_at || note.created_at).toLocaleDateString();
  doc.text(`Last updated: ${date}`, 20, 280);
  
  // Save the PDF
  doc.save(`${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
} 