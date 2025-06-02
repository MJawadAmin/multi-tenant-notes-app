// components/NoteCard.tsx
import React from "react";

type Note = {
  id: string;
  title: string;
  content: string;
  author?: string;
  createdAt?: string;
  // Add more fields if needed
};

type NoteCardProps = {
  note: Note;
};

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  return (
    <div className="border p-4 rounded-md shadow-md bg-white">
      <h2 className="text-xl font-semibold">{note.title}</h2>
      <p className="text-sm text-gray-600">{note.content}</p>
    </div>
  );
};

export default NoteCard;
