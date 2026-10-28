import { supabase } from './supabase'

// 物件テーブルへのCRUD操作をまとめたモジュール
// どの関数もRLSにより「ログイン中のユーザー自身の物件」だけが対象になる

const COLUMNS = 'id, name, rent, area, layout, created_at'

// 一覧取得（SELECT）：新しい順
export async function fetchProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select(COLUMNS)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// 新規登録（INSERT）：登録者として自分のユーザーIDを記録する
export async function createProperty(userId, values) {
  const { data, error } = await supabase
    .from('properties')
    .insert({ ...values, user_id: userId })
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data
}

// 編集（UPDATE）
export async function updateProperty(id, values) {
  const { data, error } = await supabase
    .from('properties')
    .update(values)
    .eq('id', id)
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data
}

// 削除（DELETE）
export async function deleteProperty(id) {
  const { error } = await supabase.from('properties').delete().eq('id', id)
  if (error) throw error
}
