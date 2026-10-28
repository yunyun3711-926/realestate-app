import { supabase } from './lib/supabase'
import { createProperty, deleteProperty, fetchProperties, updateProperty } from './lib/properties'

// テスト用ユーザーの認証情報
const TEST_EMAIL = 'testuser@example.com'
const TEST_PASSWORD = 'TestPass1234'

const runButton = document.getElementById('run')
const log = document.getElementById('log')

// 1ステップ分の結果を画面に追記する
function report(ok, text) {
  const li = document.createElement('li')
  li.className = ok ? 'ok' : 'ng'
  li.textContent = (ok ? '✓ ' : '✗ ') + text
  log.appendChild(li)
  if (!ok) throw new Error(text)
}

// 失敗時もreportで表示するため、例外をメッセージに変換して実行する
async function attempt(fn) {
  try {
    return { result: await fn() }
  } catch (err) {
    return { error: err }
  }
}

// ログイン → 物件のCRUD → ログアウトの順に確認する
async function runTest() {
  log.innerHTML = ''
  runButton.disabled = true
  let createdId = null

  try {
    // 1. ログイン
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    })
    report(!error && data.session, error ? 'ログイン失敗：' + error.message : 'ログイン成功：' + data.user.email)
    const userId = data.user.id

    // 2. 一覧取得（SELECT）
    const list = await attempt(fetchProperties)
    report(!list.error, list.error ? '一覧取得失敗：' + list.error.message : `一覧取得成功：${list.result.length}件`)

    // 3. 新規登録（INSERT）
    const created = await attempt(() =>
      createProperty(userId, { name: 'テスト物件', rent: 100000, area: 'テストエリア', layout: '1LDK' })
    )
    report(!created.error, created.error ? '登録失敗：' + created.error.message : `登録成功：ID ${created.result.id}`)
    createdId = created.result.id

    // 4. 編集（UPDATE）
    const updated = await attempt(() => updateProperty(createdId, { rent: 120000, layout: '2LDK' }))
    report(
      !updated.error && updated.result.rent === 120000 && updated.result.layout === '2LDK',
      updated.error ? '編集失敗：' + updated.error.message : '編集成功：家賃120,000円・2LDKに更新'
    )

    // 5. 削除（DELETE）
    const deleted = await attempt(() => deleteProperty(createdId))
    report(!deleted.error, deleted.error ? '削除失敗：' + deleted.error.message : '削除成功')
    createdId = null

    // 6. ログアウト
    const { error: logoutError } = await supabase.auth.signOut()
    report(!logoutError, logoutError ? 'ログアウト失敗：' + logoutError.message : 'ログアウト成功')

    // 7. 未ログインではRLSにより物件が1件も見えない
    const anon = await attempt(fetchProperties)
    report(
      !!anon.error || anon.result.length === 0,
      '未ログイン状態では物件を取得できない（RLS・権限が有効）'
    )

    report(true, 'すべてのテストに成功しました')
  } catch {
    // 失敗内容はreportで表示済み。途中で作った物件が残っていれば片付ける
    if (createdId) await attempt(() => deleteProperty(createdId))
  } finally {
    runButton.disabled = false
  }
}

runButton.addEventListener('click', runTest)
