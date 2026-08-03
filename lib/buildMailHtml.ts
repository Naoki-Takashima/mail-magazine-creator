import { toSafeHexColor } from '@/lib/color';
import { escapeHtml } from '@/lib/escapeHtml';
import { toSafeHttpUrl } from '@/lib/validation';
import {
  DEFAULT_BUTTON_BG_COLOR,
  DEFAULT_BUTTON_TEXT_COLOR,
  type LargeBanner,
  type MailData,
  type StripBanner,
} from '@/types/mail';

const MAIL_WIDTH = 600;
const MAIL_PADDING = 24;
const CONTENT_WIDTH = MAIL_WIDTH - MAIL_PADDING * 2;

/**
 * メールクライアント（Gmail / Outlook 等）は <head> の CSS を落とすことがあるため、
 * レイアウトは table、装飾はインライン style で組む。
 */
const STYLES = {
  body: `margin:0;padding:24px 12px;background-color:#f3f4f6;-webkit-font-smoothing:antialiased;`,
  wrapper: `width:100%;border-collapse:collapse;`,
  card: `width:${MAIL_WIDTH}px;max-width:100%;border-collapse:collapse;background-color:#ffffff;border:1px solid #e5e7eb;`,
  cell: `padding:${MAIL_PADDING}px;font-family:'Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic',Meiryo,Arial,sans-serif;font-size:15px;line-height:1.8;color:#1f2937;`,
  stripCell: `padding:0;font-size:0;line-height:0;`,
  stripImage: `display:block;width:100%;max-width:${MAIL_WIDTH}px;height:auto;border:0;`,
  largeImage: `display:block;width:100%;max-width:${CONTENT_WIDTH}px;height:auto;border:0;outline:1px solid #e5e7eb;`,
  buttonTable: `border-collapse:collapse;margin:16px auto 0;`,
  placeholder: `margin:0;font-size:14px;line-height:1.8;color:#9ca3af;text-align:center;`,
} as const;

/** 安全なURLがあればリンクで包む。無ければ中身をそのまま返す */
function renderLinked(inner: string, url: string): string {
  const safeUrl = toSafeHttpUrl(url);
  if (!safeUrl) return inner;

  return `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" style="display:block;text-decoration:none;">${inner}</a>`;
}

/**
 * 帯バナー。画像が主体なので、画像さえあればURL未入力でも表示する。
 * 左右の余白を取らず、メール幅いっぱいの帯として置く。
 */
function buildStripBannerBlock(banner: StripBanner): string {
  const safeImageUrl = toSafeHttpUrl(banner.imageUrl);
  if (!safeImageUrl) return '';

  // allow-scripts なしの iframe なので onerror は使えない。
  // 読み込み失敗時は alt テキストがプレースホルダとして機能する。
  const image = `<img src="${escapeHtml(safeImageUrl)}" alt="帯バナー（読み込めませんでした）" style="${STYLES.stripImage}" />`;

  return `<tr><td style="${STYLES.stripCell}">${renderLinked(image, banner.url)}</td></tr>`;
}

/**
 * ボタン。メールクライアント互換のため、背景色は <td> に、
 * クリック領域は block 表示の <a> に持たせる（bulletproof button）。
 *
 * 遷移先は「ボタンURL、無ければバナーURL」。どちらも無ければボタン自体を出さない。
 */
function buildButton(banner: LargeBanner): string {
  const text = banner.buttonText.trim();
  if (text === '') return '';

  const safeUrl = toSafeHttpUrl(banner.buttonUrl) ?? toSafeHttpUrl(banner.url);
  if (!safeUrl) return '';

  const bgColor = toSafeHexColor(banner.buttonBgColor, DEFAULT_BUTTON_BG_COLOR);
  const textColor = toSafeHexColor(banner.buttonTextColor, DEFAULT_BUTTON_TEXT_COLOR);

  return `<table role="presentation" style="${STYLES.buttonTable}">
        <tr><td style="background-color:${bgColor};">
          <a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" style="display:block;padding:14px 32px;color:${textColor};font-size:15px;line-height:1.4;text-align:center;text-decoration:none;">${escapeHtml(text)}</a>
        </td></tr>
      </table>`;
}

/** 大バナー1件。画像 + ボタンを1カラムで積む */
function buildLargeBannerBlock(banner: LargeBanner): string {
  const safeImageUrl = toSafeHttpUrl(banner.imageUrl);
  const button = buildButton(banner);

  const image = safeImageUrl
    ? renderLinked(
        `<img src="${escapeHtml(safeImageUrl)}" alt="バナー画像（読み込めませんでした）" style="${STYLES.largeImage}" />`,
        banner.url,
      )
    : '';

  if (image === '' && button === '') return '';

  return `<tr><td style="${STYLES.cell}padding-bottom:0;">${image}${button}</td></tr>`;
}

function buildPlaceholderBlock(): string {
  return `<tr><td style="${STYLES.cell}">
      <p style="${STYLES.placeholder}">左のフォームに入力すると、ここにプレビューが表示されます。</p>
    </td></tr>`;
}

/**
 * MailData から HTMLメール1通ぶんの文字列を生成する純関数。
 *
 * 配信日・件名は本文には含めない（プレビュー外のメタ欄に表示する）。
 * React に依存しないので、将来「HTMLをコピー / ダウンロード」を追加するときは
 * この関数をそのまま再利用できる。
 */
export function buildMailHtml(data: MailData): string {
  const blocks = [
    buildStripBannerBlock(data.stripBanner),
    ...data.largeBanners.map(buildLargeBannerBlock),
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
            <tr><td style="height:${MAIL_PADDING}px;line-height:${MAIL_PADDING}px;font-size:0;">&nbsp;</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
