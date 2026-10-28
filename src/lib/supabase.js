import { createClient } from '@supabase/supabase-js'

// .envから接続情報を読み込む
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('.envにVITE_SUPABASE_URLとVITE_SUPABASE_PUBLISHABLE_KEYを設定してください')
}

// アプリ全体で共有するSupabaseクライアント
export const supabase = createClient(supabaseUrl, supabaseKey)
