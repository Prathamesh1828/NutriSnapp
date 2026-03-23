import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, "");
          const url = `${baseUrl}/api/account/login`;
          console.log('[AUTH DEBUG] Fetching:', url);
          console.log('[AUTH DEBUG] Credentials email:', credentials.email);

          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
          });

          console.log('[AUTH DEBUG] Response status:', res.status);
          const user = await res.json();
          console.log('[AUTH DEBUG] Response body:', JSON.stringify(user));

          if (res.ok && user && user.success) {
            return user.data;
          } else {
            return null;
          }
        } catch (error) {
          console.error("[AUTH DEBUG] Fetch error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        if (session?.role) token.role = session.role;
        if (session?.onboardingComplete !== undefined) token.onboardingComplete = session.onboardingComplete;
      }
      if (user) {
        token.id = user.id;
        token.name = (user as any).name;
        token.role = (user as unknown as { role: string }).role;
        token.onboardingComplete = (user as unknown as { onboardingComplete: boolean }).onboardingComplete;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.onboardingComplete = token.onboardingComplete as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
