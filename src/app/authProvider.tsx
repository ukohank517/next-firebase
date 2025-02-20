import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export type GlobalAuthState = {
  user: User | null | undefined // 認証success|認証fail|初期状態
}
const initialState: GlobalAuthState = {
  user: undefined,
}
const AuthContext = createContext<GlobalAuthState>(initialState)

type Props = { children: ReactNode }

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<GlobalAuthState>(initialState)

  useEffect(() => {
    try {
      return onAuthStateChanged(auth, (user) => {
        setUser({
          user,
        })
      })
    } catch (error) {
      setUser(initialState)
      throw error
    }

  }, [])

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)