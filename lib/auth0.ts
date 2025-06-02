// // src/lib/auth0.ts
// import { initAuth0 } from '@auth0/nextjs-auth0';


// export const auth0 = initAuth0({
//   secret: process.env.AUTH0_SECRET || '',
//   baseURL: process.env.AUTH0_BASE_URL,
//   issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
//   clientID: process.env.AUTH0_CLIENT_ID,
//   clientSecret: process.env.AUTH0_CLIENT_SECRET,
//   // Add organization: process.env.AUTH0_ORG_ID to enable org context by default
//   routes: {
//     callback: '/api/auth/callback',
//     postLogoutRedirect: '/',
//   },
//   session: {
//     storeIdToken: true, // Store the ID token to access custom claims (like org_id)
//   },
// });
