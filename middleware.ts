// middleware.ts
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
  const loginPagePath = '/login'; // Your actual login page URL

  // Regular expression to match actual dashboard URLs and capture org-slug and optional role segment
  // Matches URLs like: /your-org/dashboard, /your-org/dashboard/admin, etc.
  const dashboardUrlRegex = /^\/([^\/]+)\/dashboard(?:\/(admin|user)?)?$/;
  const match = currentPath.match(dashboardUrlRegex);

  const orgSlug = match ? match[1] : null; 
  const currentRoleSegment = match && match[2] ? match[2] : null; 


  // --- A. General Authentication Check for Protected URLs ---
  // If the current URL matches a dashboard pattern (meaning it's a protected route) AND there's no session, redirect to login.
  if (match && !session) { 
    const redirectUrl = new URL(loginPagePath, req.url);
    redirectUrl.searchParams.set('redirectedFrom', encodeURIComponent(currentPath));
    return NextResponse.redirect(redirectUrl);
  }
  
  // This also catches general pages that are protected but don't follow the dashboard pattern directly,
  // relying on the matcher to bring us here.
  // Example: If you had /app/(protected)/profile/page.tsx, its URL is /profile.
  // The matcher would match /profile, and this check would redirect if no session.
  if (currentPath !== loginPagePath && !session) {
      // Need a way to identify generally protected URLs here if they don't match dashboard pattern.
      // A simple way is to check if it's not a public root path and not login, and no session.
      // Or, better, explicitly list public paths that *don't* need auth.
      // For now, let's rely heavily on the dashboardUrlRegex for specific protection.
      // If you add other protected pages outside dashboard, you'll need more refined checks here.
      // For example:
      // const publicPaths = ['/', '/about', '/contact'];
      // if (!publicPaths.includes(currentPath) && !session) { /* redirect */ }
  }


  // --- B. Redirect from login page if already authenticated ---
  // If user is on the login page but already has a session, redirect them to their correct role-based dashboard.
  if (currentPath === loginPagePath && session) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    let targetDashboardUrl = '/default-org/dashboard'; // Fallback URL
    if (profile && !error) {
        const userRole = profile.role;
        const effectiveOrgSlug = orgSlug || 'default-org'; 
        // CORRECT: Construct URL without the (protected) segment in the URL
        targetDashboardUrl = `/${effectiveOrgSlug}/dashboard/${userRole}`;
    } else {
        console.error("Error fetching profile on login redirect:", error?.message);
    }
    return NextResponse.redirect(new URL(targetDashboardUrl, req.url));
  }


  // --- C. Role-based Redirection for Dashboard Access ---
  // This logic runs ONLY if:
  // 1. The user is authenticated (`session` exists).
  // 2. The current URL matches a dashboard pattern (`match` is true).
  if (session && match) { 
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role') 
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      console.error("Error fetching user profile for role check in middleware:", error?.message || "No profile found");
      return NextResponse.redirect(new URL(loginPagePath, req.url));
    }

    const userRole = profile.role; 
    const expectedDashboardSegment = userRole; 

    // CORRECT: Construct the full expected URL without (protected)
    const expectedFullPath = `/${orgSlug}/dashboard/${expectedDashboardSegment}`;

    // If the current URL is the generic dashboard (e.g., /default-org/dashboard)
    // OR if the current URL has a role segment that doesn't match the user's actual role
    if (currentRoleSegment === null || currentRoleSegment !== expectedDashboardSegment) {
      console.log(`Redirecting user ${session.user.id} from ${currentPath} to ${expectedFullPath} (role: ${userRole})`);
      return NextResponse.redirect(new URL(expectedFullPath, req.url));
    }
  }

  return res;
}

// 4. Configure the matcher to specify which URLs the middleware should run on.
// The matcher must list the ACTUAL URL paths that need middleware intervention.
export const config = {
  matcher: [
    // 1. Match the actual URL pattern for your dashboard routes (e.g., /any-org/dashboard/any-role)
    '/([^\/]+)/dashboard/:path*', 
    // 2. Match the login page URL
    '/login',
    // 3. Match the root path (if it needs protection or general middleware processing)
    '/'
    // You might add other specific public URLs here if they don't need middleware and you want to exclude them.
    // Example for excluding static files, API routes, and _next internals:
    // '/((?!api|_next/static|_next/image|favicon.ico).*)', // This is a broader catch-all for all client routes
  ],
};