/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from 'next-auth'
import { firebaseAdminAuth } from './firebase-server'
import CredentialsProvider from 'next-auth/providers/credentials'

// firebaseトークンの有効期限が切れる5分前に新しいトークンを取得する
// 更新した情報はセッションに保存される
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
            const decoded = await firebaseAdminAuth.verifyIdToken(idToken) // 2
            const firebaseUserInfo = await firebaseAdminAuth.getUser(decoded.uid) // 3
            console.log('decoded:', decoded)
            console.log('firebaseuserInfo: ', firebaseUserInfo)

            // google, apple形式 || line形式 || 存在しない場合は空文字
            const name = decoded.name || decoded.customIdentities?.displayName || 'noname' // TODO: バックエンドAPI側で設定した内容に置き換える

            // google, apple形式 || line形式 || 存在しない場合は空文字
            const email = firebaseUserInfo.providerData[0]?.email || decoded.customIdentities?.email || ''

            // google, apple形式優先、なければline形式、それもなければ空文字
            const image = decoded.picture || decoded.customIdentities?.pictureUrl || '' // TODO: バックエンドAPI側で設定した内容に置き換える

            const user = {
              id: decoded.sub,
              uid: decoded.uid,
              name,
              email,
              image,
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
    maxAge: 7 * 24 * 60 * 60, // 一週間セッション有効
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXT_AUTH_SECRET,
}