// pages/invite.tsx
"use client";

import { useState } from "react";

export default function InvitePage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Viewer");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Invite a User</h1>
      <input
        type="email"
        placeholder="User Email"
        className="w-full border p-2 rounded mb-4"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      >
        <option value="Admin">Admin</option>
        <option value="Editor">Editor</option>
        <option value="Viewer">Viewer</option>
      </select>
      <button className="px-4 py-2 bg-green-600 text-white rounded">Send Invite</button>
    </div>
  );
}
