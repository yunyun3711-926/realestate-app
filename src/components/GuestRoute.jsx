import { Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

// ログイン済みの場合はログイン・会員登録画面を表示せず物件一覧へ移動する
export default function GuestRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) return <p className="center">読み込み中...</p>
  if (session) return <Navigate to="/properties" replace />

  return children
}
