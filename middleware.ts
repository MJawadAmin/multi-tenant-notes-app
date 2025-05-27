// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const user = session.user;

  // Optional: Fetch user role from Supabase user_metadata or a table
  const { data: userDetails, error } = await supabase
    .from('users') // Adjust to your actual table name
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !userDetails) {
    console.error('Error fetching user role:', error?.message);
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const role = userDetails.role; // Should be 'admin' or 'user'
  
  // Extract slug from pathname: /app/(protected)/[slug]/dashboard
  const pathname = req.nextUrl.pathname;
  const parts = pathname.split('/'); // ['', 'app', '(protected)', '[slug]', 'dashboard', ...]
  const orgSlug = parts[3];

  // If user hits generic dashboard, redirect based on role
  if (parts[4] === 'dashboard' && !parts[5]) {
    const destination =
      role === 'admin'
        ? `/app/(protected)/${orgSlug}/dashboard/admin`
        : `/app/(protected)/${orgSlug}/dashboard/user`;

    return NextResponse.redirect(new URL(destination, req.url));
  }

  return res;
}

export const config = {
  matcher: ['/app/(protected)/:slug*/dashboard/:path*'],
};
