# HTML出力ボタン

## 要件

- インプット画面の最下部に「HTML出力」ボタンを置く
- 押すと、プレビューに出ている内容どおりの HTML ファイルをダウンロードする
- ファイル名は配信日時から `YYYYMMDD_hhmm.html`

## 確定した仕様（ヒアリング）

| 論点             | 決定                                                                       |
| ---------------- | -------------------------------------------------------------------------- |
| 出力するHTML     | **配信用**（`body` に `padding:24px 12px`、スクロールバー用CSSは入れない） |
| 件名             | **`<title>` に入れる**。本文には出さない                                   |
| 必須項目が未入力 | **ボタンを disabled**（配信日時が無いとファイル名を作れない）              |
| URL形式エラー    | **同じく disabled**（欠落したまま出力する事故を防ぐ）                      |

上2つを合わせると判定は単純で、**バリデーションエラーが1件でも残っていれば disabled**。
`validateMailData` は空のキーを省いて返すので、`Object.keys(errors).length === 0` で判定できる。

プレビュー用HTML（`forPreview: true`）との差は `body` の余白とスクロールバー用CSSだけで、
本文の中身は完全に同一。「プレビューどおり」は保たれる。

---

## 設計

### 1. ファイル名（`lib/deliveryDate.ts`）

内部表現は `YYYYMMDDhhmm` なので、区切りを1つ入れるだけ。

```ts
/** 'YYYYMMDDhhmm' → 'YYYYMMDD_hhmm'。無効な値なら null */
export function toFileNameDateTime(compact: string): string | null {
  if (!isValidCompactDateTime(compact)) return null;
  return `${compact.slice(0, 8)}_${compact.slice(8)}`;
}
```

ファイル名は `` `${toFileNameDateTime(deliveryDate)}.html` ``。
日時は検証済みの数字だけなので、パス区切りや制御文字が混ざる余地はない。

### 2. `<title>` に件名（`lib/buildMailHtml.ts`）

固定文言だった `<title>メルマガプレビュー</title>` を件名に差し替える。

```ts
const title = data.subject.trim();
// …
<title>${escapeHtml(title) || 'メルマガ'}</title>
```

- 件名も他の入力と同じく `escapeHtml` を通す（`</title>` を含む入力で構造を壊さないため）
- プレビュー用HTMLも同じ経路を通るが、iframe にタブは無いので見た目への影響はない

### 3. ダウンロード（`lib/downloadHtml.ts` 新規）

追加ライブラリなし。Blob と `<a download>` だけで完結する。

```ts
export function downloadHtml(fileName: string, html: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  // click 直後に解放するとダウンロードが始まらない環境があるので、次のタスクまで待つ
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
```

BOM は付けない（`<meta charset="utf-8">` があり、`file://` で開いても文字化けしない）。

### 4. 出力可否（`lib/validation.ts`）

```ts
/** エラーが1件も無ければ true */
export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
```

エラー種別で文言を出し分けたいので、UI 側では次の順で理由を決める。

1. `deliveryDate` / `subject` のいずれかにエラー → 「配信日と件名を入力してください」
2. それ以外のエラーがある → 「URLのエラーを直してください」

### 5. UI（`components/editor/ExportSection.tsx` 新規）

- `EditorSection` は「番号 + 見出し + 必須バッジ」の入力ブロック用なので使わず、独立した節にする
- ボタンは主要アクションなので、`AddItemButton` の破線とは変えて**朱の実線**にする
- disabled のときだけ理由を下に出し、`aria-describedby` で結線する
- 押した瞬間の結果はファイルのダウンロードそのものなので、完了トーストは出さない

```
┌ Export ─────────────────────────────┐
│ HTML出力                            │
│ 入力内容を1枚のHTMLファイルとして    │
│ 書き出します。                       │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │       HTMLを出力                │ │
│ └─────────────────────────────────┘ │
│ 20260803_1000.html                  │  ← 出力されるファイル名を先に見せる
└─────────────────────────────────────┘
```

配置は `EditorPanel` の最後、既存の注意書き（「入力内容はブラウザ上でのみ…」）の**上**。
注意書きはフッタとして最後に残す。

### 6. 配線（`components/MailEditor.tsx`）

```ts
const exportHtml = useCallback(() => {
  const fileName = toFileNameDateTime(mailData.deliveryDate);
  if (!fileName) return; // ボタンは disabled なので通常ここには来ない
  downloadHtml(`${fileName}.html`, buildMailHtml(mailData));
}, [mailData]);
```

- **デバウンス前の `mailData`** を使う。プレビューは 200ms 遅れるが、出力は押した瞬間の内容にする
- `buildMailHtml(mailData)` はオプション無し = 配信用
- `EditorPanel` には `canExport`（= エラー無し）と `exportFileName`、`onExport` を渡す

---

## 実装タスク

1. 本計画書を `docs/plan-html-export.md` として配置
2. `lib/deliveryDate.ts`: `toFileNameDateTime` を追加
3. `lib/buildMailHtml.ts`: `<title>` を件名に
4. `lib/downloadHtml.ts`: 新規
5. `lib/validation.ts`: `hasValidationErrors` を追加
6. `components/editor/ExportSection.tsx`: 新規
7. `components/editor/EditorPanel.tsx` / `components/MailEditor.tsx`: 配線
8. `README.md` 更新（機能・ディレクトリ構成・「今後の拡張」から HTML 出力を外す）
9. `npm run format` → `lint` → `tsc --noEmit` → `build`

## Verification

```bash
nvm use && npm run format:check && npx tsc --noEmit && npm run lint && npm run build
```

ロジック確認（`node --experimental-strip-types` で `lib/` を直接実行）:

- `toFileNameDateTime('202608031000')` → `'20260803_1000'`
- `toFileNameDateTime('')` / `'20260231xxxx'` → `null`
- 配信用HTMLに `padding:24px 12px` があり、`scrollbar-width` は無い
- `<title>` が件名になり、`</title>` を含む件名でも構造が壊れない
- 件名が空なら `<title>メルマガ</title>`
- 配信用とプレビュー用で、本文（`<body>` の中身）が完全に一致する
- `hasValidationErrors`: 初期状態（配信日・件名が空）で true、両方埋めると false

ブラウザ確認:

1. 未入力の状態でボタンが disabled、理由が出る
2. 配信日と件名を入れると押せるようになり、ファイル名のプレビューが出る
3. URLに `javascript:alert(1)` を入れると再び disabled になる
4. 押すと `20260803_1000.html` がダウンロードされる
5. そのファイルをブラウザで開くと、プレビューと同じ内容（カードの周りに灰色の余白が付く）

## やらないこと

- HTMLソースのクリップボードコピー（別機能として後日）
- 画像の同梱・zip 化（外部URLを参照する形のまま）
- ダウンロード完了のトースト表示
- 件名を本文にも出すこと（HTMLメールとしては二重になるため）
