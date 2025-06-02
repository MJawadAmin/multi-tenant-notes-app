import { jsPDF } from 'jspdf';
import { Note } from '@/types/note';

interface PDFOptions {
  title?: string;
  includeMetadata?: boolean;
  fileName?: string;
}

export const generateSingleNotePDF = async (note: Note, options: PDFOptions = {}) => {
  const {
    title = 'Note Details',
    includeMetadata = true,
    fileName = `note-${note.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
  } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yOffset = 20;
  const lineHeight = 7;

  // Add title
  doc.setFontSize(20);
  doc.text(title, pageWidth / 2, yOffset, { align: 'center' });
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
    
    let currentLine = 0;
    while (currentLine < contentLines.length) {
      if (yOffset + lineHeight > pageHeight - margin) {
        doc.addPage();
        yOffset = margin;
      }
      
      const linesPerPage = Math.floor((pageHeight - yOffset - margin) / lineHeight);
      const linesToAdd = Math.min(linesPerPage, contentLines.length - currentLine);
      
      doc.text(contentLines.slice(currentLine, currentLine + linesToAdd), margin, yOffset);
      yOffset += lineHeight * linesToAdd;
      currentLine += linesToAdd;
    }
  }

  // Add metadata if requested
  if (includeMetadata) {
    doc.addPage();
    yOffset = margin;
    doc.setFontSize(10);
    doc.text(`Created: ${new Date(note.created_at).toLocaleString()}`, margin, yOffset);
    yOffset += lineHeight;
    if (note.updated_at) {
      doc.text(`Last Updated: ${new Date(note.updated_at).toLocaleString()}`, margin, yOffset);
    }
  }

  // Save the PDF
  doc.save(fileName);
  return fileName;
};

export const generateMultipleNotesPDF = async (notes: Note[], options: PDFOptions = {}) => {
  const {
    title = 'Selected Notes Collection',
    includeMetadata = true,
    fileName = `selected-notes-${new Date().toISOString().split('T')[0]}.pdf`
  } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yOffset = 20;
  const lineHeight = 7;

  // Add title
  doc.setFontSize(20);
  doc.text(title, pageWidth / 2, yOffset, { align: 'center' });
  yOffset += lineHeight * 2;

  // Add export info
  doc.setFontSize(12);
  doc.text(`Exported on: ${new Date().toLocaleString()}`, margin, yOffset);
  yOffset += lineHeight * 2;

  // Add notes
  notes.forEach((note, index) => {
    // Always start a new note on a new page
    if (index > 0) {
      doc.addPage();
      yOffset = margin;
    }

    // Add note title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(`${index + 1}. ${note.title}`, pageWidth - (margin * 2));
    doc.text(titleLines, margin, yOffset);
    yOffset += lineHeight * titleLines.length + lineHeight;

    // Add description if exists
    if (note.description) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const descriptionLines = doc.splitTextToSize(note.description, pageWidth - (margin * 2));
      
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
      
      let currentLine = 0;
      while (currentLine < contentLines.length) {
        if (yOffset + lineHeight > pageHeight - margin) {
          doc.addPage();
          yOffset = margin;
        }
        
        const linesPerPage = Math.floor((pageHeight - yOffset - margin) / lineHeight);
        const linesToAdd = Math.min(linesPerPage, contentLines.length - currentLine);
        
        doc.text(contentLines.slice(currentLine, currentLine + linesToAdd), margin, yOffset);
        yOffset += lineHeight * linesToAdd;
        currentLine += linesToAdd;
      }
    }

    // Add metadata if requested
    if (includeMetadata) {
      doc.addPage();
      yOffset = margin;
      doc.setFontSize(10);
      doc.text(`Created: ${new Date(note.created_at).toLocaleString()}`, margin, yOffset);
      yOffset += lineHeight;
      if (note.updated_at) {
        doc.text(`Last Updated: ${new Date(note.updated_at).toLocaleString()}`, margin, yOffset);
      }
    }
  });

  // Save the PDF
  doc.save(fileName);
  return fileName;
}; 