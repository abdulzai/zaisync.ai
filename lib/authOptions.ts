// lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // read-only Gmail + offline
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
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          // MS Graph read calendar + offline
          scope: [
            "openid",
            "email",
            "profile",
            "offline_access",
            "Calendars.Read",
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // persist provider access/refresh on first sign-in
      if (account) {
        (token as any).access_token = account.access_token;
        (token as any).refresh_token = account.refresh_token;
        (token as any).expires_at = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      // expose access token to server routes
      (session as any).access_token = (token as any).access_token;
      return session;
    },
  },
};
