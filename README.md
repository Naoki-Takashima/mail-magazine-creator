# mail-magazine-creator

メルマガのコンテンツ（URL / 画像URL / テキスト）を入力すると、HTMLメールとしての見た目をその場で確認できるツール。

左が入力、右がプレビュー。入力すると約200msでプレビューが更新され、ページのリロードは不要。プレビューは開閉できる。

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
├── editor/               入力欄（状態を持たない）
└── preview/              プレビュー（状態を持たない）
lib/
├── buildMailHtml.ts      MailData → HTMLメール文字列（純関数）
├── escapeHtml.ts         HTMLエスケープ
└── validation.ts         URL検証
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

ユーザー入力はすべて `escapeHtml` を通し、URLは `http:` / `https:` のみ許可する（`javascript:` や `data:` は描画しない）。テキスト欄に `<script>alert(1)</script>` を入れても、文字列として表示されるだけ。

### 状態管理は `useState` のみ

状態は入力3値 + 開閉フラグだけで、受け渡しも `MailEditor → EditorPanel → 各Input` の2階層に収まる。Context や外部ライブラリは、複数の離れたコンポーネントが同じ状態を読む状況になってから検討する。

デバウンスはプレビュー側だけに掛けている（iframe の `srcDoc` 差し替えは再読み込みを伴うため）。入力欄自体は controlled のまま即時反映され、打鍵の遅延はない。

## 今後の拡張

- HTMLソースのコピー / `.html` ダウンロード
- 複数ブロックの追加・並べ替え（このタイミングで `useReducer` + zod を検討）
- テンプレート切替、localStorage への下書き保存
- PC / スマホのプレビュー幅切替
- `buildMailHtml` と `validation` の単体テスト（Vitest）
