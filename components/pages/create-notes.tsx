// create-notes.tsx
"use client";

import React, { useState } from "react";
import Editor from "@/components/WysiwygEditor"; // assuming it exports as default

const CreateNotePage = () => {
  const [content, setContent] = useState("");

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-4">Create a New Note</h1>
      <Editor content={content} onChange={setContent} />
    </div>
  );
};

export default CreateNotePage;
