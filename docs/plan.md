# メルマガ作成ツール MVP 実装計画

## Context

個人開発・ポートフォリオ目的。メルマガのコンテンツ（URL / 画像URL / テキスト）をGUI入力 → 実際のメルマガに近い見た目でリアルタイムプレビュー。左右2分割レイアウト、プレビューは開閉可能。DB・認証なし。

現状リポジトリは `README.md` と `.gitignore` のみ（実質 greenfield）。

ユーザー確定事項:

- メルマガ形式 = **HTMLメール**（table + インラインCSS）
- 入力ブロック = **固定1セット**（URL / 画像URL / テキスト 各1）
- HTML出力（コピー/DL）= **今回は実装しない**
- 品質範囲 = ESLint + Prettier / Vercelデプロイ / レスポンシブ対応（自動テストは今回外）

---

## Step 1. 要件整理

### 確定要件

- 入力: URL / 画像URL / テキスト（各1つ）
- 入力変更 → リロードなしでプレビュー即反映
- 左右2分割レイアウト（入力 | プレビュー）
- プレビューをアコーディオン開閉、閉時は入力エリアが幅を使う
- HTMLメール見た目のプレビュー
- Next.js / TypeScript / React / Tailwind CSS
- DB・ログインなし
- レスポンシブ対応、ESLint + Prettier、Vercelデプロイ

### 未確定 → 本計画で決め打ち（後で変更容易）

- メルマガのデザイン: 幅600px中央寄せ・白背景・グレー外枠の汎用テンプレート1種
- 画像URL不正/読込失敗時: プレースホルダ枠 + 代替文言
- テキストの改行: 改行のみ反映（Markdown非対応）
- 空入力時: 該当ブロックをプレビューから非表示（ダミー文言を出さない）
- 入力の永続化: なし（リロードで消える）

### 今後追加できそうな機能（今回はやらない）

- HTMLソースのコピー / .html ダウンロード
- 複数ブロックの追加・並べ替え（テキスト/画像/ボタンを任意順）
- テンプレート切替、カラーテーマ
- localStorage 保存、テスト送信、プレーンテキスト版タブ
- PC/スマホ プレビュー幅切替、ダークモード

---

## Step 2. MVP定義

**やる**

1. 入力フォーム表示（URL / 画像URL / テキスト）
2. 3値を state 管理、変更でプレビュー即更新
3. 左右2分割レイアウト（lg以上）
4. プレビュー開閉
5. HTMLメール準拠プレビュー（table + インラインCSS、iframe描画）
6. 軽量バリデーション（URL形式・スキーム）+ HTMLエスケープ
7. レスポンシブ（lg未満は縦積み）
8. ESLint + Prettier、Vercelデプロイ

**やらない（明示）**

- HTML出力・コピー・ダウンロード
- 複数ブロック / 並べ替え
- DB・認証・保存・送信
- 自動テスト（Vitest）、Storybook、UIコンポーネントライブラリ
- 状態管理ライブラリ（Zustand / Jotai / Redux）
- ダークモード、i18n

---

## Step 3. 技術・ライブラリ選定

### 採用

| 項目                                                                   | 内容                                                        |
| ---------------------------------------------------------------------- | ----------------------------------------------------------- |
| Next.js 15 (App Router)                                                | 要件どおり。今回は静的1ページだがポートフォリオ的に標準構成 |
| TypeScript strict                                                      | 型で入力データを保証                                        |
| Tailwind CSS v4                                                        | エディタ側UIのみに使用（プレビュー内部は使わない、後述）    |
| ESLint (next/core-web-vitals) + Prettier + prettier-plugin-tailwindcss | クラス順自動整列。レビュー時の差分ノイズ削減                |

**Node要件（重要）**: 現環境 `node v18.16.0`。Next.js 15 は Node **18.18+**（実質20/22推奨）→ このままでは動かない。
nvm に `v22.19.0` 導入済み → `nvm use 22` + リポジトリに `.nvmrc`（`22`）を置く。

### 追加ライブラリ: 原則ゼロ。検討結果

- **UIライブラリ（shadcn/ui, MUI, Radix）— 不採用**
  - 必要性: 今回のUIは input / textarea / 開閉ボタンのみ
  - 導入メリット: アコーディオンのa11y（aria-expanded, キーボード操作）が無料で手に入る
  - 不採用時のデメリット: a11y属性を自前で書く必要 → ただし数行。依存追加とスタイル学習コストの方が大きい
