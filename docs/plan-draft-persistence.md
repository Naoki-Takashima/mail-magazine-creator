# 入力内容の自動保存

## 要件

- 入力した状態でリロードしても内容が消えないようにする
- 復元したことが分かるようにする
- 入力を空に戻す手段を用意する

## 確定した仕様（ヒアリング）

| 論点         | 決定                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| 保存先       | **localStorage**（リロード・タブを閉じる・ブラウザ再起動すべてに耐える）      |
| 復元の見せ方 | **黙って自動復元**し、「前回の入力を復元しました / 破棄する」の帯を出す       |
| クリア       | **必要**。確認を挟む                                                          |
| 保存対象     | `MailData` のみ。画面の状態（`hasTriedExport`・プレビューの開閉）は保存しない |

### 却下した案

- **sessionStorage** — タブを閉じると消える。リロード対策としては足りるが、
  「昨日の続きから」ができない
- **URL に載せる** — メルマガ本文は長大で、URL長の実質上限（2000文字前後）に確実に当たる
- **サーバー保存** — ランタイム依存ゼロのクライアント完結構成が崩れる
- **`beforeunload` の離脱警告** — 自動保存があれば不要。誤操作を1つ増やすだけになる

## 設計

### 保存の入れ物（`lib/draftStorage.ts`）

React 非依存の関数3つ。`buildMailHtml` と同じく副作用を持つのは localStorage への読み書きだけ。

```ts
loadDraft(): MailData | null
saveDraft(data: MailData): void
clearDraft(): void
```

- 保存形式は `{ version, data }`。**`MailData` の形を変えたら `DRAFT_VERSION` を上げる**。
  上げ忘れると、キーが欠けた古い下書きがそのまま復元されて画面が壊れる
- `typeof window === 'undefined'` と `try/catch` で全部くるむ。SSR、localStorage の無効化、
  容量超過（`QuotaExceededError`）のいずれでもアプリを落とさない
- 読み込みは `{ ...INITIAL_MAIL_DATA, ...data }` の浅いマージ + トップレベルのキーの型だけ見る簡易ガード。
  中身まで検証しないのは、形が変わったときは `version` で丸ごと捨てる方が確実で安いため

### 復元と保存（`components/MailEditor.tsx`）

**復元** — マウント後の `useEffect` で1回だけ。`useReducer` の初期値は `INITIAL_MAIL_DATA` のまま。
localStorage を持たない SSR と描画結果がずれる（hydration 不一致）ため、初期値から読んではいけない。

**保存** — 専用に 500ms のデバウンス（`useDebouncedValue`）を張る。localStorage への書き込みは
同期処理なので、打鍵ごとに走らせない。

保存の effect には「まだ一度も編集していないなら書かない」条件が要る。

```ts
if (draftToSave === INITIAL_MAIL_DATA) return;
```

これが無いと、**復元より先に保存が走って保存済みの下書きを空で上書きする**。
リデューサは必ず新しいオブジェクトを返すので、参照が初期値のままなら未編集と判定できる。
フラグや ref で effect の実行順を制御するより堅い。

**クリア** — `clearAll` は `INITIAL_MAIL_DATA` を返す＝参照が一致するので上の保存 effect は動かない。
だから `clearDraft()` をハンドラで明示的に呼ぶ必要がある。

### リデューサ（`lib/mailReducer.ts`）

```ts
| { type: 'restoreDraft'; data: MailData }   // action.data をそのまま返す
| { type: 'clearAll' }                        // INITIAL_MAIL_DATA を返す
```

純関数のまま。localStorage に触るのは `MailEditor` 側。

### UI

- `RestoreNotice` — 入力見出しの直下。`role="status"` で読み上げにも届ける。
  破棄は復元直後の限定操作なので確認は挟まない（まだ失うものが無い）
- `ClearDraftButton` — フッター。押すと同じ場所が「入力をすべて消しますか？ [消す] [やめる]」に
  変わる**インライン2段階**。`window.confirm` は使わない（ページの操作を止めるうえ、テーマから浮く）
- フッター文言を「入力内容はこの端末のブラウザに自動保存されます。サーバーには送信されません。」に修正。
  従来の「どこにも保存・送信されません」は事実と食い違うため

## 実装メモ

`useEffect` の中で `setState` を呼ぶ箇所（復元の帯を出す）だけ
`react-hooks/set-state-in-effect` を1行外している。外部ストアの中身を初回に1回だけ取り込む処理で、
連鎖レンダリングにならないため。ref に逃がすとレンダー中に読むことになり、
今度は `react-hooks/refs` に反する。

### 表示値をローカルに持つフィールドは同期が要る

`DateTimeField` は `input[type=datetime-local]` 用の生の文字列を自前の state に持っている
（打鍵の途中で変換結果が `''` になり、表示まで巻き戻ると打ち直しになるため）。
この初期値は**マウント時の `value` しか見ない**ので、マウント後に走る復元では反映されなかった。

props が外から差し替わったときだけ表示に反映する。打鍵由来の変化は `handleChange` 側で
同期済みとして記録しておくので、入力途中の `''` では巻き戻らない。

```tsx
const [syncedValue, setSyncedValue] = useState(value);
if (value !== syncedValue) {
  setSyncedValue(value);
  setRawValue(toDatetimeLocalValue(value));
}
```

ローカル state を持つフィールドは今のところこれ1つだけ。
同じ作りのものを増やすときは、復元とクリアの両方で追従するか必ず確かめる。

## 検証

`lib/draftStorage.test.ts`（往復・壊れたデータ8種・キー欠落・localStorage が例外を投げる場合）と
`lib/mailReducer.test.ts`（`restoreDraft` / `clearAll` の参照）、
`components/editor/{RestoreNotice,ClearDraftButton}.test.tsx`、
`components/editor/fields/DateTimeField.test.tsx`（復元・クリアでの追従、打鍵中に消えないこと）。

ブラウザでの確認:

1. 入力 → リロード → 内容が戻り、帯が出る
2. 帯の「破棄する」→ 空になり、再リロードしても空
3. 「入力をすべてクリア」→ 確認 → [消す] で空。再リロードしても空
4. 何も入力せずリロード → 帯は出ない
5. プライベートウィンドウでも入力・プレビュー・HTML出力が動く（保存が効かないだけ）
