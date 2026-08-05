# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

メルマガの入力内容を HTML メールに変換し、スマホ枠のプレビューで確認・ダウンロードするツール。仕様・設計判断の詳細は [README.md](README.md) にある（入力ブロック9種の一覧、レイアウト固定の理由、プレビュー縮小の仕組みなど）。ここでは README に書かれていない作業上の要点だけをまとめる。

## コマンド

```bash
nvm use          # Node 22 必須（.nvmrc）。Node 18 では Next.js 16 が起動しない
npm install
npm run dev      # http://localhost:3000
npm run build    # 本番ビルド（型エラーもここで出る）
npm run lint     # ESLint（flat config、引数なしでリポジトリ全体）
npm run format   # Prettier で整形
```

**テストフレームワークは未導入**。検証は `npm run build`（型）+ `npm run lint` + ブラウザでの目視。`lib/` の純関数に Vitest を入れるのは README「今後の拡張」に残っている未着手項目。

## アーキテクチャ

データの流れは一方向: `MailData`（state）→ `buildMailHtml` → iframe `srcDoc` / ダウンロード。

- `app/page.tsx` は Server Component でシェルのみ。`components/MailEditor.tsx` が `'use client'` かつ **アプリ唯一の状態保持者**（`useReducer(mailReducer, INITIAL_MAIL_DATA)`）。state を読むのは `EditorPanel` と `PreviewPanel` の2つだけ。Context・状態管理ライブラリは意図的に不使用
- `lib/buildMailHtml.ts` は React 非依存の純関数 `(data, { forPreview? }) => string`。メールクライアントが `<head>` の CSS を落とす前提で、レイアウトは table・装飾はインライン style
- `lib/mailReducer.ts` も純関数。**id の採番（`crypto.randomUUID()`）はリデューサではなく `MailEditor` 側**で行い、action に載せて渡す
- `lib/validation.ts` の `validateMailData` はエラーが無いキーを省いた入れ子オブジェクトを返す。エラーはデバウンスせず即時、プレビュー iframe だけ 200ms デバウンス。ただし**必須（配信日・件名）の未入力エラーだけは HTML出力を試みるまで伏せる**（`omitRequiredErrors`、`MailEditor` の `hasTriedExport`）

## 変更時に踏みやすい落とし穴

- **3カラム / 2カラムは同一実装**。型・リデューサ・UI・HTML生成すべて共通で、差分は `types/mail.ts` の `COLUMN_VARIANT_CONFIG`（列数・文字数上限・セル幅・`stateKey`）だけ。片方だけ直す変更はまず設計ミス。カラム系 action は必ず `variant` を持つ
- **メール本文の色とアプリの色は別世界**。UI 側は生 hex を書かず `app/globals.css` の `@theme` トークン（`canvas` / `fg` / `rule` / `accent` / `danger` 等）だけを使う。`buildMailHtml` が出す色は配信物の色なのでトークンと無関係
- **幅の定数は `types/mail.ts`**（`MAIL_WIDTH` = 600、`MAIL_CONTENT_WIDTH` = 552 ほか）。HTML生成とプレビューが同じ値を見ている。カードは `width:600px; max-width:100%` なので、iframe の実効幅が 600px を下回るとカードが縮んで 3カラムの固定幅セルがはみ出す → プレビュー用HTMLでは body 余白とスクロールバーを外している
- **端末枠は計測が済むまで `opacity-0`**。SSR HTML には上限値の枠（413 × 892px）が焼き込まれるので、外すとリロードのたびに「大きい枠 → 縮む」が見える。`useElementSize` の `getBoundingClientRect()` による同期初期計測（`ResizeObserver` の初回コールバックは paint 後に来る）とセットで効いている
- **`min-h-0` の連鎖**（body → main → 各列 → 端末枠）を1か所でも落とすと、`lg` 以上のビューポート固定レイアウトが壊れてプレビューが画面外へ流れる
- **iframe の `sandbox` から `allow-scripts` は外したまま**にする。入力は `escapeHtml`、URL は `toSafeHttpUrl`（http/https のみ）、色は `toSafeHexColor`（`style` 属性に差し込むためエスケープでは守れない）を必ず経由させる
- **帯バナー（03）だけは配列ではなく `StripBanner | null`**。1件しか置けないため。`null` = 未追加で、入力欄も出さない。`setStripBannerField` は `null` のとき何もしない（追加前に値が入る経路を塞ぐ）
- **下部大バナー（07）・トピックス（08）は中身0件ならブロックごと出さない**。入力側はタイトル欄（08 はボタン欄も）を隠し、`buildMailHtml` も `banners === ''` / `itemsHtml === ''` で `''` を返す。片方だけ直すと「画面に無い値が配信物に出る」ずれになる
- **HTML出力ボタンは disabled にしない**。押せないボタンは理由を返せないため、押した時点でエラーを出して出力だけ止める。理由は「必須の欠け → URLエラー」の順に1つだけ出す

## 入力ブロックを追加・変更するとき

型（`types/mail.ts`）→ 初期値 `INITIAL_MAIL_DATA` と `create*` ファクトリ → action と reducer（`lib/mailReducer.ts`、リスト操作は `addToList` / `removeFromList` / `updateInList` の3ヘルパに集約、上限チェックは `addToList` 内）→ `validateMailData` → `buildMailHtml` → `components/editor/*Section.tsx` を `EditorPanel` に差す → `MailEditor` にハンドラ束を追加、の順に触ることになる。

新しい部品を足す前に既存の共通部品を確認する: `EditorSection` / `FormField` / `AddItemButton` / `TitleFields` / `ButtonFields` / `fields/*`、HTML側は `buildBlockTitle` / `buildBlockButton` / `buildButtonRow`（ボタンの見た目は全種ここに集約。3セル構成でテキスト中央 + 右端にくの字矢印）、型は `BannerLink` / `LargeBanner` / `ButtonContent`。

## 規約

- コメント・UI文言・README・`docs/` はすべて日本語。コメントは「何をしているか」ではなく**なぜそうしたか**を書く（既存コードがその粒度）
- import は `@/` エイリアス（`@/lib/...`、`@/types/mail`）
- Prettier: シングルクォート / セミコロンあり / `printWidth: 100` / `trailingComma: all`。`prettier-plugin-tailwindcss` がクラス順を整列するので手で並べ替えない
- `docs/plan-*.md` は機能ごとの実装計画の記録。大きめの機能を足すときは既存の書式に倣って計画を残す
