import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { primaryEmail: parsed.data.email },
        })
        if (!user || !user.password) return null

        const isValid = await compare(parsed.data.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.primaryEmail,
          name: user.name,
          image: user.image,
          role: user.role,
          preferredLanguage: user.preferredLanguage,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.preferredLanguage = (user as any).preferredLanguage
      }
      // Re-check emailVerified and role on every session read so changes (e.g. verification, role promotion) take effect immediately
      if (token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string }, select: { emailVerified: true, role: true } })
        token.emailVerified = dbUser?.emailVerified ?? null
        if (dbUser?.role) token.role = dbUser.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
        ;(session.user as any).preferredLanguage = token.preferredLanguage
        ;(session.user as any).emailVerified = token.emailVerified
      }
      return session
    },
  },
})
