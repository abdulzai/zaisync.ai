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
          // IMPORTANT: Gmail read-only scope
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      // When we first sign in, persist the access_token on the JWT
      if (account) {
        (token as any).access_token = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose access_token on the session so API routes can use it
      (session as any).access_token = (token as any).access_token;
      return session;
    }
  }
};
