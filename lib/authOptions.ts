// app/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        // Request email/profile + Gmail read-only and offline so we get refresh_token
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.readonly",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist access/refresh tokens on first sign-in and refresh when provided
      if (account) {
        (token as any).access_token = account.access_token;
        (token as any).refresh_token = account.refresh_token;
        (token as any).expires_at = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).access_token = (token as any).access_token;
      (session as any).refresh_token = (token as any).refresh_token;
      (session as any).expires_at = (token as any).expires_at;
      return session;
    },
  },
  session: { strategy: "jwt" },
};
