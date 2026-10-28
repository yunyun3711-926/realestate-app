# CLAUDE.md

Supabase認証付きの不動産管理Webアプリ（React + Vite）。

## ルール

- ユーザーへの回答は日本語で書く
- コード内のコメントは日本語で書く
- `.env` は絶対にコミットしない（`.gitignore` で除外済み）。新しい環境変数を追加したら `.env.example` にもキー名だけ追記する

## コマンド

```
npm install      # 依存パッケージのインストール
npm run dev      # 開発サーバー起動（http://localhost:5173）
npm run build    # 本番ビルド（dist/ に出力）
npm run preview  # ビルド結果の確認
```

テストフレームワークやLinterは未導入。動作確認は `npm run build` と下記のテストページで行う。

## 構成

- `src/lib/supabase.js` — Supabaseクライアント。`VITE_SUPABASE_URL` と `VITE_SUPABASE_PUBLISHABLE_KEY` を `.env` から読む
- `src/lib/properties.js` — `properties` テーブルのCRUD関数。Supabaseへのデータ操作はここに集約する
- `src/AuthContext.jsx` — セッションを全体に提供（`useAuth()`）
- `src/components/ProtectedRoute.jsx` — 未ログインなら `/login` へリダイレクト
- `src/components/GuestRoute.jsx` — ログイン済みなら `/properties` へリダイレクト
- `src/components/PropertyForm.jsx` — 物件の登録・編集で共通のフォーム
- `src/pages/` — `Login` / `Signup` / `Properties`（一覧・登録・編集・削除）
- `supabase/schema.sql` — テーブル・RLSポリシーの定義。SupabaseダッシュボードのSQL Editorで手動実行する（Publishable keyではDDLを実行できない）
- `vercel.json` — すべてのURLを `index.html` に書き換えるSPA設定。環境変数はVercelダッシュボードで設定する

## Supabase

- `properties` テーブル：`name`（物件名）、`rent`（家賃・円）、`area`（エリア名）、`layout`（間取り）、`user_id`（登録者）
- RLS有効。ログインユーザーは自分の `user_id` の行だけ表示・登録・編集・削除できる。未ログイン（anon）は権限なし
- メール確認はオフ（会員登録直後にセッションが返る）
- スキーマを変更したら `supabase/schema.sql` も更新する

## テスト

- `npm run dev` 中に http://localhost:5173/test.html を開くと、ログイン → CRUD → ログアウト → 未ログインで取得不可、を自動で確認できる
- テスト用ユーザー：`testuser@example.com` / `TestPass1234`（`test.html` と `src/test-flow.js` に記載）
- `test.html` は開発用で、本番ビルドには含まれない
