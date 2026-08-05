# メルマガ作成ツール: 入力ブロック拡張

## Context

MVP（URL / 画像URL / テキストの3入力 + リアルタイムプレビュー）は実装・ビルド済み。
ここから実運用のメルマガ構造に寄せるため、入力を**4ブロック構成**に作り替える。

- 既存の「URL / 画像URL / テキスト」3入力は**全削除**（帯バナー・大バナーに吸収されるため）
- 入力エリアはブロックごとに区切って表示
- 配信日・件名は**メール本文には出さず**、プレビューの外に表示する

確定した仕様（ヒアリング済み）:

- 配信日の入力UI = `datetime-local`（内部では `YYYYMMDDhhmm` で保持）
- 配信日・件名の表示先 = **プレビューパネル上部のメタ欄**（iframe の外、受信ヘッダ風）
- 大バナーのボタンURL = 空ならバナーURLを流用
- 大バナーUI = 初期0件、「追加」で最大3件まで、各カードに削除ボタン
- バナーは**画像だけでも表示**（URL未入力ならリンクなしの `<img>`）。URLのみ・画像なしは何も出さない
- ボタン色 = カラーピッカー + 色コードテキストの両方から編集可
- メール内のブロック順 = 帯バナー → 大バナー
- 画像幅 = 帯バナーは600px全幅（左右余白なし）、大バナーは左右24px余白（552px）
- ボタンURL・バナーURLがどちらも空なら**ボタンは出さない**
- 大バナーの並べ替え（上下移動）は今回入れない（追加・削除のみ）

---

## データ設計

`types/mail.ts` を全面差し替え。

```ts
/** バナー共通の「画像 + 遷移先」 */
export type BannerLink = {
  url: string;
  imageUrl: string;
};

/** 帯バナー（最大1件なのでオブジェクト1つで持つ） */
export type StripBanner = BannerLink;

export type LargeBanner = BannerLink & {
  /** React の key と更新対象の特定に使う。crypto.randomUUID() で採番 */
  id: string;
  buttonUrl: string;
  buttonText: string;
  /** '#rrggbb'。既定 '#ffffff' */
  buttonTextColor: string;
  /** '#rrggbb'。既定 '#000000' */
  buttonBgColor: string;
};

export type MailData = {
  /** 'YYYYMMDDhhmm'。必須 */
  deliveryDate: string;
  /** 必須 */
  subject: string;
  stripBanner: StripBanner;
  /** 最大 MAX_LARGE_BANNERS 件 */
  largeBanners: LargeBanner[];
};

export const MAX_LARGE_BANNERS = 3;
export const DEFAULT_BUTTON_TEXT_COLOR = '#ffffff';
export const DEFAULT_BUTTON_BG_COLOR = '#000000';

export const INITIAL_MAIL_DATA: MailData = {
  deliveryDate: '',
  subject: '',
  stripBanner: { url: '', imageUrl: '' },
  largeBanners: [],
};
```

エラー型はネスト構造に合わせて拡張:

```ts
export type BannerErrors = { url?: string; imageUrl?: string; buttonUrl?: string };

export type ValidationErrors = {
  deliveryDate?: string;
  subject?: string;
  stripBanner?: BannerErrors;
  /** バナー id → エラー */
  largeBanners?: Record<string, BannerErrors>;
};
```

---

## 状態管理: `useState` → `useReducer`

状態がネスト + 可変長配列になったため、MVP計画に書いたとおりのタイミングで移行する。
リデューサは純関数として `lib/mailReducer.ts` に切り出し、`MailEditor.tsx` からは `useReducer` で使う（Context・外部ライブラリは引き続き不要）。

```ts
export type MailAction =
  | { type: 'setField'; field: 'deliveryDate' | 'subject'; value: string }
  | { type: 'setStripBannerField'; field: keyof StripBanner; value: string }
  | { type: 'addLargeBanner' }
  | { type: 'removeLargeBanner'; id: string }
  | { type: 'setLargeBannerField'; id: string; field: EditableLargeBannerField; value: string };
```

