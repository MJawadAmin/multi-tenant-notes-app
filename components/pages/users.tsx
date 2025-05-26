// pages/users.tsx
"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // fetch users from supabase
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Organization Users</h1>
      <ul className="divide-y divide-gray-200">
        {users.map((user: any) => (
          <li key={user.id} className="py-4 flex justify-between items-center">
            <span>{user.email}</span>
            <button className="px-3 py-1 text-sm bg-red-500 text-white rounded">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
