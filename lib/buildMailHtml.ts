import { toSafeHexColor } from '@/lib/color';
import { escapeHtml } from '@/lib/escapeHtml';
import { toSafeHttpUrl } from '@/lib/validation';
import {
  COLUMN_VARIANT_CONFIG,
  DEFAULT_BUTTON_BG_COLOR,
  DEFAULT_BUTTON_TEXT_COLOR,
  DEFAULT_TEXT_COLOR,
  INFO_LINK_COLOR,
  MAIL_BODY_PADDING_X,
  MAIL_BODY_PADDING_Y,
  MAIL_CONTENT_WIDTH,
  MAIL_WIDTH,
  TOPIC_GAP_WIDTH,
  TOPIC_IMAGE_WIDTH,
  TOPIC_TEXT_WIDTH,
  type BottomBannerBlock,
  type ButtonContent,
  type ColumnItem,
  type ColumnSet,
  type ColumnVariant,
  type ColumnVariantConfig,
  type InfoLink,
  type LargeBanner,
  type MailData,
  type StripBanner,
  type TopicItem,
  type TopicsBlock,
} from '@/types/mail';

const MAIL_PADDING = 24;
const CONTENT_WIDTH = MAIL_CONTENT_WIDTH;

/**
 * メールクライアント（Gmail / Outlook 等）は <head> の CSS を落とすことがあるため、
 * レイアウトは table、装飾はインライン style で組む。
 */
const STYLES = {
  wrapper: `width:100%;border-collapse:collapse;`,
  card: `width:${MAIL_WIDTH}px;max-width:100%;border-collapse:collapse;background-color:#ffffff;border:1px solid #e5e7eb;`,
  cell: `padding:${MAIL_PADDING}px;font-family:'Hiragino Sans','Hiragino Kaku Gothic ProN',Meiryo,sans-serif;font-size:15px;line-height:1.8;color:#1f2937;`,
  stripCell: `padding:0;font-size:0;line-height:0;`,
  stripImage: `display:block;width:100%;max-width:${MAIL_WIDTH}px;height:auto;border:0;`,
  largeImage: `display:block;width:100%;max-width:${CONTENT_WIDTH}px;height:auto;border:0;outline:1px solid #e5e7eb;`,
  buttonTable: `border-collapse:collapse;margin:16px auto 0;`,
  placeholder: `margin:0;font-size:14px;line-height:1.8;color:#9ca3af;text-align:center;`,
  columnTitle: `margin:0 0 16px;font-size:18px;font-weight:bold;line-height:1.5;`,
  columnRowTable: `border-collapse:collapse;table-layout:fixed;`,
  // 画像とロゴを隙間なく縦に繋げるため、行間・文字サイズを潰したセルに入れる
  columnMediaCell: `padding:0;font-size:0;line-height:0;`,
  columnMediaImage: `display:block;width:100%;height:auto;border:0;`,
  columnBoldText: `margin:8px 0 0;font-size:14px;font-weight:bold;line-height:1.6;word-break:break-word;`,
  columnNormalText: `margin:4px 0 0;font-size:13px;line-height:1.6;word-break:break-word;`,
  columnButtonTable: `width:${CONTENT_WIDTH}px;max-width:100%;border-collapse:collapse;margin-top:12px;`,
  topicTable: `width:${CONTENT_WIDTH}px;max-width:100%;border-collapse:collapse;table-layout:fixed;`,
  // 2件目以降にだけ付ける区切り罫線
  topicSeparator: `border-top:1px solid #e5e7eb;margin-top:16px;padding-top:16px;`,
  topicImage: `display:block;width:100%;max-width:${TOPIC_IMAGE_WIDTH}px;height:auto;border:0;`,
  topicBoldText: `margin:0;font-size:15px;font-weight:bold;line-height:1.6;word-break:break-word;`,
  topicNormalText: `margin:6px 0 0;font-size:13px;line-height:1.7;word-break:break-word;`,
  infoCell: `border-top:1px solid #e5e7eb;text-align:center;`,
  infoLink: `margin:0 0 8px;font-size:13px;line-height:1.8;text-align:center;`,
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

/**
 * 大バナー1件ぶんの中身（画像 + ボタン）。
 * 04 大バナーは1件で1ブロック、07 下部大バナーはタイトルの下に縦積みするため、
 * 中身の組み立てだけを切り出して両方から使う。
 */
function buildLargeBannerContent(banner: LargeBanner): string {
  const safeImageUrl = toSafeHttpUrl(banner.imageUrl);
  const button = buildButton(banner);

  const image = safeImageUrl
    ? renderLinked(
        `<img src="${escapeHtml(safeImageUrl)}" alt="バナー画像（読み込めませんでした）" style="${STYLES.largeImage}" />`,
        banner.url,
      )
    : '';

  if (image === '' && button === '') return '';

  return `${image}${button}`;
}

/** 大バナー1件を1ブロックとして出す */
function buildLargeBannerBlock(banner: LargeBanner): string {
  const content = buildLargeBannerContent(banner);
  if (content === '') return '';

  return `<tr><td style="${STYLES.cell}padding-bottom:0;">${content}</td></tr>`;
}

/** 配列を size 件ずつの塊に分ける（カラムの行分割用） */
function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }
  return rows;
}

