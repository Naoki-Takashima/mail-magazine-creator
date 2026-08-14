# テスト基盤の導入（Jest + React Testing Library + Storybook）

## Context

これまで検証は `npm run build`（型）+ `npm run lint` + ブラウザでの目視だけで、
自動テストは1つも無い（README「今後の拡張」に「`lib/` 配下の純関数の単体テスト」が未着手で残っている）。

`lib/` は React 非依存の純関数が中心で、`buildMailHtml`（505行）と `mailReducer`（335行）に
仕様の大半が集まっている。ここが自動テストの費用対効果が最も高い。
`components/editor/` は `FormField` / `EditorSection` / `fields/*` などの共通部品の上に
9ブロックのセクションが乗る構造で、共通部品の見た目と a11y 結線をカタログ化する価値が大きい。

README の「今後の拡張」は Vitest と書いてあるが、今回は **Jest** を採用する（下記ヒアリング参照）。
導入後、README のその行を Jest に書き換える。

## 確定した仕様（ヒアリング）

| 論点                   | 決定                                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| テストランナー         | **Jest のみ**。Storybook はカタログ + a11y 確認用途に限定し `addon-vitest` は入れない                       |
| Storybook のビルダー   | **`@storybook/nextjs-vite`**（Vite ベース）                                                                 |
| 初回のテスト範囲       | **`lib/` の純関数 + `components/editor/` の共通部品**（RTL）                                                |
| テストファイルの配置   | **コロケーション**（`lib/validation.test.ts` のように対象の隣）                                             |
| `buildMailHtml` の検証 | **部分アサーション中心**（スナップショットは使わない）                                                      |
| カバレッジ / CI        | `test:coverage` は用意するが**閾値は設定しない**。GitHub Actions は今回入れない（→ のちに追加。末尾の追補） |
| 初回のストーリー範囲   | **共通部品 + 代表セクション**（`ColumnSetCard` / `TopicItemCard`）                                          |

### なぜ Jest のみにしたか

Storybook 10 の公式テスト統合（`@storybook/addon-vitest`）は Vitest 専用で、Jest とは併存しない。
両方入れると設定・依存・実行コマンドが2系統になる。
今回は「Storybook = 見た目のカタログと a11y パネル」「Jest + RTL = 振る舞いの検証」と役割を分け、
ランナーは1つに保つ。Storybook の `play` 関数によるインタラクションテストは今回のスコープ外。

---

## 追加する依存（すべて devDependencies）

バージョンは調査時点の最新。既存 devDependencies に倣い `^` を付ける。

### Jest + React Testing Library

| パッケージ                    | バージョン | 用途                                                                                           |
| ----------------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| `jest`                        | ^30.4.2    | ランナー                                                                                       |
| `jest-environment-jsdom`      | ^30.4.1    | DOM 環境（Jest 28 以降は別パッケージ）                                                         |
| `@types/jest`                 | ^30.0.0    | `describe` / `it` / `expect` の型。**`next build` の型チェックがテストファイルも通るため必須** |
| `@testing-library/react`      | ^16.3.2    | React 19 対応版                                                                                |
| `@testing-library/dom`        | ^10.4.1    | RTL 16 の peerDependency。**明示的に入れる必要がある**                                         |
| `@testing-library/jest-dom`   | ^7.0.1     | `toBeInTheDocument` などのマッチャ（v7 も `./jest-globals` を持ち Jest 対応）                  |
| `@testing-library/user-event` | ^14.6.4    | 入力・クリックの操作                                                                           |

`next/jest`（`next` 本体に同梱、追加インストール不要）を使う。中身を確認済みで、以下を自動でやってくれる:

- SWC によるトランスパイル（Babel 設定は不要）
- CSS / 画像 / `next/font` / `server-only` のモック
- `tsconfig.json` の `paths`（`@/*`）を SWC に渡す

### Storybook

| パッケージ                | バージョン | 用途                                                           |
| ------------------------- | ---------- | -------------------------------------------------------------- |
| `storybook`               | ^10.5.8    | CLI 本体                                                       |
| `@storybook/nextjs-vite`  | ^10.5.8    | フレームワーク。`next` は `^16.0.0` を peer に含む（確認済み） |
| `@storybook/addon-docs`   | ^10.5.8    | 自動ドキュメント                                               |
| `@storybook/addon-a11y`   | ^10.5.8    | a11y パネル（`FormField` のラベル結線を目で確認する用途）      |
| `vite`                    | ^8.2.1     | `@storybook/nextjs-vite` の peer                               |
| `eslint-plugin-storybook` | ^10.5.8    | ストーリーの lint（`npm run lint` が引数なしで全体を見るため） |

