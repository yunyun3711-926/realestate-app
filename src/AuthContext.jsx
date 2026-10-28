import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

const AuthContext = createContext(null)

// ログイン状態（セッション）をアプリ全体に提供する
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  // 初回のセッション取得が終わるまではtrue
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 起動時に保存済みのセッションを取得
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // ログイン・ログアウトなどの状態変化を監視
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// 各画面からログイン状態を参照するためのフック
export function useAuth() {
  return useContext(AuthContext)
}