- `addLargeBanner` は `MAX_LARGE_BANNERS` を超えたら state をそのまま返す（UI側でもボタンを disabled にし、二重で守る）
- `id` は `crypto.randomUUID()`。初期値が空配列なので SSR/CSR の不一致は起きない
- デバウンス（`hooks/useDebouncedValue.ts`）と `buildMailHtml` の `useMemo` は現状のまま流用

---

## 新規ロジック（すべて純関数 / lib 配下）

### `lib/deliveryDate.ts`

`datetime-local` の値と `YYYYMMDDhhmm` を相互変換する層。要件どおり内部表現は12桁固定。

- `toCompactDateTime('2026-08-03T10:00') → '202608031000'`
- `toDatetimeLocalValue('202608031000') → '2026-08-03T10:00'`（不正なら `''`）
- `isValidCompactDateTime(value)` — 12桁数字かつ実在する日時か
- `formatDeliveryDate('202608031000') → '2026年8月3日(月) 10:00'` — メタ欄の表示用

### `lib/color.ts`

`toSafeHexColor(value, fallback)` — `#rgb` / `#rrggbb` のみ通し、それ以外は fallback を返す。
**style 属性に色を差し込むため必須**（`escapeHtml` だけでは `red;background:url(...)` のような値を弾けない）。

### `lib/validation.ts`（改修）

既存の `isSafeHttpUrl` / `toSafeHttpUrl` はそのまま再利用し、`validateMailData` を新構造に対応させる。

- `deliveryDate`: 未入力 → 「配信日を入力してください」／形式不正 → 「有効な日時を入力してください」
- `subject`: 未入力（空白のみ含む） → 「件名を入力してください」
- 各バナーの `url` / `imageUrl` / `buttonUrl`: 入力があり `http(s)` でなければエラー（空欄はエラーにしない）

### `lib/buildMailHtml.ts`（改修）

**配信日・件名は出力しない。** ブロック順は 帯バナー → 大バナー。

- `buildStripBannerBlock(banner)`: `imageUrl` が安全なときだけ出力。600px 幅の全面画像（左右padding無し）。`url` があれば `<a>` で包む
- `buildLargeBannerBlock(banner)`: 画像（あればリンク付き）+ ボタン。1カラムで縦に積む。バナー間はスペーサー行
- ボタン: `buttonText` が非空、かつ「`buttonUrl` または `url`」が安全なURLのときに出力。メールクライアント互換のため `<table>` + `<td background-color>` + `<a display:block>` の bulletproof button 形式
- ボタン色は `toSafeHexColor` を通し、既定値へフォールバック
- 出力ブロックが1つも無ければ既存のプレースホルダ行を出す
- ヘルパ `renderLinked(html, url)`（URLがあれば `<a>` で包む）を用意して帯／大バナーで共用

---

## 画面設計

```
components/
├── AppHeader.tsx                     （変更なし）
├── MailEditor.tsx                    useReducer へ変更
├── editor/
│   ├── EditorPanel.tsx               4ブロックを並べる
│   ├── EditorSection.tsx      [新]   ブロックの枠。番号 + 見出し + 必須/任意バッジ + 補足
│   ├── FormField.tsx                 index prop を廃止（番号はブロック側へ移動）
│   ├── fields/
│   │   ├── TextField.tsx      [新]   単一行テキスト
│   │   ├── UrlField.tsx       [新]   type=url
│   │   ├── DateTimeField.tsx  [新]   type=datetime-local
│   │   └── ColorField.tsx     [新]   カラーピッカー + 色コードテキスト
│   ├── DeliveryDateSection.tsx [新]
│   ├── SubjectSection.tsx      [新]
│   ├── StripBannerSection.tsx  [新]
│   ├── LargeBannerSection.tsx  [新]  追加ボタン + 件数表示 + 上限制御
│   └── LargeBannerCard.tsx     [新]  1件分の6入力 + 削除ボタン
└── preview/
    ├── PreviewPanel.tsx              PreviewMeta を iframe の上に差し込む
    ├── PreviewMeta.tsx        [新]   配信日時 / 件名（未入力は「未設定」表示）
    └── MailFrame.tsx                 （変更なし）
```

