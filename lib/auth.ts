import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db/connect";
import { User } from "@/models/User";
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      username: string;
    } & DefaultSession["user"];
  }
  interface User {
    role?: string;
    username?: string;
  }
}

// Dummy schema for sign in
const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = signInSchema.safeParse(credentials);
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          await connectToDatabase();
          const user = await User.findOne({ email });
          if (!user || !user.passwordHash) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
          if (passwordsMatch) {
            user.lastLogin = new Date();
            await user.save();
            return { id: user._id.toString(), name: user.name, email: user.email, username: user.username, role: user.role };
          }
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
});
