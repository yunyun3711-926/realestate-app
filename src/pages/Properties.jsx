import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { createProperty, deleteProperty, fetchProperties, updateProperty } from '../lib/properties'
import { useAuth } from '../AuthContext'
import PropertyForm from '../components/PropertyForm'

// 物件一覧画面（ログイン後のみ表示）
export default function Properties() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // 編集中の物件ID（編集していなければnull）
  const [editingId, setEditingId] = useState(null)

  // 初回表示時にSupabaseから物件一覧を取得
  useEffect(() => {
    fetchProperties()
      .then(setProperties)
      .catch((err) => setError('物件の取得に失敗しました：' + err.message))
      .finally(() => setLoading(false))
  }, [])

  // 新規登録：登録した物件を一覧の先頭に追加
  const handleCreate = async (values) => {
    const created = await createProperty(session.user.id, values)
    setProperties((prev) => [created, ...prev])
  }

  // 編集：更新後のデータで一覧を置き換える
  const handleUpdate = async (id, values) => {
    const updated = await updateProperty(id, values)
    setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)))
    setEditingId(null)
  }

  // 削除：確認ダイアログでOKされた場合のみ削除
  const handleDelete = async (property) => {
    if (!window.confirm(`「${property.name}」を削除しますか？`)) return
    setError('')
    try {
      await deleteProperty(property.id)
      setProperties((prev) => prev.filter((p) => p.id !== property.id))
    } catch (err) {
      setError('削除に失敗しました：' + err.message)
    }
  }

  // ログアウトしてログイン画面へ戻る
  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="page">
      <header className="header">
        <h1>物件一覧</h1>
        <div className="header-right">
          <span className="user-email">{session?.user.email}</span>
          <button onClick={handleLogout} className="secondary-button">ログアウト</button>
        </div>
      </header>

      <section className="panel">
        <h2>物件を登録</h2>
        <PropertyForm submitLabel="登録" onSubmit={handleCreate} />
      </section>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>読み込み中...</p>
      ) : properties.length === 0 ? (
        <p className="empty">登録された物件はまだありません。</p>
      ) : (
        <div className="card-grid">
          {properties.map((p) => (
            <div key={p.id} className="card">
              {editingId === p.id ? (
                // 編集中のカードはフォームに切り替える
                <PropertyForm
                  initialValues={{ name: p.name, rent: String(p.rent), area: p.area, layout: p.layout }}
                  submitLabel="更新"
                  onSubmit={(values) => handleUpdate(p.id, values)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <h2>{p.name}</h2>
                  {/* 家賃は3桁区切りで表示 */}
                  <p className="rent">{p.rent.toLocaleString('ja-JP')}円 / 月</p>
                  <p className="area">{p.area}・{p.layout}</p>
                  <div className="card-buttons">
                    <button className="secondary-button" onClick={() => setEditingId(p.id)}>編集</button>
                    <button className="danger-button" onClick={() => handleDelete(p)}>削除</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
