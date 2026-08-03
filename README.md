# mail-magazine-creator

メルマガのコンテンツを入力すると、HTMLメールとしての見た目をその場で確認できるツール。

左が入力、右がプレビュー。入力すると約200msでプレビューが更新され、ページのリロードは不要。プレビューは開閉できる。

## 入力ブロック

| #   | ブロック                       | 入力                                                                    | 必須 | メール本文への出力                                         |
| --- | ------------------------------ | ----------------------------------------------------------------------- | ---- | ---------------------------------------------------------- |
| 01  | 配信日                         | 日時（内部表現は `YYYYMMDDhhmm`）                                       | ○    | 出さない（プレビュー上部のメタ欄に表示）                   |
| 02  | 件名                           | テキスト                                                                | ○    | 出さない（プレビュー上部のメタ欄に表示）                   |
| 03  | 帯バナー（最大1件）            | 画像パス / URL                                                          | −    | メール最上部に600px全幅の画像。URLがあれば画像全体がリンク |
| 04  | 大バナー（最大3件）            | 画像パス / URL / ボタンURL / ボタンテキスト / 文字色 / 背景色           | −    | 1カラムで縦積み。画像＋任意のボタン                        |
| 05  | 3カラムボックス（最大3セット） | セットごとに タイトル / タイトル文字色、アイテム最大18件、ボタン最大3件 | −    | 3カラム左寄せで並ぶ                                        |
| 06  | 2カラムボックス（最大3セット） | 同上（アイテムにノーマルテキストが加わる）                              | −    | 2カラム左寄せで並ぶ                                        |

- バナーは**画像だけでも表示**される（URL未入力ならリンクなし）。URLだけで画像が無い場合は何も出力しない
- 大バナーのボタンは、ボタンテキストがあり、かつ「ボタンURL または バナーURL」が有効なときだけ出力される（ボタンURLが空ならバナーURLを流用）
- ボタンの既定色は 文字 `#ffffff` / 背景 `#000000`

### カラムボックス（05 / 06）

「タイトル + カラムアイテム + 末尾ボタン」を1セットとし、セット自体を3つまで追加できる。

|                  | 3カラム     | 2カラム     |
| ---------------- | ----------- | ----------- |
| 列数 / 列幅      | 3列 / 176px | 2列 / 268px |
| 太字テキスト     | 最大10文字  | 最大15文字  |
| ノーマルテキスト | なし        | 最大26文字  |

- アイテムは **画像 / ロゴ / URL / 太字テキスト / テキストカラー**（2カラムはノーマルテキストも）
- **ロゴは任意**。指定するとメイン画像の直下に隙間なく繋がり、URLがあれば画像とロゴがまとめて1つのリンクになる
- 端数の行（3カラムに2件など）は空セルが幅を保持するため**左寄せ**のまま崩れない
- 末尾ボタンはコンテンツ幅いっぱい（552px）で縦積み。`ボタンURL` と `ボタンテキスト` が揃ったときだけ出力される
- 3カラム / 2カラムは構造が同型なので、型・リデューサ・UI・HTML生成をすべて共通化し、差分は `COLUMN_VARIANT_CONFIG`（`types/mail.ts`）1か所に集めている

## 使い方

```bash
nvm use          # Node 22（.nvmrc）。Node 18 では Next.js 16 が動かない
npm install
npm run dev      # http://localhost:3000
```

その他のスクリプト:

| コマンド               | 内容               |
| ---------------------- | ------------------ |
| `npm run build`        | 本番ビルド         |
| `npm run lint`         | ESLint             |
| `npm run format`       | Prettier で整形    |
| `npm run format:check` | 整形差分のチェック |

## 技術構成

- Next.js 16 (App Router) / React 19 / TypeScript
- Tailwind CSS v4
- ESLint + Prettier（`prettier-plugin-tailwindcss` でクラス順を自動整列）