- **react-hook-form — 不採用**
  - メリット: 非制御化で再レンダリング削減、バリデーション統合
  - 不採用時デメリット: 自前 controlled state。本ツールは「1文字ごとに全体再描画」が仕様そのもの → RHFの利点（再レンダリング抑制）が要件と噛み合わない
- **zod — 不採用**
  - メリット: 宣言的スキーマ、将来のフォーム拡張に強い
  - 不採用時デメリット: 検証ロジックが手書き。ただし今回はURL 2本のみ、ブラウザ標準 `new URL()` で十分
- **lodash.debounce — 不採用**
  - 代わりに自前 `useDebouncedValue`（15行）。1関数のために依存追加は不要
- **clsx / tailwind-merge — 不採用**
  - 条件付きクラスはテンプレートリテラルで足りる規模

> 方針: MVPでは依存を足さない。複数ブロック対応に進む段階で zod + react-hook-form（またはZustand）を再検討する、と README に記す。

---

## Step 4. 画面設計

### レイアウト

- lg以上: `grid grid-cols-[minmax(360px,1fr)_1.4fr]`。プレビュー閉時は1カラム
- lg未満: 縦積み（入力が上、プレビューが下）
- 上部にヘッダー（アプリ名 + プレビュー開閉トグル）

```
┌──────────────────────────────────────────────┐
│ Header            [プレビューを隠す ▲]        │
├───────────────────┬──────────────────────────┤
│ EditorPanel       │ PreviewPanel             │
│  URL     [      ] │  ┌────────────────────┐  │
│  画像URL [      ] │  │ iframe (600px幅)   │  │
│  テキスト[      ] │  │  画像 / テキスト / │  │
│                   │  │  リンク            │  │
│                   │  └────────────────────┘  │
└───────────────────┴──────────────────────────┘
```

### コンポーネント構成

```
app/
├── layout.tsx            Server: html/body, フォント, metadata
├── page.tsx              Server: ページシェル + <MailEditor />
└── globals.css           Tailwind エントリ

components/
├── MailEditor.tsx        'use client' 唯一の状態保持者 + 2分割レイアウト + 開閉状態
├── editor/
│   ├── EditorPanel.tsx   入力群のまとめ（presentational）
│   ├── FormField.tsx     label + 説明 + エラー表示の共通ラッパ
│   ├── UrlInput.tsx
│   ├── ImageInput.tsx
│   └── TextInput.tsx     textarea
└── preview/
    ├── PreviewPanel.tsx  見出し + 開閉アニメーション + MailFrame
    └── MailFrame.tsx     iframe srcDoc レンダラ

lib/
├── buildMailHtml.ts      MailData → HTMLメール文字列（純関数）
├── escapeHtml.ts         XSS対策エスケープ
└── validation.ts         URL / 画像URL 検証

hooks/
└── useDebouncedValue.ts

types/
└── mail.ts
```

**設計上の要点（ポートフォリオで語れる部分）**

1. **プレビューは iframe + `srcDoc`**
   - 理由: 親ページのTailwind preflight/継承スタイルがプレビューに漏れると「実際のメルマガの見た目」にならない。iframeでスタイル境界を作る
   - `sandbox="allow-popups allow-popups-to-escape-sandbox"`（**allow-scripts は付けない**）
2. **HTML生成は純関数 `buildMailHtml(data): string` に分離**
   - コンポーネントから独立 → 将来の「HTMLコピー/DL」機能がこの関数の再利用だけで済む
   - 単体テストを後から足しやすい
3. **XSS対策**: 全ユーザー入力を `escapeHtml` 通す。URLは `http:` / `https:` のみ許可（`javascript:` / `data:` 拒否）
4. **`MailEditor` 以外は状態を持たない presentational** → 差し替え・再利用が容易

---

## Step 5. データ設計

`types/mail.ts`

```ts
export type MailData = {
  url: string;
  imageUrl: string;
  text: string;
};

export type MailField = keyof MailData;

/** フィールド単位の検証エラー。値が無い = エラー無し */
export type ValidationErrors = Partial<Record<MailField, string>>;

export const INITIAL_MAIL_DATA: MailData = {
  url: '',
  imageUrl: '',
  text: '',
};
```

- 全て `string`（入力途中の不正値もそのまま保持し、表示側で握りつぶす）
- `MailField` を派生させることで `updateField(field, value)` を型安全に1本化 → 入力欄が増えてもハンドラを増やさない
- 将来の複数ブロック化を見据え、`MailData` は「1通ぶんのコンテンツ」を表す名前にしておく（`MailBlock[]` へ発展させる余地）

---

## Step 6. 状態管理

