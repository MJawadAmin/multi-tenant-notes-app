import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminDashboard({ params }: { params: { 'org-slug': string } }) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const role = session?.user.user_metadata?.role;
  const org = session?.user.user_metadata?.orgSlug;

  // 🚫 Check org-slug matches
  if (org !== params['org-slug']) redirect('/unauthorized');

  // 🚫 Check user has admin access
  if (role !== 'admin') redirect(`/app/${params['org-slug']}/dashboards/user`);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard for {params['org-slug']}</h1>
    </main>
  );
}