/**
 * カラム1つぶんのセル。
 * 画像とロゴは font-size / line-height を潰したセルに入れて隙間なく縦に繋げ、
 * URLがあれば画像とロゴをまとめて1つのリンクにする。
 */
function buildColumnCell(item: ColumnItem, config: ColumnVariantConfig): string {
  const textColor = toSafeHexColor(item.textColor, DEFAULT_TEXT_COLOR);
  const safeImageUrl = toSafeHttpUrl(item.imageUrl);
  const safeLogoUrl = toSafeHttpUrl(item.logoUrl);

  const media = [
    safeImageUrl
      ? `<img src="${escapeHtml(safeImageUrl)}" alt="画像（読み込めませんでした）" style="${STYLES.columnMediaImage}" />`
      : '',
    safeLogoUrl
      ? `<img src="${escapeHtml(safeLogoUrl)}" alt="ロゴ（読み込めませんでした）" style="${STYLES.columnMediaImage}" />`
      : '',
  ].join('');

  const mediaBlock =
    media === ''
      ? ''
      : `<table role="presentation" style="width:100%;border-collapse:collapse;"><tr><td style="${STYLES.columnMediaCell}">${renderLinked(media, item.url)}</td></tr></table>`;

  const boldText =
    item.boldText.trim() === ''
      ? ''
      : `<p style="${STYLES.columnBoldText}color:${textColor};">${escapeHtml(item.boldText)}</p>`;

  // ノーマルテキストは2カラムのみ
  const normalText =
    config.normalMaxLength === null || item.normalText.trim() === ''
      ? ''
      : `<p style="${STYLES.columnNormalText}color:${textColor};">${escapeHtml(item.normalText)}</p>`;

  return `${mediaBlock}${boldText}${normalText}`;
}

/**
 * アイテムを config.columns 件ずつの行に分けて並べる。
 * 端数の行は空セルで埋め、左寄せとカラム幅を保つ。
 */
function buildColumnRows(items: ColumnItem[], config: ColumnVariantConfig): string {
  // 中身が空のアイテムは列を消費しない（左寄せの詰め方が崩れないようにする）
  const cellContents = items
    .map((item) => buildColumnCell(item, config))
    .filter((content) => content !== '');
  if (cellContents.length === 0) return '';

  return chunk(cellContents, config.columns)
    .map((row, rowIndex) => {
      const cells: string[] = [];

      for (let column = 0; column < config.columns; column += 1) {
        if (column > 0) {
          cells.push(`<td style="width:${config.gapWidth}px;font-size:0;">&nbsp;</td>`);
        }

        cells.push(
          `<td width="${config.cellWidth}" valign="top" align="left" style="width:${config.cellWidth}px;padding:0;">${
            row[column] ?? ''
          }</td>`,
        );
      }

      // 端数の行も固定幅セルが並ぶので、float を使わなくても左寄せが保たれる
      const marginTop = rowIndex === 0 ? 0 : 20;
      return `<table role="presentation" style="${STYLES.columnRowTable}width:${CONTENT_WIDTH}px;max-width:100%;margin-top:${marginTop}px;"><tr>${cells.join('')}</tr></table>`;
    })
    .join('');
}