**結論: `MailEditor.tsx` 内の `useState` のみ。Context も外部ライブラリも使わない。**

```ts
'use client';

const [mailData, setMailData] = useState<MailData>(INITIAL_MAIL_DATA);
const [isPreviewOpen, setIsPreviewOpen] = useState(true);

const updateField = useCallback((field: MailField, value: string) => {
  setMailData((prev) => ({ ...prev, [field]: value }));
}, []);

const errors = useMemo(() => validateMailData(mailData), [mailData]);

// iframe の srcDoc 再生成は再読み込みを伴うのでデバウンス
const debouncedData = useDebouncedValue(mailData, 200);
const html = useMemo(() => buildMailHtml(debouncedData), [debouncedData]);
```

理由:

- 状態は3値 + 開閉フラグのみ。props の受け渡しは **`MailEditor` → `EditorPanel` → 各Input の2階層**で収まる → Context導入は過剰
- Server Component（`page.tsx`）は静的シェル、client境界を `MailEditor` に閉じ込める
- **デバウンスはプレビュー側のみ**。入力欄自体は controlled のまま即時反映（打鍵の遅延ゼロ）
- 将来ブロック数が可変になったら `useReducer` へ移行。Context/Zustandは「複数の離れたコンポーネントが同じ状態を読む」状況が来てから

---

## Step 7. 実装計画（順序どおり）

0. **`docs/plan.md` 作成**
   - 本計画書をリポジトリ内 `docs/plan.md` として配置（設計意図をリポジトリに残す）
1. **プロジェクト初期化**
   - `.nvmrc`（`22`）追加 → `nvm use`
   - `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir=false --import-alias "@/*"`
   - Prettier + `prettier-plugin-tailwindcss` 設定、`npm run format` / `lint` スクリプト
   - 不要なボイラープレート（デフォルトのpage内容・SVG類）削除、`metadata` 設定
2. **型とドメインロジック**
   - `types/mail.ts`
   - `lib/escapeHtml.ts` / `lib/validation.ts`（`isSafeHttpUrl`, `validateMailData`）
   - `lib/buildMailHtml.ts`（table構造 + インラインCSS、空フィールドは行ごと省略）
3. **レイアウト骨組み**
   - `app/layout.tsx` / `app/page.tsx` / `components/MailEditor.tsx`（ダミー2カラム、ヘッダー）
4. **入力フォーム**
   - `FormField` → `UrlInput` / `ImageInput` / `TextInput`、`EditorPanel` で組み立て
   - label と id の紐付け、`aria-describedby` でエラー結線
5. **プレビュー**
   - `MailFrame`（iframe + srcDoc + sandbox + 高さ調整）
   - `PreviewPanel`（見出し + 枠 + 背景グレーで「メール枠」を演出）
6. **リアルタイム連携**
   - `updateField` 配線、`useDebouncedValue` 実装、`useMemo` で `html` 生成
7. **プレビュー開閉**
   - ヘッダーのトグル（`aria-expanded` / `aria-controls`）
   - 閉じたらグリッドを1カラム化、`prefers-reduced-motion` を尊重したトランジション
8. **バリデーション表示**
   - URL不正 → 入力欄下に赤字メッセージ。プレビュー側はその値を出さない
   - 画像読込失敗 → iframe内でプレースホルダ（`onerror` は使えないので、CSSの alt 表示 + 枠線で対応）
9. **レスポンシブ調整**
   - lg未満は縦積み、プレビューはデフォルト開いたまま、iframe横スクロール封じ
10. **仕上げ・デプロイ**
    - README（スクリーンショット、設計意図、今後の拡張）
    - `npm run build` 確認 → Vercel 接続 → 公開URLをREADMEに記載

---

## Verification

```bash
nvm use            # Node 22（v18.16 では Next 15 が起動しない）
npm run lint
npm run build
npm run dev        # http://localhost:3000
```

ブラウザで確認:

1. テキスト入力 → 打鍵から約200ms でプレビュー反映、リロード無し
2. 画像URL入力（例: 任意の公開画像URL）→ プレビューに画像表示。不正URLでプレースホルダ
3. URL入力 → プレビュー内リンクが `http(s)` のときのみ生成される
4. テキスト欄に `<script>alert(1)</script>` を入力 → **文字列としてそのまま表示され、実行されない**
5. プレビュートグル → 開閉、閉時に入力エリアが全幅化
6. DevTools でウィンドウ幅 375px → 縦積み、横スクロール無し
7. `npm run build` 成功 → Vercel デプロイ、公開URLで1〜6を再確認
