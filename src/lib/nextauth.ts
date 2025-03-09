/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from 'next-auth'
import { adminApp } from './firebase-admin'
import { getAuth } from 'firebase-admin/auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const fetchNewIdToken = async (refreshToken: string) => {
  const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  const {id_token} = await res.json()
  return id_token
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {},
      authorize: async (credentials: any) => {
        const { idToken, refreshToken } = credentials
        if (idToken && refreshToken) {
          try {
            const adminAuth = getAuth(adminApp)
            const decoded = await adminAuth.verifyIdToken(idToken) // 2

            const user = {
              id: decoded.user_id,
              uid: decoded.uid,
              name: decoded.name || '',
              email: decoded.email || '',
              image: decoded.picture || '',
              idToken,
              refreshToken,
              tokenExpiryTime: decoded.exp || 0,
            }

            return user
          } catch (err) {
            console.error(err)
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.uid = user.id
        token.name = user.name ?? ''
        token.idToken = user.idToken
        token.refreshToken = user.refreshToken
        token.image = user.image ?? ''
        token.tokenExpiryTime = user.tokenExpiryTime
      }

      const currentTime = Math.floor(Date.now() / 1000)
      const tokenExpiryTime = token.tokenExpiryTime as number
      const isExpired = currentTime > tokenExpiryTime - 300 // 5分前には更新するようにする

      if (isExpired) {
        try {
          const newIdToken = await fetchNewIdToken(token.refreshToken as string)
          token.idToken = newIdToken
        } catch (error) {
          console.error('Error refreshing token:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      // sessionにFirebase Authenticationで取得した情報を追加。
      session.user.uid = token.uid
      session.user!.name = token.name
      session.user!.image = token.image as string
      session.user!.email = token.email || ''
      session.user!.idToken = token.idToken

      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 90 * 24 * 60 * 60, // 90 days
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXT_AUTH_SECRET,
}