/**
 * ブロック見出し。タイトルが空なら何も出さない。
 * カラムボックス・下部大バナー・トピックスで共用する。
 */
function buildBlockTitle(title: string, titleColor: string): string {
  if (title.trim() === '') return '';

  const color = toSafeHexColor(titleColor, DEFAULT_TEXT_COLOR);
  return `<p style="${STYLES.columnTitle}color:${color};">${escapeHtml(title)}</p>`;
}

/**
 * コンテンツ幅いっぱいのブロックボタン。
 * テキストと遷移先が揃ったときだけ出力する。
 */
function buildBlockButton(button: ButtonContent): string {
  const text = button.text.trim();
  const safeUrl = toSafeHttpUrl(button.url);
  if (text === '' || !safeUrl) return '';

  const bgColor = toSafeHexColor(button.bgColor, DEFAULT_BUTTON_BG_COLOR);
  const textColor = toSafeHexColor(button.textColor, DEFAULT_BUTTON_TEXT_COLOR);

  return `<table role="presentation" style="${STYLES.columnButtonTable}">
        <tr><td align="center" style="background-color:${bgColor};">
          <a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" style="display:block;padding:14px 16px;color:${textColor};font-size:15px;line-height:1.4;text-align:center;text-decoration:none;">${escapeHtml(text)}</a>
        </td></tr>
      </table>`;
}

/**
 * 3カラム / 2カラムのセット1つぶん。
 * 構造が同型なので variant の設定（列数・幅・ノーマルテキストの有無）だけで切り替える。
 */
function buildColumnSetBlock(set: ColumnSet, variant: ColumnVariant): string {
  const config = COLUMN_VARIANT_CONFIG[variant];

  const title = buildBlockTitle(set.title, set.titleColor);
  const rows = buildColumnRows(set.items, config);
  const buttons = set.buttons.map(buildBlockButton).join('');

  if (title === '' && rows === '' && buttons === '') return '';

  return `<tr><td style="${STYLES.cell}padding-bottom:0;">${title}${rows}${buttons}</td></tr>`;
}

/**
 * 下部大バナー。バナー1件の中身は 04 大バナーと同じなので同じ組み立てを使う。
 * タイトル行を先頭に置き、その下にバナーを縦積みする。
 */
function buildBottomBannerBlock(block: BottomBannerBlock): string {
  const title = buildBlockTitle(block.title, block.titleColor);

  const banners = block.banners
    .map(buildLargeBannerContent)
    .filter((content) => content !== '')
    .map(
      (content, index) =>
        `<div style="margin-top:${index === 0 ? 0 : 20}px;font-size:0;line-height:0;">${content}</div>`,
    )
    .join('');

  if (title === '' && banners === '') return '';

  return `<tr><td style="${STYLES.cell}padding-bottom:0;">${title}${banners}</td></tr>`;
}

/**
 * トピックス1件のセル中身。画像とテキストを横並びにする。
 * 中身が何も無ければ '' を返し、行そのものを出さない。
 */
function buildTopicItemCells(item: TopicItem): string {
  const textColor = toSafeHexColor(item.textColor, DEFAULT_TEXT_COLOR);
  const safeImageUrl = toSafeHttpUrl(item.imageUrl);

  const image = safeImageUrl
    ? renderLinked(
        `<img src="${escapeHtml(safeImageUrl)}" alt="トピックス画像（読み込めませんでした）" style="${STYLES.topicImage}" />`,
        item.url,
      )
    : '';

  const boldText =
    item.boldText.trim() === ''
      ? ''
      : `<p style="${STYLES.topicBoldText}color:${textColor};">${escapeHtml(item.boldText)}</p>`;

  const normalText =
    item.normalText.trim() === ''
      ? ''
      : `<p style="${STYLES.topicNormalText}color:${textColor};">${escapeHtml(item.normalText)}</p>`;

  const text = `${boldText}${normalText}`;
  // 画像が無くてもテキストだけで出す（バナーと同じ考え方）
  if (image === '' && text === '') return '';

  return `<td width="${TOPIC_IMAGE_WIDTH}" valign="top" style="width:${TOPIC_IMAGE_WIDTH}px;padding:0;font-size:0;line-height:0;">${image}</td>
          <td style="width:${TOPIC_GAP_WIDTH}px;font-size:0;">&nbsp;</td>
          <td width="${TOPIC_TEXT_WIDTH}" valign="top" align="left" style="width:${TOPIC_TEXT_WIDTH}px;padding:0;">${text}</td>`;
}

