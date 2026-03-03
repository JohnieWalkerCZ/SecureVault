// app/api/auth/[...nextauth]/route.ts
import NextAuth, { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
    }
}

const handler = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user) return null;

                const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

                if (!isPasswordValid) return null;

                return { id: user.id, email: user.email };
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 1 * 60 * 60, // 1 hour 
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
    pages: { signIn: "/login" },
    callbacks: {
        async session({ session, token }: { session: Session, token: JWT }) {
            if (token && session.user) {
                session.user.id = token.id;
            }
            return session;
        }
    }
});

export { handler as GET, handler as POST };
