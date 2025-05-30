// // middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 1. Get the user's session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const currentPath = req.nextUrl.pathname;
  const loginPagePath = '/login';

  // Regex for paths like /org/dashboard or /org/dashboard/role
  const dashboardUrlRegex = /^\/([^\/]+)\/dashboard(?:\/(admin|user)?)?$/;
  const match = currentPath.match(dashboardUrlRegex);

  const orgSlug = match ? match[1] : null;
  const currentRoleSegment = match && match[2] ? match[2] : null;

  // --- A. PROTECT DASHBOARD ROUTES ---
  if (match && !session) {
    const redirectUrl = new URL(loginPagePath, req.url);
    redirectUrl.searchParams.set('redirectedFrom', encodeURIComponent(currentPath));
    return NextResponse.redirect(redirectUrl);
  }

  // --- B. REDIRECT TO CORRECT DASHBOARD IF LOGGED IN AND ON WRONG DASHBOARD URL ---
  if (session && match) {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('role, organization_slug')
        .eq('id', session.user.id)
        .single();

      if (error || !profile) {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL(loginPagePath, req.url));
      }

      const userRole = profile.role;
      const expectedDashboardSegment = userRole;
      const effectiveOrgSlug = profile.organization_slug || orgSlug || 'default-org';
      const expectedFullPath = `/${effectiveOrgSlug}/dashboard/${expectedDashboardSegment}`;

      if (currentRoleSegment !== expectedDashboardSegment) {
        return NextResponse.redirect(new URL(expectedFullPath, req.url));
      }
    } catch (error) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL(loginPagePath, req.url));
    }
  }

  // ✅ NO REDIRECT from login page even if session exists
  return res;
}

// Matcher
export const config = {
  matcher: [
    '/([^\/]+)/dashboard/:path*',
    '/login',
    '/',
  ],
};
