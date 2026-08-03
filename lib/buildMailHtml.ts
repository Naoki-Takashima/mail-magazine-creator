import { escapeHtml, nl2br } from '@/lib/escapeHtml';
import { toSafeHttpUrl } from '@/lib/validation';
import type { MailData } from '@/types/mail';

const MAIL_WIDTH = 600;

/**
 * メールクライアント（Gmail / Outlook 等）は <head> の CSS を落とすことがあるため、
 * レイアウトは table、装飾はインライン style で組む。
 */
const STYLES = {
  body: `margin:0;padding:24px 12px;background-color:#f3f4f6;-webkit-font-smoothing:antialiased;`,
  wrapper: `width:100%;border-collapse:collapse;`,
  card: `width:${MAIL_WIDTH}px;max-width:100%;border-collapse:collapse;background-color:#ffffff;border:1px solid #e5e7eb;`,
  cell: `padding:24px;font-family:'Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic',Meiryo,Arial,sans-serif;font-size:15px;line-height:1.8;color:#1f2937;`,
  image: `display:block;width:100%;max-width:${MAIL_WIDTH - 48}px;height:auto;border:0;outline:1px solid #e5e7eb;`,
  text: `margin:0;font-size:15px;line-height:1.8;color:#1f2937;word-break:break-word;`,
  link: `color:#2563eb;text-decoration:underline;word-break:break-all;`,
  placeholder: `margin:0;font-size:14px;line-height:1.8;color:#9ca3af;text-align:center;`,
} as const;

/** 画像ブロック。URLが安全でなければ何も描かない */
function buildImageBlock(imageUrl: string): string {
  const safeUrl = toSafeHttpUrl(imageUrl);
  if (!safeUrl) return '';

  // allow-scripts なしの iframe なので onerror は使えない。
  // 読み込み失敗時は alt テキストと outline がプレースホルダとして機能する。
  return `<tr><td style="${STYLES.cell}padding-bottom:0;">
      <img src="${escapeHtml(safeUrl)}" alt="メルマガ画像（読み込めませんでした）" style="${STYLES.image}" />
    </td></tr>`;
}

/** テキストブロック。改行のみ反映（Markdown非対応） */
function buildTextBlock(text: string): string {
  if (text.trim() === '') return '';

  return `<tr><td style="${STYLES.cell}padding-bottom:0;">
      <p style="${STYLES.text}">${nl2br(escapeHtml(text))}</p>
    </td></tr>`;
}

/** リンクブロック。URLが安全でなければ何も描かない */
function buildLinkBlock(url: string): string {
  const safeUrl = toSafeHttpUrl(url);
  if (!safeUrl) return '';

  const escaped = escapeHtml(safeUrl);
  return `<tr><td style="${STYLES.cell}padding-bottom:0;">
      <a href="${escaped}" target="_blank" rel="noopener noreferrer" style="${STYLES.link}">${escaped}</a>
    </td></tr>`;
}

function buildPlaceholderBlock(): string {
  return `<tr><td style="${STYLES.cell}">
      <p style="${STYLES.placeholder}">左のフォームに入力すると、ここにプレビューが表示されます。</p>
    </td></tr>`;
}

/**
 * MailData から HTMLメール1通ぶんの文字列を生成する純関数。
 * React コンポーネントに依存しないので、将来「HTMLをコピー / ダウンロード」を
 * 追加するときはこの関数をそのまま再利用できる。
 */
export function buildMailHtml(data: MailData): string {
  const blocks = [
    buildImageBlock(data.imageUrl),
    buildTextBlock(data.text),
    buildLinkBlock(data.url),
  ].filter((block) => block !== '');

  const content = blocks.length > 0 ? blocks.join('') : buildPlaceholderBlock();

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>メルマガプレビュー</title>
  </head>
  <body style="${STYLES.body}">
    <table role="presentation" style="${STYLES.wrapper}">
      <tr>
        <td align="center">
          <table role="presentation" style="${STYLES.card}">
            ${content}
            <tr><td style="height:24px;line-height:24px;font-size:0;">&nbsp;</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
