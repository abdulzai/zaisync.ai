// lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Needed for Gmail API calls + offline refresh token
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    // Persist tokens so server routes can call Gmail
    async jwt({ token, account }) {
      if (account) {
        token.access_token = account.access_token;
        // @ts-ignore
        token.refresh_token = account.refresh_token;
        // @ts-ignore
        token.expires_at = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      // expose to server routes
      // @ts-ignore
      session.access_token = token.access_token;
      // @ts-ignore
      session.refresh_token = token.refresh_token;
      return session;
    },
  },
};
