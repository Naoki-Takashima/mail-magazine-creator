# メルマガ作成ツール: 3カラム / 2カラムボックス追加（Phase 2）

## Context

Phase 1 で 配信日 / 件名 / 帯バナー / 大バナー の4ブロックを実装済み。
ここに **05: 3カラムボックス** と **06: 2カラムボックス** を追加する。

この2ブロックは「タイトル + カラムアイテム + 末尾ボタン」を1セットとし、**セット自体を最大3つまで追加**できる。
構造が同型（列数・文字数上限・ノーマルテキストの有無だけが違う）なので、**型・リデューサ・UI・HTML生成を1系統で共通化**し、差分は設定オブジェクトで表現する。

### ヒアリング済みの確定仕様

| 項目             | 3カラム    | 2カラム                                   |
| ---------------- | ---------- | ----------------------------------------- |
| セット上限       | 3          | 3                                         |
| アイテム上限     | 18         | 18                                        |
| ボタン上限       | 3          | 3                                         |
| 太字テキスト     | 最大10文字 | 最大15文字                                |
| ノーマルテキスト | なし       | 最大26文字                                |
| テキストカラー   | あり       | あり（要件表に無かったが3カラムと揃える） |

共通:

- **URLと画像パスがセット**（当初「URLとロゴ」と書かれていたが訂正済み）。ただし**画像だけでも表示する**（URL未入力ならリンクなし）
- ロゴは任意。**メイン画像の直下に隙間なく、カラム幅いっぱい**で繋げる
- カラムは**左寄せ**。端数行（3カラムに2件など）は左詰めで、空セルが幅を保持する
- タイトルは任意。空ならタイトル行を出さない。タイトル文字色の既定は `#000000`
- アイテムの入力UIは**折りたたみカード**（`<details>`）。18件でも一覧しやすくする
- 末尾ボタンは**全幅（552px）で縦積み**。文字色・背景色ともに入力可（既定 `#ffffff` / `#000000`）
- メール本文のブロック順 = 帯バナー → 大バナー → 3カラム全セット → 2カラム全セット

---

## データ設計（`types/mail.ts`）

3カラムと2カラムで**同じ型を共有**し、`ColumnVariant` で振る舞いを切り替える。
`normalText` は3カラムでは使わない（UIに出さず、HTML生成でも参照しない）。

```ts
export type ColumnVariant = 'three' | 'two';

export type ColumnItem = {
  id: string;
  url: string;
  imageUrl: string;
  /** 任意。メイン画像の直下に隙間なく繋げる */
  logoUrl: string;
  boldText: string;
  /** 2カラムのみ使用 */
  normalText: string;
  /** 太字・ノーマル両方に適用する文字色。既定 '#000000' */
  textColor: string;
};

export type ColumnButton = {
  id: string;
  url: string;
  text: string;
  textColor: string; // 既定 '#ffffff'
  bgColor: string; // 既定 '#000000'
};

export type ColumnSet = {
  id: string;
  title: string;
  titleColor: string; // 既定 '#000000'
  items: ColumnItem[];
  buttons: ColumnButton[];
};

export type MailData = {
  // …Phase 1 の項目
  threeColumnSets: ColumnSet[];
  twoColumnSets: ColumnSet[];
};

export const MAX_COLUMN_SETS = 3;
export const MAX_COLUMN_ITEMS = 18;
export const MAX_COLUMN_BUTTONS = 3;
export const DEFAULT_TEXT_COLOR = '#000000';
```

**バリアント設定を1か所に集約**し、UI・バリデーション・HTML生成がすべてここを参照する。
列数や文字数上限を変えるときに触る場所を1つに保つのが狙い。

```ts
export const COLUMN_VARIANT_CONFIG = {
  three: {
    stateKey: 'threeColumnSets',
    sectionIndex: '05',
    title: '3カラムボックス',
    columns: 3,
    boldMaxLength: 10,
    normalMaxLength: null, // ノーマルテキストを持たない
    cellWidth: 176,
    gapWidth: 12,
  },
  two: {
    stateKey: 'twoColumnSets',
    sectionIndex: '06',
    title: '2カラムボックス',
    columns: 2,
    boldMaxLength: 15,
    normalMaxLength: 26,
    cellWidth: 268,
    gapWidth: 16,
  },
} as const satisfies Record<ColumnVariant, ColumnVariantConfig>;
```

（幅はコンテンツ幅552px基準: `176*3 + 12*2 = 552`、`268*2 + 16 = 552`）