**削除**: `components/editor/UrlInput.tsx` / `ImageInput.tsx` / `TextInput.tsx`
（既存3入力の廃止に伴い不要。`FormField.tsx` の `fieldClassName` / `describedBy` は新フィールド群でそのまま再利用する）

デザインは既存の「校正刷り」トーンを踏襲:

- `EditorSection` はブロック番号（`01`〜`04`）+ 朱色の必須バッジ / グレーの任意バッジ
- `LargeBannerCard` は用紙を一段沈めた面（`bg-paper-sunk`）に細罫、右上に削除ボタン、左上に `BANNER 01` の等幅ラベル
- `PreviewMeta` は iframe 上部に罫線で区切ったメタ欄（`配信日時` / `件名` を等幅ラベル + 明朝の値で組む）

---

## 実装タスク

0. 本計画書を `docs/plan-input-phase1.md` としてリポジトリに配置
1. `types/mail.ts` を新構造へ差し替え（定数・エラー型含む）
2. `lib/deliveryDate.ts` / `lib/color.ts` を新規作成
3. `lib/validation.ts` を新構造対応に改修（`isSafeHttpUrl` は流用）
4. `lib/buildMailHtml.ts` を帯バナー・大バナー・ボタン出力に作り替え
5. `lib/mailReducer.ts` を新規作成、`MailEditor.tsx` を `useReducer` へ移行
6. `FormField.tsx` から `index` を外し、`fields/` 配下の共通入力4種を作成
7. 旧 `UrlInput` / `ImageInput` / `TextInput` を削除
8. `EditorSection` + 4ブロックのセクションコンポーネントを作成、`EditorPanel` で組み立て
9. `LargeBannerSection` / `LargeBannerCard`（追加・削除・上限3件・色入力）
10. `PreviewMeta` を作成し `PreviewPanel` に組み込み
11. `README.md` を新しいデータ構造・ブロック構成に合わせて更新（`docs/plan.md` はMVP時点の記録としてそのまま残す）
12. `npm run format` → `lint` → `build`

---

## Verification

```bash
nvm use
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

ロジックの確認（Chrome拡張が繋がらない環境向けに、前回同様 `node --experimental-strip-types` で `lib/` を直接実行して検証する）:

- `formatDeliveryDate('202608031000')` → `2026年8月3日(月) 10:00`
- `toCompactDateTime` / `toDatetimeLocalValue` の往復で値が保存されること
- `toSafeHexColor('red;background:url(x)', '#000000')` → `#000000`
- ボタン色に不正値を入れても `style` 属性が壊れないこと
- `buttonUrl` 空 + バナー `url` あり → ボタンの `href` がバナーURLになること
- 画像のみ入力 → `<a>` なしの `<img>` が出ること
- `<script>` や `"` を各入力に入れてもエスケープされること

ブラウザでの確認:

1. 配信日・件名 未入力 → 各欄に赤字エラー、メタ欄は「未設定」
2. 配信日を選択 → メタ欄が `2026年8月3日(月) 10:00` 形式で更新
3. 帯バナーに画像URLのみ → プレビュー最上部に画像。URLも入れるとリンク化（クリックで新規タブ）
4. 大バナーを3件追加 → 「追加」ボタンが disabled、縦に3枚積まれる
5. 2件目を削除 → 残り2件が正しく残る（入力値が他カードにずれない）
6. ボタン背景色・文字色を変更 → プレビューのボタンに即反映
7. プレビュー開閉トグル、幅375pxでの縦積みが従来どおり動作
