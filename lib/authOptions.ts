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
          // Added Calendar readonly scope so we can pull meetings
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/calendar.readonly",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],

  callbacks: {
    // ---- Early-user testing gate -------------------------
    async signIn({ user }) {
      // If ALLOWED_EMAILS is not set, allow everyone.
      const raw = process.env.ALLOWED_EMAILS;
      if (!raw || raw.trim() === "") return true;

      const allowList = raw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      if (!user.email) return false;
      return allowList.includes(user.email.toLowerCase());
    },

    // ---- Store access_token from Google on the JWT -------
    async jwt({ token, account }) {
      if (account) {
        // account.access_token is the Google OAuth access token
        (token as any).access_token = account.access_token;
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).access_token = (token as any).access_token;
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },
};