補足: `storybook` パッケージは内部依存として `@testing-library/jest-dom@6.9.1` を持つが、
トップレベルに入れる v7 とは別の階層に解決されるので競合しない。

---

## 設定ファイル

### `jest.config.mjs`（新規）

`.ts` ではなく `.mjs` にする。Jest の TypeScript 設定ファイル対応は環境依存の要素があり、
`.mjs` なら Node 22 でそのまま読める（`package.json` に `"type"` は無いので `.mjs` = ESM）。

```js
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // next/jest は SWC 側で paths を解決するが、moduleNameMapper でも明示しておく
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/**/*.ts',
    'hooks/**/*.ts',
    'components/**/*.tsx',
    '!**/*.stories.tsx',
    '!**/*.test.{ts,tsx}',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/storybook-static/'],
};

export default createJestConfig(config);
```

### `jest.setup.ts`（新規）

```ts
import '@testing-library/jest-dom';

// useElementSize が使う ResizeObserver は jsdom に無い。
// PhoneMock 系のテストを書いたときに落ちないよう、最小のスタブを置いておく。
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
```

### `.storybook/main.ts`（新規）

```ts
import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/nextjs-vite', options: {} },
  // AppHeader が next/image で /mmc_icon.png を読むため
  staticDirs: ['../public'],
};

export default config;
```

### `.storybook/preview.ts`（新規）

```ts
import type { Preview } from '@storybook/nextjs-vite';

// Tailwind v4 のテーマトークン（--color-canvas 等）はここで読み込む。
// Vite が postcss.config.mjs を自動で拾うので、追加の Tailwind 設定は不要。
import '../app/globals.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { matchers: { color: /(Color|background)$/i } },
  },
};

export default preview;
```

### `package.json` の scripts に追加

```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage",
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build"
```

### `eslint.config.mjs`

```js
import storybook from 'eslint-plugin-storybook';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...storybook.configs['flat/recommended'],
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'coverage/**',
    'storybook-static/**',
  ]),
]);
```

### `.prettierignore` / `.gitignore`

- `.prettierignore` に `coverage` と `storybook-static` を追加
- `.gitignore` に `/storybook-static` を追加（`/coverage` は既に入っている）

### `tsconfig.json`

**変更しない**。`include` が `**/*.ts` / `**/*.tsx` なので、テストもストーリーも自動的に対象になる。
結果として `npm run build` がテスト・ストーリーの型も見る（意図的にそのままにする）。

---

## 初回に書くテスト

### `lib/escapeHtml.test.ts`

- `escapeHtml`: `& < > " '` の5文字を実体参照へ。`&` を二重変換しないこと（`&amp;` → `&amp;amp;` になる仕様の確認）
- `nl2br`: `\r\n` / `\r` / `\n` の3種すべてを `<br />` に

### `lib/color.test.ts`

- `isHexColor`: `#fff` / `#FFFFFF` / 前後空白ありは true、`red` / `#ffff` / `''` は false
- `toSafeHexColor`: 不正値は fallback。**`red;background:url(x)` が fallback に倒れること**（style 属性への注入を塞ぐ要）
- `toColorPickerValue`: `#fff` → `#ffffff`、不正値 → fallback（6桁化も含む）

### `lib/deliveryDate.test.ts`

- `isValidCompactDateTime`: `202608031000` は true、`20260231xxxx` のような存在しない日付は false（Date の繰り上げを弾けているか）
- `toCompactDateTime` / `toDatetimeLocalValue`: 往復変換。不正入力は `''`
- `toFileNameDateTime`: `202608031000` → `20260803_1000`、不正は `null`
- `formatDeliveryDate`: `2026年8月3日(月) 10:00`（曜日と 0 埋めまで）

### `lib/validation.test.ts`

- `isSafeHttpUrl` / `toSafeHttpUrl`: `http` / `https` は通し、`javascript:` / `data:` / 相対パス / 空文字は弾く
- `validateMailData`:
  - 未入力の必須（`deliveryDate` / `subject`）がエラーになる
  - 任意項目は**空欄ならエラーにしない**（`urlErrorOf` の仕様）
  - エラーが無いキーは**オブジェクトに現れない**（`hasValidationErrors` がキー数だけ見る前提の根拠）
  - ネスト（`threeColumnSets[setId].items[itemId].url`）まで id で辿れる