**追加ライブラリなし**。UIライブラリ・フォームライブラリ・状態管理ライブラリは、この規模では利点よりコストが上回ると判断して入れていない（検討の詳細は [docs/plan.md](docs/plan.md)）。

## ディレクトリ構成

```
app/
├── layout.tsx            フォント読み込みと metadata
├── page.tsx              Server Component。シェルのみ
└── globals.css           Tailwind テーマ定義
components/
├── AppHeader.tsx         ワードマーク + プレビュー開閉トグル
├── MailEditor.tsx        'use client'。唯一の状態保持者
├── editor/
│   ├── EditorSection.tsx     ブロックの枠（番号・見出し・必須バッジ）
│   ├── FormField.tsx         ラベル / 補足 / エラーの a11y 結線
│   ├── AddItemButton.tsx     「+ 追加 / 上限N件」の共通ボタン
│   ├── fields/               入力欄の共通部品（Text / Url / DateTime / Color）
│   ├── ColumnSet*.tsx        カラムボックス（variant で 05 / 06 を兼ねる）
│   └── *Section.tsx          各ブロックの組み立て
└── preview/
    ├── PreviewMeta.tsx       配信日時・件名（iframe の外）
    └── MailFrame.tsx         iframe srcDoc レンダラ
lib/
├── buildMailHtml.ts      MailData → HTMLメール文字列（純関数）
├── mailReducer.ts        入力状態の更新（純関数）
├── deliveryDate.ts       YYYYMMDDhhmm ⇄ datetime-local ⇄ 表示用文字列
├── color.ts              色コードのサニタイズ
├── escapeHtml.ts         HTMLエスケープ
└── validation.ts         必須チェック / URL検証
hooks/useDebouncedValue.ts
types/mail.ts
```

## 設計メモ

### プレビューは iframe の `srcDoc` で描画する

親ページの Tailwind（preflight を含む）がプレビューに漏れると「実際のメールの見た目」にならない。iframe でスタイルの境界をつくり、メール本文は table + インライン CSS で組んでいる。

`sandbox` からは `allow-scripts` を外してあるため、入力値がスクリプトとして実行される余地はない。

### HTML生成をコンポーネントから切り離す

`buildMailHtml(data: MailData): string` は React に依存しない純関数。将来「HTMLをコピー / ダウンロード」を追加するときは、この関数をそのまま再利用できる。

### XSS対策

- ユーザー入力はすべて `escapeHtml` を通す
- URLは `http:` / `https:` のみ許可（`javascript:` や `data:` は描画しない）
- **色は `escapeHtml` では守れない**。`style` 属性に差し込むため、`red;background:url(...)` のような値が別の宣言として解釈されないよう、`toSafeHexColor` で `#rgb` / `#rrggbb` 以外は既定色に倒している

ボタンテキストに `<script>alert(1)</script>` を入れても、文字列として表示されるだけ。

### 状態管理は `useReducer`

状態はネスト（帯バナー）と可変長配列（大バナー、カラムセット > アイテム / ボタン の3段）を含むため、更新ロジックを純関数 `lib/mailReducer.ts` に切り出して `useReducer` で束ねている。値を読むのは `EditorPanel` と `PreviewPanel` の2つだけなので、Context や状態管理ライブラリは使っていない。

カラム系のアクションはすべて `variant` を持ち、`COLUMN_VARIANT_CONFIG[variant].stateKey` で対象配列を決める。3カラム用・2カラム用にアクションを二重定義しないための作り。

デバウンスはプレビューの iframe だけに掛けている（`srcDoc` の差し替えは再読み込みを伴うため）。入力欄とメタ欄は controlled のまま即時反映され、打鍵の遅延はない。

## 今後の拡張

- HTMLソースのコピー / `.html` ダウンロード
- 大バナーの並べ替え（`mailReducer` に `moveLargeBanner` を追加）
- テンプレート切替、localStorage への下書き保存
- PC / スマホのプレビュー幅切替
- `lib/` 配下の純関数の単体テスト（Vitest）
