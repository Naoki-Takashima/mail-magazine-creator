# メルマガ作成ツール: 下部大バナー / トピックス / フッター追加（Phase 3）

## Context

Phase 1 で 01〜04（配信日 / 件名 / 帯バナー / 大バナー）、Phase 2 で 05〜06（3カラム / 2カラムボックス）を実装済み。
ここに残りの3ブロックを追加してメルマガ1通ぶんの構造を完成させる。

- **07 下部大バナー** — タイトル + バナー最大5件（1カラム縦積み）
- **08 トピックスエリア** — タイトル + アイテム最大8件（画像とテキストの横並び、区切り罫線）+ ボタン1件
- **09 インフォメーション（フッター）** — リンク最大3件（縦積み・中央寄せ）

このPhaseでは新規追加と同時に、**既存コードとの重複を共通部品に寄せる**（下記「既存コードの再利用と共通化」）。

### ヒアリング済みの確定仕様

**07 下部大バナー**

- 最大 **5件**（要件欄の記述を採用。見出しの「最大3件」は誤記）
- タイトルは**ブロックに1つ**、タイトル文字色も入力可
- **ボタンテキストも入力可**（文字色・背景色も）。04 大バナーと同じ入力構成
- 画像幅は **552px**（左右余白あり。04 と同じ見た目）
- 必須ではない

**08 トピックスエリア**

- 最大 **8件**。タイトルはブロックに1つ + タイトル文字色
- アイテム = URL / 画像パス / 太字テキスト / ノーマルテキスト / テキストカラー
- **画像160px + gap16px + テキスト376px の横並び**、テキストは左寄せ
- アイテムは1カラムで縦積み、**2件目以降の上に 1px の区切り罫線**
- 文字数上限は**なし**
- ボタンは **1件のみ**（URL / ボタンテキスト / 文字色 / 背景色）

**09 インフォメーション（フッター）**

- 最大3件。URL + リンクテキストのみ
- **縦積み・中央寄せ**、見出しは**出さない**
- リンク文字色は**固定**（リンク青 `#2563eb` + 下線）

**メール本文のブロック順** = 入力ブロック番号順（03 帯 → 04 大バナー → 05 3カラム → 06 2カラム → 07 下部大バナー → 08 トピックス → 09 フッター）

---

## 既存コードの再利用と共通化

新規3ブロックは既存ブロックと構造が重なる。**新しい型やコンポーネントを増やす前に、既存を一般化して共用する。**

| 重複                                            | 対処                                                                                                                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 07 のバナー = 04 `LargeBanner` と**完全に同型** | 型・`createLargeBanner`・`buildLargeBannerBlock`・`LargeBannerCard` をそのまま再利用                                                                                     |
| 05/06 の `ColumnButton` と 08 のボタン          | `ButtonContent`（url / text / textColor / bgColor）を切り出し、`ColumnButton = ButtonContent & { id }` に。HTML生成も `buildBlockButton(button: ButtonContent)` に一般化 |
| タイトル + タイトル文字色（05/06/07/08）        | 入力UIを `TitleFields.tsx` に、HTML生成を `buildBlockTitle(title, titleColor)` に集約                                                                                    |
| ボタンの4入力（05/06/08）                       | `ButtonFields.tsx` に切り出し、`ColumnButtonCard` からも使う                                                                                                             |
| reducer の入れ子リスト操作                      | `addToList` / `removeFromList` / `updateInList` の3ヘルパに集約し、**既存アクションも書き換えて短くする**                                                                |

```ts
function addToList<T>(list: T[], max: number, item: T): T[];
function removeFromList<T extends { id: string }>(list: T[], id: string): T[];
function updateInList<T extends { id: string }>(list: T[], id: string, patch: Partial<T>): T[];
```

---

## データ設計（`types/mail.ts`）