- `hasValidationErrors`: 空オブジェクトで false
- `omitRequiredErrors`: `deliveryDate` / `subject` だけ消え、URL エラーは残る

### `lib/mailReducer.test.ts`

- 全 action で**元の state を破壊しない**（`Object.is` で別参照、元オブジェクトが不変）
- `addToList` の上限: `MAX_LARGE_BANNERS`(3) / `MAX_COLUMN_ITEMS`(18) / `MAX_COLUMN_BUTTONS`(3) / `MAX_BOTTOM_BANNERS`(5) / `MAX_TOPIC_ITEMS`(8) / `MAX_INFO_LINKS`(3) で**それ以上増えず、配列の参照も変わらない**
- `setStripBannerField` は `stripBanner === null` のとき何もしない
- `addStripBanner` → `removeStripBanner` で `null` に戻る
- 未知の id を指す `remove*` / `set*Field` が state を壊さない
- カラム系は `describe.each(['three', 'two'] as const)` で**両 variant を同じテストで回す**（3カラム/2カラムは同一実装なので、片方だけ通るテストは書かない）

### `lib/buildMailHtml.test.ts`

部分アサーション中心。デザインの微調整で落ちない粒度にする。

- **エスケープ**: 件名・本文テキストに `<script>` を入れると `&lt;script&gt;` になり、生の `<script` が出力に含まれない
- **URL**: `javascript:alert(1)` を入れたリンクは `href` ごと出ない / 画像は `<img` ごと出ない
- **色**: `titleColor` に `red;background:url(x)` を入れると既定色に倒れ、出力に `background:url` が含まれない
- **空ブロックの省略**: 下部大バナー（07）・トピックス（08）は中身0件ならタイトルごと出力に現れない
- **帯バナー**: `stripBanner === null` なら何も出ない / 画像URLだけならリンク無しの `<img>`
- **大バナー**: ボタンURL空ならバナーURLを流用
- **`forPreview`**: 既定は `padding:24px 12px` を含み、`forPreview: true` では含まない。かつ**本文部分は両者で同一**（body スタイル以外に差が無いことを確認）
- **件名**: `<title>` に入り、本文には出ない
- 幅の定数（`MAIL_WIDTH` = 600、`MAIL_CONTENT_WIDTH` = 552）が出力に現れる

### `components/editor/FormField.test.tsx`

- `label` の `htmlFor` と children の input の `id` が結線される（`getByLabelText` で引ける）
- `error` があるとき `role="alert"` の要素が出て、`describedBy` が `${fieldId}-error` を返す
- `error` が無いときは `aria-describedby` が付かない

### `components/editor/fields/TextField.test.tsx`（`BaseInputField` 経由）

- 入力すると `onChange` が**値だけ**で呼ばれる（イベントではない）
- `error` を渡すと `aria-invalid="true"` と `aria-describedby` が付く

### `components/editor/fields/ColorField.test.tsx`

- テキスト欄とカラーピッカーの**どちらから編集しても** `onChange` が呼ばれる
- 値が `#fff` のときピッカーの value が `#ffffff` に展開される
- 不正な色コードでもピッカーは `fallbackColor` を表示し、テキスト欄は入力値のまま

### `components/editor/AddItemButton.test.tsx`

- `disabled: true` のとき `fullLabel` を表示し、クリックしても `onClick` が呼ばれない
- `disabled: false` のとき `label` を表示

### `components/editor/EditorSection.test.tsx`

- `required` のとき `aria-label="必須"` の印が出る
- `meta` を渡すと表示される / 渡さなければ出ない

### `components/editor/TitleFields.test.tsx` / `ButtonFields.test.tsx`

- `idPrefix` が各入力の `id` に反映され、同じ画面に2つ置いてもラベルが衝突しない
- 各フィールドの変更が `onChange(field, value)` の形で正しいキー（`title` / `titleColor` / `text` / `url` / …）で飛ぶ

---

## 初回に書くストーリー

配置はテストと同じくコロケーション（`components/editor/FormField.stories.tsx`）。
ハンドラは `import { fn } from 'storybook/test'` を使う（Storybook 10 では `@storybook/test` ではなくこちら）。

