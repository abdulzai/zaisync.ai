// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        // add gmail scope + offline so we get refresh_token the first time
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // persist Google tokens on first sign-in / refresh
      if (account) {
        token.access_token = account.access_token;
        token.refresh_token = (account as any).refresh_token;
        token.expires_at = (account as any).expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      // surface the access token in the session (server can also read it)
      (session as any).access_token = token.access_token;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
