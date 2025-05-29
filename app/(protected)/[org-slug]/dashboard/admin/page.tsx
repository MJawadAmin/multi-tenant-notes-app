// app/(protect)/[org-slug]/dashboard/admin/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage({ params }: { params: { 'org-slug': string } }) {
  // You might want to fetch admin-specific data here
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // This case should be caught by middleware, but good for redundancy
    redirect('/login');
  }

  const orgSlug = params['org-slug'];

  return (
    <div className="min-h-screen p-8 bg-indigo-50 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-indigo-800 mb-4">Admin Dashboard</h1>
      <p className="text-lg text-indigo-700 mb-2">Welcome, Administrator, for {orgSlug}!</p>
      <p className="text-md text-indigo-600">You are logged in as: {user.email}</p>
      {/* Add your admin-specific dashboard content here */}
    </div>
  );
}