import { NextAuthOptions, getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { cookies } from "next/headers"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  secret: process.env.NEXTAUTH_SECRET || "stiktube-super-secret-key-2026-prod",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id
        const channel = await prisma.channel.findUnique({
          where: { userId: user.id },
        })
        session.user.channelId = channel?.id
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}

export async function getAuth() {
  // Check for admin session first
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("next-auth.session-token")?.value

  if (sessionToken?.startsWith("admin-")) {
    // Admin session - check in database
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    })

    if (session && session.expires > new Date()) {
      const channel = await prisma.channel.findUnique({
        where: { userId: session.user.id },
      })

      return {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          channelId: channel?.id,
        },
      }
    }
  }

  // Fallback to NextAuth session
  return getServerSession(authOptions)
}