エラー型も同じ形でネストさせる:

```ts
export type ColumnItemErrors = { url?: string; imageUrl?: string; logoUrl?: string };
export type ColumnButtonErrors = { url?: string };
export type ColumnSetErrors = {
  items?: Record<string, ColumnItemErrors>;
  buttons?: Record<string, ColumnButtonErrors>;
};

export type ValidationErrors = {
  // …Phase 1 の項目
  threeColumnSets?: Record<string, ColumnSetErrors>;
  twoColumnSets?: Record<string, ColumnSetErrors>;
};
```

---

## 状態管理（`lib/mailReducer.ts` を拡張）

すべてのアクションが `variant` を持ち、`COLUMN_VARIANT_CONFIG[variant].stateKey` で対象配列を決める。
これにより3カラム用・2カラム用にアクションを二重定義しない。

```ts
| { type: 'addColumnSet'; variant: ColumnVariant; id: string }
| { type: 'removeColumnSet'; variant: ColumnVariant; setId: string }
| { type: 'setColumnSetField'; variant; setId; field: 'title' | 'titleColor'; value: string }
| { type: 'addColumnItem'; variant; setId; id: string }
| { type: 'removeColumnItem'; variant; setId; itemId: string }
| { type: 'setColumnItemField'; variant; setId; itemId; field: EditableColumnItemField; value }
| { type: 'addColumnButton'; variant; setId; id: string }
| { type: 'removeColumnButton'; variant; setId; buttonId: string }
| { type: 'setColumnButtonField'; variant; setId; buttonId; field: EditableColumnButtonField; value }
```

- 内部ヘルパ `updateSet(state, variant, setId, updater)` を用意し、9アクションの入れ子更新をここに集約する
- 上限（セット3 / アイテム18 / ボタン3）は既存の `addLargeBanner` と同じく **reducer 側でも守る**（UIでは同時にボタンを disabled にする）
- `id` の採番は既存どおり `MailEditor` 側の `crypto.randomUUID()`

---

## HTML生成（`lib/buildMailHtml.ts` を拡張）

`buildColumnSetBlock(set, variant)` を追加。既存の `renderLinked` / `escapeHtml` / `toSafeHttpUrl` / `toSafeHexColor` をそのまま再利用する。

1. **タイトル行** — `title` が非空のときだけ出力。`titleColor` は `toSafeHexColor` を通す
2. **アイテム行** — アイテムを `columns` 件ずつに分割し、1行 = 1つの `<tr>`。
   行の中は `<table align="left">` + 固定幅セル + gap セル。**端数は空セルで埋め**、左寄せと列幅を保つ
3. **セル内** — 画像とロゴを `font-size:0; line-height:0` のセルに `display:block` で積み、**隙間なく縦に連結**。URLがあれば画像+ロゴをまとめて1つの `<a>` で包む。その下に太字テキスト（`font-weight:bold`）、2カラムのみノーマルテキスト。どちらも `textColor` を適用
4. **ボタン** — セットの最後に全幅（552px）で縦積み。`url` と `text` の両方が有効なときだけ出力。既存の大バナーと同じ bulletproof button 形式
5. アイテムもボタンもタイトルも空のセットは**丸ごと出力しない**

`buildMailHtml` 本体のブロック配列:

```ts
const blocks = [
  buildStripBannerBlock(data.stripBanner),
  ...data.largeBanners.map(buildLargeBannerBlock),
  ...data.threeColumnSets.map((set) => buildColumnSetBlock(set, 'three')),
  ...data.twoColumnSets.map((set) => buildColumnSetBlock(set, 'two')),
].filter((block) => block !== '');
```

---

## バリデーション（`lib/validation.ts` を拡張）

既存の `urlErrorOf` を再利用し、`validateColumnSets(sets)` を追加して両バリアントで共用する。

- アイテムの `url` / `imageUrl` / `logoUrl`: 入力があり `http(s)` でなければエラー
- ボタンの `url`: 同上
- 文字数はフォーム側の `maxLength` でハード制限するため、バリデーションエラーにはしない
- タイトル・テキスト類は任意入力なのでエラーなし

---

## 画面設計

**1系統のコンポーネントを両ブロックで使い回す。** `variant` を渡すだけで 05 / 06 の両方になる。

