import NextAuth from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          return null
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const
  },
  pages: {
    signIn: "/login",
    signOut: "/",
  },
  callbacks: {
    async jwt({ token, user }: { token: unknown; user?: unknown }) {
      if (user) {
        (token as { id?: string }).id = (user as { id: string }).id
      }
      return token as { id?: string; [key: string]: unknown }
    },
    async session({ session, token }: { session: unknown; token: unknown }) {
      if (token && (session as { user?: unknown }).user) {
        ((session as { user: { id?: string } }).user as { id?: string }).id = (token as { id?: string }).id
      }
      return session as { user?: { id?: string; name?: string | null; email?: string | null; image?: string | null }; expires: string }
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }