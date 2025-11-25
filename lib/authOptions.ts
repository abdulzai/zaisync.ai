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
          // include Gmail read-only scope
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      // On first sign-in, copy Google's access_token onto the JWT
      if (account) {
        token.access_token = (account as any).access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose the access_token on the session object
      (session as any).access_token = token.access_token;
      return session;
    },
  },
};