```ts
/** ボタンの中身。id を持つ ColumnButton と、単体で持つ 08 のボタンで共用 */
export type ButtonContent = {
  url: string;
  text: string;
  textColor: string; // 既定 '#ffffff'
  bgColor: string; // 既定 '#000000'
};
export type ColumnButton = ButtonContent & { id: string };

/** 07 下部大バナー。バナー1件の形は 04 の LargeBanner と同一 */
export type BottomBannerBlock = {
  title: string;
  titleColor: string;
  banners: LargeBanner[]; // 最大 MAX_BOTTOM_BANNERS
};

export type TopicItem = {
  id: string;
  url: string;
  imageUrl: string;
  boldText: string;
  normalText: string;
  textColor: string; // 太字・ノーマル両方に適用。既定 '#000000'
};

export type TopicsBlock = {
  title: string;
  titleColor: string;
  items: TopicItem[]; // 最大 MAX_TOPIC_ITEMS
  /** 1件だけなので配列にしない */
  button: ButtonContent;
};

export type InfoLink = {
  id: string;
  url: string;
  text: string;
};

export type MailData = {
  // …Phase 1 / 2 の項目
  bottomBannerBlock: BottomBannerBlock;
  topicsBlock: TopicsBlock;
  infoLinks: InfoLink[]; // 最大 MAX_INFO_LINKS
};

export const MAX_BOTTOM_BANNERS = 5;
export const MAX_TOPIC_ITEMS = 8;
export const MAX_INFO_LINKS = 3;

/** 08 の横並びレイアウト（合計 552px） */
export const TOPIC_IMAGE_WIDTH = 160;
export const TOPIC_GAP_WIDTH = 16;
export const TOPIC_TEXT_WIDTH = 376;

/** フッターリンクの固定色 */
export const INFO_LINK_COLOR = '#2563eb';
```

エラー型:

```ts
export type TopicItemErrors = { url?: string; imageUrl?: string };
export type InfoLinkErrors = { url?: string };

export type ValidationErrors = {
  // …Phase 1 / 2 の項目
  bottomBanners?: Record<string, BannerErrors>;
  topicItems?: Record<string, TopicItemErrors>;
  topicsButton?: ColumnButtonErrors;
  infoLinks?: Record<string, InfoLinkErrors>;
};
```

---

## 状態管理（`lib/mailReducer.ts`）

追加アクション（既存の命名規則に合わせる）:

```ts
| { type: 'setBottomBannerBlockField'; field: 'title' | 'titleColor'; value: string }
| { type: 'addBottomBanner'; id: string }
| { type: 'removeBottomBanner'; id: string }
| { type: 'setBottomBannerField'; id: string; field: EditableLargeBannerField; value: string }
| { type: 'setTopicsBlockField'; field: 'title' | 'titleColor'; value: string }
| { type: 'addTopicItem'; id: string }
| { type: 'removeTopicItem'; id: string }
| { type: 'setTopicItemField'; id: string; field: EditableTopicItemField; value: string }
| { type: 'setTopicsButtonField'; field: keyof ButtonContent; value: string }
| { type: 'addInfoLink'; id: string }
| { type: 'removeInfoLink'; id: string }
| { type: 'setInfoLinkField'; id: string; field: 'url' | 'text'; value: string }
```

上限は既存同様 reducer 側でも守る（UIでは同時にボタンを disabled）。
既存の `addLargeBanner` / `removeLargeBanner` / `setLargeBannerField` / カラム系も、新設の3ヘルパを使う形に書き換える。

---

## HTML生成（`lib/buildMailHtml.ts`）

**07 下部大バナー** — タイトル行 + `buildLargeBannerBlock` の中身をそのまま縦積み。
04 と同じく「ボタンURLが空ならバナーURLを流用」「テキストとURLが揃ったときだけボタンを出す」。

**08 トピックスエリア**

- タイトル行
- 各アイテム: `<table>` 1行で `<td width=160 valign=top>` 画像 / `<td width=16>` gap / `<td width=376 align="left">` テキスト
- 画像に安全なURLがあればリンク化（既存 `renderLinked`）。**画像が無ければテキストだけで出す**（バナーと同じ考え方）
- 2件目以降のアイテムに `border-top:1px solid #e5e7eb; padding-top:16px;`
- 末尾にボタン1件（`buildBlockButton`、全幅552px）

**09 インフォメーション**

- 上に区切り罫線（`border-top:1px solid #e5e7eb`）
- リンクを縦積み・中央寄せ、色は `INFO_LINK_COLOR` 固定 + 下線
- `url` と `text` が揃った行だけ出力

ブロック配列:

```ts
const blocks = [
  buildStripBannerBlock(data.stripBanner),
  ...data.largeBanners.map(buildLargeBannerBlock),
  ...data.threeColumnSets.map((set) => buildColumnSetBlock(set, 'three')),
  ...data.twoColumnSets.map((set) => buildColumnSetBlock(set, 'two')),
  buildBottomBannerBlock(data.bottomBannerBlock),
  buildTopicsBlock(data.topicsBlock),
  buildInfoLinksBlock(data.infoLinks),
].filter((block) => block !== '');
```

---

## 画面設計

