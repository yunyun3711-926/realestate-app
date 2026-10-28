import { useState } from 'react'

const EMPTY = { name: '', rent: '', area: '', layout: '' }

// 物件の登録・編集で共通して使う入力フォーム
// initialValues を渡すと編集フォーム、渡さなければ新規登録フォームになる
export default function PropertyForm({ initialValues, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues ?? EMPTY)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      // 家賃は数値に変換し、文字列は前後の空白を除いて保存する
      await onSubmit({
        name: values.name.trim(),
        rent: Number(values.rent),
        area: values.area.trim(),
        layout: values.layout.trim(),
      })
      // 新規登録の場合は入力欄を空に戻す
      if (!initialValues) setValues(EMPTY)
    } catch (err) {
      setError('保存に失敗しました：' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="property-form">
      <label>
        物件名
        <input name="name" value={values.name} onChange={handleChange} maxLength={100} required />
      </label>
      <label>
        家賃（円）
        <input name="rent" type="number" min="0" step="1" value={values.rent} onChange={handleChange} required />
      </label>
      <label>
        エリア名
        <input name="area" value={values.area} onChange={handleChange} maxLength={100} required />
      </label>
      <label>
        間取り
        <input name="layout" value={values.layout} onChange={handleChange} placeholder="例：1LDK" maxLength={20} required />
      </label>
      {error && <p className="error">{error}</p>}
      <div className="form-buttons">
        <button type="submit" disabled={submitting}>
          {submitting ? '保存中...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="secondary-button" onClick={onCancel} disabled={submitting}>
            キャンセル
          </button>
        )}
      </div>
    </form>
  )
}
