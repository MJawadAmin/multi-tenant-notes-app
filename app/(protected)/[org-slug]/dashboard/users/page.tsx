// app/(protect)/[org-slug]/dashboard/user/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function UserDashboardPage({ params }: { params: { 'org-slug': string } }) {
  // You might want to fetch user-specific data here or from your layout
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // This case should be caught by middleware, but good for redundancy
    redirect('/login');
  }

  const orgSlug = params['org-slug'];

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">User Dashboard</h1>
      <p className="text-lg text-gray-600 mb-2">Welcome to the user dashboard for {orgSlug}!</p>
      <p className="text-md text-gray-500">You are logged in as: {user.email}</p>
      {/* Add your user-specific dashboard content here */}
    </div>
  );
}