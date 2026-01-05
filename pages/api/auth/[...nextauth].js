// pages/api/auth/[...nextauth].js
// 
// Twitter OAuth 2.0 Setup Instructions:
// 1. Go to https://developer.twitter.com/en/portal/dashboard
// 2. Create a new App (type: Web App, Automated App or Bot)
// 3. Set Callback URL to: http://localhost:3000/api/auth/callback/twitter (for dev)
//    For production: https://yourdomain.com/api/auth/callback/twitter
// 4. Set App permissions: Read (Read-only is sufficient for authentication)
// 5. Go to "Keys and tokens" → "OAuth 2.0 Client ID and Client Secret"
//    - Copy OAuth 2.0 Client ID (use as TWITTER_CLIENT_ID)
//    - Copy OAuth 2.0 Client Secret (use as TWITTER_CLIENT_SECRET)
// 6. Make sure NEXTAUTH_URL matches your callback URL domain
// 7. RESTART your dev server after updating .env.local
//
// Environment Variables Required:
// - NEXTAUTH_URL=http://localhost:3000
// - NEXTAUTH_SECRET=your-generated-secret
// - TWITTER_CLIENT_ID=your_oauth2_client_id
// - TWITTER_CLIENT_SECRET=your_oauth2_client_secret

import NextAuth from 'next-auth';
import TwitterProvider from "next-auth/providers/twitter";

export default NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      version: "2.0", // Use OAuth 2.0
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      if (profile) {
        token.id = profile.data?.id || profile.id_str;
        token.username = profile.data?.username || profile.screen_name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.accessToken = token.accessToken;
        // Use username as email identifier since Twitter doesn't provide email
        session.user.email = token.username ? `${token.username}@twitter.com` : `user_${token.id}@twitter.com`;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
});