```
components/editor/
├── TitleFields.tsx          [新] タイトル + タイトル文字色（05/06/07/08 で共用）
├── ButtonFields.tsx         [新] URL / テキスト / 文字色 / 背景色（05/06/08 で共用）
├── BottomBannerSection.tsx  [新] 07。TitleFields + LargeBannerCard を再利用
├── TopicsSection.tsx        [新] 08。TitleFields + TopicItemCard + ButtonFields
├── TopicItemCard.tsx        [新] トピック1件。<details> の折りたたみ（08は最大8件）
├── InfoLinksSection.tsx     [新] 09。URL + リンクテキストの行を最大3件
├── LargeBannerCard.tsx      [改] idPrefix を prop で受け取れるようにして 04 / 07 で共用
├── ColumnButtonCard.tsx     [改] 入力部分を ButtonFields に置き換え
└── ColumnSetCard.tsx        [改] タイトル部分を TitleFields に置き換え
```

- `EditorPanel.tsx` に 07 / 08 / 09 を追加（`animate-rise` の遅延を 420ms / 480ms / 540ms で継続）
- `MailEditor.tsx` に対応するハンドラを追加。既存と同じく `useCallback` で束ねる
- デザインは既存トーンを踏襲。07/08 は `EditorSection` + 沈めた面のカード、09 は行が短いので `bg-paper` の細罫カード
- 09 は入力が2つだけなので折りたたみにせず、常時展開の行として並べる

---

## 実装タスク

0. 本計画書を `docs/plan-input-phase3.md` としてリポジトリに配置
1. `types/mail.ts`: `ButtonContent` を切り出して `ColumnButton` を再定義。`BottomBannerBlock` / `TopicItem` / `TopicsBlock` / `InfoLink` / 上限・レイアウト定数 / エラー型 / ファクトリ関数を追加
2. `lib/mailReducer.ts`: `addToList` / `removeFromList` / `updateInList` を追加して**既存アクションを書き換え**、続けて新規12アクションを追加
3. `lib/validation.ts`: 07 / 08 / 09 の検証を追加（既存 `urlErrorOf` / `collectById` / `omitIfEmpty` を再利用）
4. `lib/buildMailHtml.ts`: `buildBlockTitle` / `buildBlockButton` を切り出して既存を置き換え、`buildBottomBannerBlock` / `buildTopicsBlock` / `buildInfoLinksBlock` を追加
5. `TitleFields` / `ButtonFields` を作成し、`ColumnSetCard` / `ColumnButtonCard` を置き換え
6. `LargeBannerCard` を `idPrefix` 対応に変更
7. `BottomBannerSection` / `TopicItemCard` / `TopicsSection` / `InfoLinksSection` を作成
8. `EditorPanel.tsx` / `MailEditor.tsx` に 07 / 08 / 09 を接続
9. `README.md` の入力ブロック表・ディレクトリ構成を更新
10. `npm run format` → `lint` → `tsc --noEmit` → `build`

---

## Verification

```bash
nvm use && npm run lint && npx tsc --noEmit && npm run build && npm run dev
```

ロジック確認（Chrome拡張が未接続のため、Phase 1/2 と同様に `node --experimental-strip-types` で `lib/` を直接実行。**Phase 1/2 の既存テストも再実行して共通化によるリグレッションが無いことを確認する**）:

- 07: バナー5件で追加不可。ボタンURL空 → バナーURLを流用。画像幅552px
- 07: タイトルが空でもバナーがあればブロックが出る／全部空なら何も出ない
- 08: アイテムの `<td>` 幅が 160 / 16 / 376 で並ぶ
- 08: 1件目に `border-top` が付かず、2件目以降だけに付く
- 08: 画像なし・テキストのみでも出力される
- 08: ボタンは `url` と `text` が揃ったときだけ出力、全幅552px
- 09: `url` と `text` が揃った行だけ出力、色は `#2563eb` 固定、中央寄せ
- 09: 3件で追加不可
- すべての新規入力で `<script>` / `"` がエスケープされる、色に `red;background:url(x)` を入れても既定色に倒れる
- ブロック順が 帯 → 大バナー → 3カラム → 2カラム → 下部大バナー → トピックス → フッター になる

ブラウザ確認:

1. 07 でバナーを5件追加 → 追加ボタンが disabled、縦積みで表示
2. 08 でアイテムを追加 → 折りたたみカード。画像URLと太字/ノーマルテキストを入れるとプレビューで横並びになる
3. 08 で2件以上入れる → アイテム間に1pxの罫線が出る
4. 09 でリンクを3件入れる → フッターに中央寄せで縦に並ぶ
5. 既存の 01〜06 が従来どおり動く（共通化のリグレッション確認）
6. プレビュー開閉トグル、幅375pxでの縦積み