function buildTopicsBlock(block: TopicsBlock): string {
  const title = buildBlockTitle(block.title, block.titleColor);

  // 空のアイテムを先に除いてから採番する（区切り罫線が先頭行に付かないようにするため）
  const itemsHtml = block.items
    .map(buildTopicItemCells)
    .filter((cells) => cells !== '')
    .map(
      (cells, index) =>
        `<table role="presentation" style="${STYLES.topicTable}${index === 0 ? '' : STYLES.topicSeparator}"><tr>${cells}</tr></table>`,
    )
    .join('');

  const button = buildBlockButton(block.button);

  if (title === '' && itemsHtml === '' && button === '') return '';

  return `<tr><td style="${STYLES.cell}padding-bottom:0;">${title}${itemsHtml}${button}</td></tr>`;
}

/** インフォメーション（フッター）。URLとテキストが揃った行だけを中央寄せで縦に並べる */
function buildInfoLinksBlock(links: InfoLink[]): string {
  const rows = links
    .map((link) => {
      const text = link.text.trim();
      const safeUrl = toSafeHttpUrl(link.url);
      if (text === '' || !safeUrl) return '';

      return `<p style="${STYLES.infoLink}"><a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" style="color:${INFO_LINK_COLOR};text-decoration:underline;">${escapeHtml(text)}</a></p>`;
    })
    .filter((row) => row !== '')
    .join('');

  if (rows === '') return '';

  return `<tr><td style="${STYLES.cell}${STYLES.infoCell}">${rows}</td></tr>`;
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
export type BuildMailHtmlOptions = {
  /**
   * プレビュー（端末画面）用に組む。
   *
   * - body の余白を落として、カードを画面の端まで広げる
   * - スクロールバーを隠す。幅を取る種類のスクロールバーだと body が細くなり、
   *   カードが 600px まで伸びられず、カラムボックスの固定幅セルがはみ出すため
   *
   * 実際に配信する HTML では既定（false）のまま使う。
   */
  forPreview?: boolean;
};

/** プレビューでだけ効かせるスタイル。配信用HTMLには入れない */
const PREVIEW_STYLE = `<style>
      html { scrollbar-width: none; }
      html::-webkit-scrollbar { display: none; }
    </style>`;

function buildBodyStyle(forPreview: boolean): string {
  // 端末画面ではカードを端まで広げたいので、プレビューでは body の余白を持たせない
  const padding = forPreview ? '' : `padding:${MAIL_BODY_PADDING_Y}px ${MAIL_BODY_PADDING_X}px;`;

  return `margin:0;${padding}background-color:#f3f4f6;-webkit-font-smoothing:antialiased;`;
}

export function buildMailHtml(data: MailData, options: BuildMailHtmlOptions = {}): string {
  const { forPreview = false } = options;
  const blocks = [
    buildStripBannerBlock(data.stripBanner),
    ...data.largeBanners.map(buildLargeBannerBlock),
    ...data.threeColumnSets.map((set) => buildColumnSetBlock(set, 'three')),
    ...data.twoColumnSets.map((set) => buildColumnSetBlock(set, 'two')),
    buildBottomBannerBlock(data.bottomBannerBlock),
    buildTopicsBlock(data.topicsBlock),
    buildInfoLinksBlock(data.infoLinks),
  ].filter((block) => block !== '');

  const content = blocks.length > 0 ? blocks.join('') : buildPlaceholderBlock();

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>メルマガプレビュー</title>${forPreview ? `\n    ${PREVIEW_STYLE}` : ''}
  </head>
  <body style="${buildBodyStyle(forPreview)}">
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
