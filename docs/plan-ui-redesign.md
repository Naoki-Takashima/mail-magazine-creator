# メルマガ作成ツール: UI刷新（Notion風ミニマル）

## Context

機能実装（入力ブロック01〜09 / プレビュー固定 / スマホモック / HTML出力）が完了した。
現在の見た目は「紙の校正刷り」テーマ（生成り色の紙・墨・朱、直角、全編 mono 風の大文字＋字送り装飾）で、
情報より装飾が前に出ている。入力ブロックが9つに増えた今は、説明文・番号・英字ラベル・
バッジが積み重なって画面が重い。

これを **Notion のような無駄のないミニマル** に刷新する。色・形・余白・タイポグラフィを
入れ替え、装飾要素は削る。**機能とHTML出力の内容は一切変えない**。

### ヒアリング済みの確定仕様

| 論点               | 決定                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| 角の丸み           | **8px**（カード・入力欄・ボタン）、小さい要素は 6px                             |
| ベース色           | **白 + ライトグレー**                                                           |
| アクセント         | **`#2383E2`**（Notion のリンク青相当）。エラーは別色の赤 **`#E03E3E`**          |
| 入力欄のラベル     | 小さく控えめ                                                                    |
| 入力欄のフォーカス | アクセント色の枠線が光る                                                        |
| 説明文             | **全部削除**（ブロック説明13件 + 入力欄の補足すべて）                           |
| `Required` バッジ  | **`※`** に置換                                                                  |
| `Optional` バッジ  | **削除**                                                                        |
| 装飾の英字ラベル   | **すべて削除**（Compose / Render / Export / 縦組み Live Preview / 番号 01〜09） |
| 余白               | ゆったり                                                                        |
| プレビュー枠       | モックアップ風（**既存の `PhoneMock` を踏襲**し、テーマに合わせて調整）         |

### 絶対に変えないもの

- `lib/buildMailHtml.ts` が出す **メールHTMLの色・構造**（配信物そのもの。アプリのテーマとは無関係）
- 状態管理・バリデーション・HTML出力の挙動
- `PhoneMock` の寸法計算（iPhone 16 の画面比 393:852 / 高さから逆算する縮小率）

---

## アプローチ

### 1. 色は「トークンの値だけ」差し替える（`app/globals.css`）

現状すべてのコンポーネントが `bg-paper` / `text-ink` / `border-rule` / `text-vermilion` という
**意味づけされたトークン経由**で色を参照している（`border-rule` 28箇所、`text-ink-faint` 36箇所ほか）。
生の hex を書いている箇所は無い。つまり **色の刷新は `@theme` の値の差し替えでほぼ完了する**。

ただし `paper`（生成り）/`ink`（墨）/`vermilion`（朱）という名前は新テーマでは嘘になるので、
併せて名前も付け替える。置換は機械的（クラス名の一括置換）。

| 現在                 | 新                     | 値        | 用途                       |
| -------------------- | ---------------------- | --------- | -------------------------- |
| `--color-paper`      | `--color-canvas`       | `#ffffff` | アプリの地                 |
| `--color-paper-sunk` | `--color-canvas-sunk`  | `#f7f7f5` | プレビュー面・入れ子カード |
| `--color-card`       | （`canvas` に統合）    | —         | —                          |
| `--color-ink`        | `--color-fg`           | `#37352f` | 本文                       |
| `--color-ink-soft`   | `--color-fg-soft`      | `#6f6e69` | ラベル・補助               |
| `--color-ink-faint`  | `--color-fg-faint`     | `#9b9a97` | プレースホルダ・件数       |
| `--color-rule`       | `--color-rule`（据置） | `#e9e9e7` | 罫線                       |
| `--color-vermilion`  | `--color-accent`       | `#2383e2` | ボタン・フォーカス・`※`    |
| （新規）             | `--color-accent-soft`  | `#eaf3fc` | フォーカスリング・hover    |
| （新規）             | `--color-danger`       | `#e03e3e` | エラー文言・枠             |

`text-fg` のような重複した読みを避けるため `fg` / `canvas` を採用する。

あわせて同ファイルで:

- **`.texture-grid` を削除**（方眼テクスチャは紙モチーフ。ミニマルと衝突）
- `.animate-rise` を控えめに（`12px / 0.55s` → `8px / 0.32s`）
- `--font-display` / `--font-mono` のエイリアスをやめる。
  `--font-sans` は Hiragino のまま維持（ユーザー指定）。
  `--font-mono` は**本物の等幅**（`ui-monospace, SFMono-Regular, Menlo, monospace`）にし、
  **色コード入力と出力ファイル名だけ**に使う（桁が揃うと読みやすい実利がある箇所）
- `.editor-scroll`（`scrollbar-gutter: stable`）は据置

### 2. タイポグラフィの装飾を落とす

全編にかかっている `font-mono` + `uppercase` + `tracking-[0.16em〜0.4em]`（合計90箇所ほど）を外す。

- 入力ラベル: `text-[12px] font-medium text-fg-soft`（小さく控えめ）
- ブロック見出し: `text-[15px] font-semibold text-fg`
- 件数などの meta: `text-[12px] text-fg-faint`（`MAX 1` → `最大1件`、`2 / 3` は据置）

### 3. 入力欄を「線」から「箱」に（`components/editor/FormField.tsx`）

`fieldClassName` を差し替える。これが全入力欄（Text / Url / DateTime / Color）の唯一の出どころ。

```
現在: 下線1本 + フォーカスで朱色
新:   border border-rule rounded-lg bg-canvas px-3 py-2
      focus:border-accent focus:ring-2 focus:ring-accent-soft
      aria-invalid:border-danger
```

これで要件の「フォーカスした際にアクセントカラーの枠線が光る」を満たす。

同時に **`description` プロップを FormField / FieldProps から削除**する。
説明文を全部消すと使い道が無くなるため、`descriptionId` / `describedBy` の分岐も畳んで
エラーだけを `aria-describedby` に結ぶ形に簡約する。

### 4. 削る要素

| 対象                    | 場所                                                                       |
| ----------------------- | -------------------------------------------------------------------------- |
| ブロック説明 13件       | 各 `*Section.tsx` の `description=`                                        |
| 入力欄の補足 全件       | `ColumnItemCard` / `TopicItemCard` / `TitleFields` / `DeliveryDateSection` |
| 番号 `01`〜`09`         | `EditorSection` の `index` プロップごと削除                                |
| `Optional` バッジ       | `EditorSection`                                                            |
| `Required` バッジ → `※` | `EditorSection`（アクセント色の小さな `※`、`aria-label="必須"`）           |
| `Compose` / `Export`    | `EditorPanel` / `ExportSection`                                            |
| 縦組み `Live Preview`   | `PreviewPanel`                                                             |

### 5. 面と階層の付け方

- ブロックは**カードにしない**。白地のままゆったりした余白（`px-8 py-9`）＋ 1px の区切り罫線。
  9ブロックすべてを枠で囲うと画面が重くなるため
- 入れ子（大バナー / カラムセット / トピック / ボタン）は
  `bg-canvas-sunk rounded-lg border border-rule` の箱にして階層を示す。さらにその内側は
  `bg-canvas rounded-lg`（現在の「沈めた面 / 用紙面」の反転版）
- `AddItemButton`: 破線 → `border border-rule rounded-lg text-fg-soft`、hover でアクセント色
- `ExportSection` のボタン: アクセント塗り + `rounded-lg`
- `AppHeader`: `bg-canvas/80 backdrop-blur border-b border-rule`、トグルは丸みのある控えめなボタン。ロゴ画像は据置

### 6. プレビュー側

- `PreviewPanel`: `texture-grid` を外して `bg-canvas-sunk` のフラットな面に。縦組みラベル削除
- `PreviewMeta`: 白カード + `rounded-lg border border-rule`、ラベルは小さく控えめ
- `PhoneMock`: ベゼルは `bg-fg`（トークン置換で自動的に `#37352f` の落ち着いた黒に）。
  影を少し弱め、外周に薄いリングを足す。**寸法計算には触らない**
- `SubjectBar` / `MailFrame`: 端末画面の中はメーラーの世界なので現状の素の色を維持。
  `bg-card` → `bg-canvas` の置換のみ

---

## 変更するファイル

**中心（ここを直せば大半が波及）**

- `app/globals.css` — トークン・テクスチャ・アニメーション・フォント
- `components/editor/FormField.tsx` — ラベル / `fieldClassName` / `description` 削除
- `components/editor/EditorSection.tsx` — 番号・バッジ・見出し

**個別に手を入れる**

- `components/AppHeader.tsx` / `components/editor/EditorPanel.tsx` / `components/editor/AddItemButton.tsx` / `components/editor/ExportSection.tsx`
- `components/preview/{PreviewPanel,PreviewMeta,PhoneMock,MailFrame}.tsx`
- `components/editor/fields/{BaseInputField,ColorField,DateTimeField,TextField,UrlField}.tsx` — `description` 撤去、ColorField のスウォッチ丸み

**機械的な置換のみ（クラス名の一括置換 + `description=` / `index=` 行の削除）**

- `components/editor/*Section.tsx`（8ファイル）、`components/editor/*Card.tsx`（5ファイル）、`TitleFields.tsx` / `ButtonFields.tsx`

**ドキュメント**

- `README.md` — 「紙の校正刷り」前提の記述を更新
- `docs/plan-ui-redesign.md` — 本計画書を配置（これまでの Phase と同じ運用）

---

## Verification

```bash
nvm use && npm run format:check && npx tsc --noEmit && npm run lint && npm run build
```

自動で確かめること:

- 旧トークン名の残骸が無いこと
  `grep -rn 'paper\|ink-soft\|ink-faint\|vermilion\|texture-grid' components app --include=*.tsx --include=*.css` が空
- 装飾の残骸が無いこと
  `grep -rn 'font-mono\|uppercase\|tracking-\[' components` が **色コード入力とファイル名の2箇所のみ**
- `description=` / `index=` の呼び出しが 0 件
- **`lib/buildMailHtml.ts` が無変更**（`git diff --stat lib/` が空）。
  既存の HTML 生成テスト（`node --experimental-strip-types`）を再実行して全 PASS
- 配信HTML（dev サーバーの srcDoc）に `#f3f4f6` / `#e5e7eb` などメール側の色がそのまま残ること

ブラウザ確認（目視は依頼者側。Chrome拡張が未接続のため）:

1. 白地 + ライトグレーになり、朱色・生成り・方眼テクスチャが消えている
2. 入力欄が箱型で、フォーカスすると青い枠 + 淡い青のリングが出る
3. 必須ブロック（配信日 / 件名）の見出しに `※`、`Optional` が消えている
4. 説明文・番号・英字ラベルが消え、ラベルと入力欄だけになっている
5. プレビューのスマホ枠が残り、中のメールの見た目が刷新前と同一
6. HTML出力ボタンが青塗りで、disabled 時の理由表示も従来どおり
7. 幅 375px / 1024px / 1920px で崩れない