| ストーリー          | 用意する variant                                                |
| ------------------- | --------------------------------------------------------------- |
| `FormField`         | 通常 / エラーあり                                               |
| `EditorSection`     | 通常 / 必須マークあり / meta あり                               |
| `AddItemButton`     | 通常 / 上限到達（disabled）                                     |
| `fields/TextField`  | 空 / 入力済み / エラー                                          |
| `fields/UrlField`   | 正しいURL / 不正なURL（エラー表示）                             |
| `fields/ColorField` | 正しい色 / 3桁指定 / 不正な色                                   |
| `TitleFields`       | 既定                                                            |
| `ButtonFields`      | 既定 / URLエラーあり                                            |
| `ColumnSetCard`     | `variant: 'three'` / `variant: 'two'`（設定差を並べて見るため） |
| `TopicItemCard`     | 空 / 全項目入力済み                                             |

`ColumnSetCard` / `TopicItemCard` は props が多いので、`types/mail.ts` の `create*` ファクトリで
ダミーデータを組み立てる（テスト側と同じ作り方に揃える）。

---

## 踏みやすい落とし穴

- **`next build` がテストとストーリーも型チェックする**。`tsconfig.json` の `include` が `**/*.ts(x)` のため。
  `@types/jest` を入れ忘れると、テストを1つ書いた時点でビルドが落ちる
- **`@testing-library/dom` は明示インストールが必要**。RTL 16 では peerDependency に外出しされている
- **jsdom に `ResizeObserver` は無い**（`useElementSize` が使う）。`jest.setup.ts` でスタブを置く
- **`crypto.randomUUID` は `MailEditor` 側にある**。リデューサのテストでは id を自分で渡すだけでよく、モック不要
- **`<input type="color">` は jsdom ではただのテキスト入力**。`fireEvent.change` で値を入れる分には動くが、
  ネイティブのピッカー挙動は検証できない（`toColorPickerValue` 側の単体テストで担保する）
- **カラム系のテストは必ず両 variant を回す**。3カラム / 2カラムは同一実装で、差は `COLUMN_VARIANT_CONFIG` だけ。
  片方だけのテストは設計上の意味を持たない
- **`buildMailHtml` のテストにスナップショットを使わない**（今回の決定）。
  デザイン調整のたびに `-u` が必要になり、レビューで差分を読めなくなるため
- **Storybook の Tailwind は postcss 経由**。`postcss.config.mjs` を Vite が自動で拾うので追加設定は不要だが、
  `preview.ts` で `../app/globals.css` を import し忘れるとトークンが効かず全部素の見た目になる
- **`.storybook/` はドット始まりなので ESLint の既定で無視される**。
  設定ファイル自体を lint したい場合は `globalIgnores` に `'!.storybook'` を足す（必須ではない）
- **`npm run lint` は引数なしでリポジトリ全体**を見る。ストーリー追加前に `eslint-plugin-storybook` を入れておく

---

## 作業順序

1. `nvm use`（Node 22）
2. Jest 系の依存を追加 → `jest.config.mjs` / `jest.setup.ts` を作成 → `package.json` に scripts 追加
3. `lib/escapeHtml.test.ts` を1本だけ書いて `npm test` が通ることを確認（配線の確認）
4. `lib/` の残り5ファイルのテストを追加 → `npm test`
5. RTL のテスト（`FormField` → `fields/*` → `AddItemButton` / `EditorSection` / `TitleFields` / `ButtonFields`）
6. `npm run build` と `npm run lint` が通ることを確認（型チェックが増えたファイルに及ぶため）
7. Storybook の依存を追加 → `.storybook/main.ts` / `preview.ts` を作成
8. `FormField.stories.tsx` を1本書いて `npm run storybook` で表示・a11y パネルを確認
9. 残りのストーリーを追加 → `npm run build-storybook` が通ることを確認
10. `.prettierignore` / `.gitignore` / `eslint.config.mjs` を更新 → `npm run format` → `npm run lint`
11. README の「今後の拡張」から単体テストの行を削り、コマンド一覧に `npm test` / `npm run storybook` を追記。
    CLAUDE.md の「テストフレームワークは未導入」の記述も差し替える

## やらないこと

