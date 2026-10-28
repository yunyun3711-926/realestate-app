import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// 会員登録画面
export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    // メールアドレスとパスワードで会員登録
    const { data, error } = await supabase.auth.signUp({ email, password })

    setSubmitting(false)
    if (error) {
      setError('会員登録に失敗しました：' + error.message)
      return
    }

    // メール確認が無効な設定ならセッションが返るので、そのまま物件一覧へ
    if (data.session) {
      navigate('/properties', { replace: true })
      return
    }
    // メール確認が有効な設定の場合は確認メールの案内を表示
    setMessage('確認メールを送信しました。メール内のリンクをクリックしてからログインしてください。')
  }

  return (
    <div className="auth-container">
      <h1>会員登録</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          メールアドレス
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          パスワード（6文字以上）
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? '登録中...' : '会員登録'}
        </button>
      </form>
      <p className="switch-link">
        すでにアカウントをお持ちの方は <Link to="/login">ログイン</Link>
      </p>
    </div>
  )
}