```
components/editor/
├── ColumnSetSection.tsx   [新] ブロック本体。EditorSection + セット一覧 + セット追加ボタン
├── ColumnSetCard.tsx      [新] 1セット（タイトル / タイトル色 / アイテム一覧 / ボタン一覧 / 削除）
├── ColumnItemCard.tsx     [新] アイテム1件。<details> の折りたたみカード
├── ColumnButtonCard.tsx   [新] ボタン1件（URL / テキスト / 文字色 / 背景色 / 削除）
└── AddItemButton.tsx      [新] 「+ 追加」「上限 N 件」の破線ボタン（大バナーの既存実装を切り出して共用）
```

- `EditorPanel.tsx` に 05 / 06 を追加。ハンドラは `variant` 付きの1系統に集約し、`ColumnSetSection` へそのまま渡す
- `ColumnItemCard` のヘッダには `01` と太字テキストの先頭を出し、閉じた状態でも中身が分かるようにする
- 入れ子が3段（セット > アイテム > フィールド）になるため、階層は**背景の沈み具合**で表現する:
  セット = `bg-paper-sunk` + 実線、アイテム/ボタン = `bg-paper` + 細罫
- 既存の `EditorSection` / `FormField` / `fields/*`（`TextField` / `UrlField` / `ColorField`）はそのまま再利用。`TextField` は `maxLength` を既にサポート済み
- 大バナーの追加ボタンは `AddItemButton` に置き換えてスタイルを一本化する

---

## 実装タスク

0. 本計画書を `docs/plan-input-phase2.md` としてリポジトリに配置
1. `types/mail.ts`: `ColumnVariant` / `ColumnItem` / `ColumnButton` / `ColumnSet` / 上限定数 / `COLUMN_VARIANT_CONFIG` / エラー型 / ファクトリ関数（`createColumnSet` など）を追加
2. `lib/mailReducer.ts`: `updateSet` ヘルパ + 9アクションを追加
3. `lib/validation.ts`: `validateColumnSets` を追加し `validateMailData` に組み込む
4. `lib/buildMailHtml.ts`: `buildColumnSetBlock` とセル/行の組み立てヘルパを追加、ブロック配列に接続
5. `components/editor/AddItemButton.tsx` を切り出し、`LargeBannerSection` を置き換え
6. `ColumnButtonCard` → `ColumnItemCard` → `ColumnSetCard` → `ColumnSetSection` の順に作成
7. `EditorPanel.tsx` に 05 / 06 を追加、`MailEditor.tsx` に `variant` 付きハンドラを追加
8. `README.md` の入力ブロック表とディレクトリ構成を更新
9. `npm run format` → `lint` → `tsc --noEmit` → `build`

---

## Verification

```bash
nvm use && npm run lint && npx tsc --noEmit && npm run build && npm run dev
```

ロジック確認（Chrome拡張が未接続のため、Phase 1 と同様に `node --experimental-strip-types` で `lib/` を直接実行）:

- 3カラムに5件 → 行が `[3, 2]` に分割され、2行目に空セルが1つ入る（左寄せが保たれる）
- 2カラムに3件 → `[2, 1]` に分割
- 画像のみ（URL空）→ `<a>` なしで `<img>` が出る
- 画像 + ロゴ + URL → 画像とロゴが**1つの `<a>` にまとまり**、間に余白が入らない（`font-size:0`）
- ロゴのみ（画像なし）→ ロゴだけが出る
- 3カラムでは `normalText` に値があってもHTMLに出ない
- `textColor` / `titleColor` / ボタン色に `red;background:url(x)` → 既定色に倒れる
- ボタンは `url` と `text` が揃ったときだけ出力、全幅552px
- 空セット（タイトル・アイテム・ボタンすべて空）→ 何も出力しない
- reducer: セット3件でそれ以上追加不可、アイテム18件で追加不可、ボタン3件で追加不可
- reducer: セットAのアイテムを消してもセットBの値がずれない

ブラウザ確認:

1. 05 でセットを追加 → タイトル・タイトル色の入力欄が出る
2. アイテムを追加 → 折りたたみカードが増え、開くと 5入力欄（3カラム）/ 6入力欄（2カラム）
3. 太字テキストが 10文字（3カラム）/ 15文字（2カラム）、ノーマルが 26文字で打ち止まる
4. 画像URLとロゴURLを入れる → プレビューで縦に隙間なく繋がる
5. アイテム2件だけ入れる → 3カラムのうち左2列に寄る
6. ボタンを3件追加 → セット末尾に全幅で縦積み、4件目は追加不可
7. セットを3つ追加 → セット追加ボタンが disabled
8. 05 と 06 を両方入れる → プレビューで 3カラム群 → 2カラム群 の順に並ぶ