- **Storybook の `play` 関数によるインタラクションテスト**と `@storybook/addon-vitest`（ランナーを2つにしないため）
- **`MailEditor` の統合テスト**（iframe `srcDoc`・デバウンス・`crypto.randomUUID` のモックが要り、初期導入の範囲を超える）
- **`PhoneMock` / `MailFrame` のテストとストーリー**（実寸計測と縮小率が絡み、jsdom では意味のある検証にならない）
- **ビジュアルリグレッションテスト**（Chromatic 等）
- **カバレッジ閾値の設定**（テストが揃う前に入れると常に赤になる）
- ~~**GitHub Actions の CI**（別件）~~ → 導入済み。下の「追補」を参照
- **E2E（Playwright）**

---

## 実装結果（2026-08-15）

計画どおりに導入完了。**テスト 13ファイル 220件、ストーリー 10ファイル 25件**。
`npm test` / `npm run build` / `npm run lint` / `npm run build-storybook` はすべて通っている。

計画から変えた点・作業中に分かった点:

- **`structuredClone` は jsdom 環境に無い**。リデューサの不変性テストは `JSON.parse(JSON.stringify())` で深いコピーを取っている（`MailData` は文字列と配列・オブジェクトだけなので JSON で往復できる）
- **`eslint.config.mjs` の `globalIgnores` に `storybook-static/**` を足すのが必須**。
  `npm run lint` は引数なしでリポジトリ全体を見るため、ビルド済みの minified JS を検査して1万件以上の警告が出る
- ストーリーのうち入力系（`TextField` / `UrlField` / `ColorField` / `TitleFields` / `ButtonFields` / `TopicItemCard`）は
  `meta.render` で `useState` を持たせ、Storybook 上でも実際に打てるようにした。
  制御コンポーネントなので、args をそのまま渡すだけでは入力できないため
- `ColumnSetCard` は追加・削除のハンドラをすべて `fn()` のスパイにし、**状態の変化ではなく見た目のバリエーション**
  （3カラム / 2カラム / 空 / エラー / 上限）を並べる形にした
- `npm audit` に high が数件出るが、いずれも devDependencies の推移的依存
  （`image-size` ← `vite-plugin-storybook-nextjs`、`postcss` / `sharp` ← `next`）。
  修正には `next` 本体の更新が要るため、今回は手を付けていない

未検証:

- **Storybook のブラウザ目視**（`npm run storybook` での表示確認と a11y パネル）。
  静的ビルドの成功・全10ファイル 35エントリのインデックス・
  ビルド成果物への Tailwind トークン（`--color-canvas-sunk` 等）の出力までは確認済み

---

## 追補：GitHub Actions の CI（2026-08-15）

当初は「別件」として外していたが、続けて導入した。`.github/workflows/ci.yml` の1ジョブだけ。

| 論点              | 決定                                                                              |
| ----------------- | --------------------------------------------------------------------------------- |
| 実行タイミング    | **main への push と、すべてのプルリクエスト**                                     |
| ジョブ構成        | **1ジョブ**（依存のインストールを使い回すため、分割しない）                       |
| 実行内容          | `lint` → `format:check` → `typecheck` → `test` → `build` → `build-storybook` の順 |
| Node のバージョン | **`.nvmrc` を参照**（`node-version-file`）。ローカルとずれないようにする          |
| インストール      | `npm ci`（`package-lock.json` どおりに固定する）                                  |
| カバレッジ閾値    | **設定しない**（本編の決定のまま）                                                |

- 並び順は**速く落ちるものから**。lint と整形の差分は数秒で分かるので先に置く
- **`typecheck` は `next typegen && tsc --noEmit`**。`next-env.d.ts` と `.next/types` は生成物で
  リポジトリに入っていない（`.gitignore`）ため、素の `tsc --noEmit` だけだと
  `@/public/mmc_icon.png` の import が `TS2307` になる。クリーンなチェックアウトを再現して確認済み。
  `next build` も型チェックを兼ねるが、**ビルドを待たずに型エラーだけ先に出したい**ので別ステップにしている
  （`tsconfig.json` の `include` がテストとストーリーまで見るので、両方まとめて検査される）
- `build-storybook` を回しているのは、**ストーリーの破損を自動で見つける唯一の手段**だから。
  `addon-vitest` を入れない方針なので、これが無いとストーリーは誰も検証しない
- `concurrency` で同じブランチの古い実行を打ち切る
- `NEXT_TELEMETRY_DISABLED` / `STORYBOOK_DISABLE_TELEMETRY` を立てて、CI からの外部送信を止めている
- キャッシュは `actions/setup-node` の `cache: npm` のみ。Next / Storybook のビルドキャッシュは、
  この規模（ビルド数秒）では復元のほうが高くつくので置いていない
