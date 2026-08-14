import { buildMailHtml } from '@/lib/buildMailHtml';
import {
  COLUMN_VARIANT_CONFIG,
  createColumnItem,
  createColumnSet,
  createInfoLink,
  createLargeBanner,
  createTopicItem,
  INITIAL_MAIL_DATA,
  MAIL_CONTENT_WIDTH,
  MAIL_WIDTH,
  type ColumnVariant,
  type MailData,
} from '@/types/mail';

const IMAGE_URL = 'https://example.com/banner.png';
const LINK_URL = 'https://example.com/campaign';

/** body の中身だけを取り出す（body タグの style は forPreview で変わるため含めない） */
function bodyInner(html: string): string {
  const bodyStart = html.indexOf('<body');
  const contentStart = html.indexOf('>', bodyStart) + 1;
  return html.slice(contentStart, html.indexOf('</body>'));
}

/** アイテム1件だけを持つカラムセットを組む */
function dataWithColumnItem(
  variant: ColumnVariant,
  item: Partial<ReturnType<typeof createColumnItem>>,
): MailData {
  const set = {
    ...createColumnSet('set-1'),
    items: [{ ...createColumnItem('item-1'), ...item }],
  };

  return { ...INITIAL_MAIL_DATA, [COLUMN_VARIANT_CONFIG[variant].stateKey]: [set] };
}

describe('入力が空のとき', () => {
  it('プレースホルダの案内だけを出す', () => {
    const html = buildMailHtml(INITIAL_MAIL_DATA);

    expect(html).toContain('左のフォームに入力すると、ここにプレビューが表示されます。');
    expect(html).not.toContain('<img');
  });

  it('件名が空なら既定のタイトルを使う', () => {
    expect(buildMailHtml(INITIAL_MAIL_DATA)).toContain('<title>メルマガ</title>');
  });

  it('プレビューではプレースホルダを画面の高さいっぱいのセルに入れる', () => {
    expect(buildMailHtml(INITIAL_MAIL_DATA, { forPreview: true })).toContain('height:calc(100vh');
    expect(buildMailHtml(INITIAL_MAIL_DATA)).not.toContain('100vh');
  });
});

describe('件名', () => {
  it('<title> に入れ、本文には出さない', () => {
    const html = buildMailHtml({ ...INITIAL_MAIL_DATA, subject: '8月号のお知らせ' });

    expect(html).toContain('<title>8月号のお知らせ</title>');
    expect(bodyInner(html)).not.toContain('8月号のお知らせ');
  });

  it('前後の空白を落とす', () => {
    expect(buildMailHtml({ ...INITIAL_MAIL_DATA, subject: '  8月号  ' })).toContain(
      '<title>8月号</title>',
    );
  });

  it('配信日は本文にもタイトルにも出さない', () => {
    const html = buildMailHtml({ ...INITIAL_MAIL_DATA, deliveryDate: '202608031000' });

    expect(html).not.toContain('202608031000');
  });
});

describe('エスケープ', () => {
  it('件名のタグを実体参照にする', () => {
    const html = buildMailHtml({ ...INITIAL_MAIL_DATA, subject: '<script>alert(1)</script>' });

    expect(html).toContain('<title>&lt;script&gt;alert(1)&lt;/script&gt;</title>');
    expect(html).not.toContain('<script>');
  });

  it('本文テキストのタグを実体参照にする', () => {
    const html = buildMailHtml(dataWithColumnItem('two', { boldText: '<img src=x>' }));

    expect(html).toContain('&lt;img src=x&gt;');
    expect(html).not.toContain('<img src=x>');
  });

  it('タイトルの引用符をエスケープする（style 属性の外に出させない）', () => {
    const set = { ...createColumnSet('set-1'), title: '"><b>x</b>' };
    const html = buildMailHtml({ ...INITIAL_MAIL_DATA, threeColumnSets: [set] });

    expect(html).toContain('&quot;&gt;&lt;b&gt;x&lt;/b&gt;');
  });
});

describe('URLの安全化', () => {
  it('javascript: のリンクはリンクごと出さない', () => {
    const banner = {
      ...createLargeBanner('banner-1'),
      imageUrl: IMAGE_URL,
      url: 'javascript:alert(1)',
    };
    const html = buildMailHtml({ ...INITIAL_MAIL_DATA, largeBanners: [banner] });

    expect(html).not.toContain('javascript:');
    // 画像は残り、リンクだけが外れる
    expect(html).toContain(IMAGE_URL);
    expect(html).not.toContain('<a href');
  });

  it('javascript: の画像URLは <img> ごと出さない', () => {
    const banner = { ...createLargeBanner('banner-1'), imageUrl: 'javascript:alert(1)' };
    const html = buildMailHtml({ ...INITIAL_MAIL_DATA, largeBanners: [banner] });

    expect(html).not.toContain('<img');
  });

  it('data: の画像URLも出さない', () => {
    const banner = {
      ...createLargeBanner('banner-1'),
      imageUrl: 'data:text/html,<script>alert(1)</script>',
    };

    expect(buildMailHtml({ ...INITIAL_MAIL_DATA, largeBanners: [banner] })).not.toContain('<img');
  });

  it('リンクには target と rel を必ず付ける', () => {
    const banner = { ...createLargeBanner('banner-1'), imageUrl: IMAGE_URL, url: LINK_URL };
    const html = buildMailHtml({ ...INITIAL_MAIL_DATA, largeBanners: [banner] });

    expect(html).toContain('target="_blank" rel="noopener noreferrer"');
  });
});

describe('色の安全化', () => {
  const INJECTION = 'red;background:url(https://evil.example.com/x.png)';

  it('タイトル文字色に別の宣言を差し込めない', () => {
    const set = { ...createColumnSet('set-1'), title: 'タイトル', titleColor: INJECTION };
    const html = buildMailHtml({ ...INITIAL_MAIL_DATA, threeColumnSets: [set] });

    expect(html).not.toContain('evil.example.com');
    // 不正な色は既定色に倒れる
    expect(html).toContain('color:#000000;');
  });

  it('ボタンの背景色に別の宣言を差し込めない', () => {
    const banner = {
      ...createLargeBanner('banner-1'),
      url: LINK_URL,
      buttonText: '詳しく見る',
      buttonBgColor: INJECTION,
    };
    const html = buildMailHtml({ ...INITIAL_MAIL_DATA, largeBanners: [banner] });

    expect(html).not.toContain('evil.example.com');
    expect(html).toContain('background-color:#000000;');
  });

  it('正しい色コードはそのまま反映する', () => {
    const set = { ...createColumnSet('set-1'), title: 'タイトル', titleColor: '#2383E2' };

    expect(buildMailHtml({ ...INITIAL_MAIL_DATA, threeColumnSets: [set] })).toContain(
      'color:#2383e2;',
    );
  });
});

describe('帯バナー（03）', () => {
  it('未追加（null）なら何も出さない', () => {
    expect(buildMailHtml({ ...INITIAL_MAIL_DATA, stripBanner: null })).not.toContain('<img');
  });

  it('画像URLだけならリンクなしの画像を出す', () => {
    const html = buildMailHtml({
      ...INITIAL_MAIL_DATA,
      stripBanner: { url: '', imageUrl: IMAGE_URL },
    });

    expect(html).toContain(`<img src="${IMAGE_URL}"`);
    expect(html).not.toContain('<a href');
  });

  it('URLがあれば画像をリンクで包む', () => {
    const html = buildMailHtml({
      ...INITIAL_MAIL_DATA,
      stripBanner: { url: LINK_URL, imageUrl: IMAGE_URL },
    });

    expect(html).toContain(`<a href="${LINK_URL}"`);
  });

  it('画像URLが無ければURLがあっても出さない', () => {
    const html = buildMailHtml({
      ...INITIAL_MAIL_DATA,
      stripBanner: { url: LINK_URL, imageUrl: '' },
    });

    expect(html).not.toContain('<img');
    expect(html).not.toContain(LINK_URL);
  });

  it('メール幅いっぱいの帯として出す', () => {
    const html = buildMailHtml({
      ...INITIAL_MAIL_DATA,
      stripBanner: { url: '', imageUrl: IMAGE_URL },
    });

    expect(html).toContain(`max-width:${MAIL_WIDTH}px`);
  });
});

describe('大バナー（04）', () => {
  it('ボタンURLが空ならバナーURLを流用する', () => {
    const banner = {
      ...createLargeBanner('banner-1'),
      url: LINK_URL,
      imageUrl: IMAGE_URL,
      buttonText: '詳しく見る',
      buttonUrl: '',
    };
    const html = buildMailHtml({ ...INITIAL_MAIL_DATA, largeBanners: [banner] });

    expect(html).toContain('詳しく見る');
    expect(html).toContain(`<a href="${LINK_URL}"`);
  });

  it('ボタンURLがあればそちらを優先する', () => {
    const buttonUrl = 'https://example.com/button';
    const banner = {
      ...createLargeBanner('banner-1'),
      url: LINK_URL,
      buttonText: '詳しく見る',
      buttonUrl,
    };
    const html = buildMailHtml({ ...INITIAL_MAIL_DATA, largeBanners: [banner] });

    expect(html).toContain(`<a href="${buttonUrl}"`);
    expect(html).not.toContain(`href="${LINK_URL}"`);
  });

  it('ボタンテキストが空ならボタンを出さない', () => {
    const banner = {
      ...createLargeBanner('banner-1'),
      url: LINK_URL,
      imageUrl: IMAGE_URL,
      buttonText: '   ',
    };
    const html = buildMailHtml({ ...INITIAL_MAIL_DATA, largeBanners: [banner] });

    expect(html).toContain('<img');
    expect(html).not.toContain('&rsaquo;');
  });

  it('遷移先がどこにも無ければボタンを出さない', () => {
    const banner = { ...createLargeBanner('banner-1'), imageUrl: IMAGE_URL, buttonText: '見る' };

    expect(buildMailHtml({ ...INITIAL_MAIL_DATA, largeBanners: [banner] })).not.toContain('見る');
  });

  it('画像もボタンも無ければブロックごと出さない', () => {
    const html = buildMailHtml({
      ...INITIAL_MAIL_DATA,
      largeBanners: [createLargeBanner('banner-1')],
    });

    // 中身が無い = 何も入力していないのと同じなのでプレースホルダに戻る
    expect(html).toContain('左のフォームに入力すると');
  });

  it('画像は本文幅に収める', () => {
    const banner = { ...createLargeBanner('banner-1'), imageUrl: IMAGE_URL };

    expect(buildMailHtml({ ...INITIAL_MAIL_DATA, largeBanners: [banner] })).toContain(
      `max-width:${MAIL_CONTENT_WIDTH}px`,
    );
  });
});

/*
 * 3カラム / 2カラムは同一実装。差は COLUMN_VARIANT_CONFIG だけなので両方を同じテストで回す。
 */
describe.each<ColumnVariant>(['three', 'two'])('カラムボックス（%s）', (variant) => {
  const config = COLUMN_VARIANT_CONFIG[variant];

  it('設定どおりのセル幅で出す', () => {
    const html = buildMailHtml(dataWithColumnItem(variant, { boldText: 'テキスト' }));

    expect(html).toContain(`width:${config.cellWidth}px`);
  });

  it('太字テキストを出す', () => {
    expect(buildMailHtml(dataWithColumnItem(variant, { boldText: '新商品' }))).toContain('新商品');
  });

  it('中身が空のアイテムしか無ければブロックごと出さない', () => {
    const html = buildMailHtml(dataWithColumnItem(variant, {}));

    expect(html).toContain('左のフォームに入力すると');
  });

  it('タイトルだけでもブロックを出す', () => {
    const set = { ...createColumnSet('set-1'), title: '今月のおすすめ' };
    const html = buildMailHtml({ ...INITIAL_MAIL_DATA, [config.stateKey]: [set] });

    expect(html).toContain('今月のおすすめ');
  });

  it('画像とロゴをまとめて1つのリンクにする', () => {
    const html = buildMailHtml(
      dataWithColumnItem(variant, {
        url: LINK_URL,
        imageUrl: IMAGE_URL,
        logoUrl: 'https://example.com/logo.png',
      }),
    );

    expect(html.match(/<a href/g)).toHaveLength(1);
    expect(html.match(/<img/g)).toHaveLength(2);
  });
});

describe('カラムボックスのバリアント差', () => {
  it('2カラムはノーマルテキストを出す', () => {
    const html = buildMailHtml(
      dataWithColumnItem('two', { boldText: '太字', normalText: '説明文' }),
    );

    expect(html).toContain('説明文');
  });

  it('3カラムはノーマルテキストを出さない（入力欄も無いため）', () => {
    const html = buildMailHtml(
      dataWithColumnItem('three', { boldText: '太字', normalText: '説明文' }),
    );

    expect(html).not.toContain('説明文');
  });
});

describe('下部大バナー（07）', () => {
  it('バナーが0件ならタイトルごと出さない', () => {
    const html = buildMailHtml({
      ...INITIAL_MAIL_DATA,
      bottomBannerBlock: { title: 'ピックアップ', titleColor: '#000000', banners: [] },
    });

    expect(html).not.toContain('ピックアップ');
  });

  it('中身の無いバナーだけならタイトルごと出さない', () => {
    const html = buildMailHtml({
      ...INITIAL_MAIL_DATA,
      bottomBannerBlock: {
        title: 'ピックアップ',
        titleColor: '#000000',
        banners: [createLargeBanner('bottom-1')],
      },
    });

    expect(html).not.toContain('ピックアップ');
  });

  it('バナーがあればタイトルと一緒に出す', () => {
    const html = buildMailHtml({
      ...INITIAL_MAIL_DATA,
      bottomBannerBlock: {
        title: 'ピックアップ',
        titleColor: '#000000',
        banners: [{ ...createLargeBanner('bottom-1'), imageUrl: IMAGE_URL }],
      },
    });

    expect(html).toContain('ピックアップ');
    expect(html).toContain(IMAGE_URL);
  });
});

describe('トピックス（08）', () => {
  const button = {
    url: LINK_URL,
    text: 'もっと見る',
    textColor: '#ffffff',
    bgColor: '#000000',
  };

  it('アイテムが0件ならタイトルもボタンも出さない', () => {
    const html = buildMailHtml({
      ...INITIAL_MAIL_DATA,
      topicsBlock: { title: 'トピックス', titleColor: '#000000', items: [], button },
    });

    expect(html).not.toContain('トピックス');
    expect(html).not.toContain('もっと見る');
  });

  it('中身の無いアイテムだけならブロックごと出さない', () => {
    const html = buildMailHtml({
      ...INITIAL_MAIL_DATA,
      topicsBlock: {
        title: 'トピックス',
        titleColor: '#000000',
        items: [createTopicItem('topic-1')],
        button,
      },
    });

    expect(html).not.toContain('トピックス');
  });

  it('画像が無くてもテキストだけで出す', () => {
    const html = buildMailHtml({
      ...INITIAL_MAIL_DATA,
      topicsBlock: {
        title: 'トピックス',
        titleColor: '#000000',
        items: [{ ...createTopicItem('topic-1'), boldText: 'お知らせ' }],
        button,
      },
    });

    expect(html).toContain('お知らせ');
    expect(html).toContain('もっと見る');
  });

  it('2件目以降にだけ区切り罫線を付ける', () => {
    const html = buildMailHtml({
      ...INITIAL_MAIL_DATA,
      topicsBlock: {
        title: '',
        titleColor: '#000000',
        items: [
          { ...createTopicItem('topic-1'), boldText: '1件目' },
          { ...createTopicItem('topic-2'), boldText: '2件目' },
        ],
        button,
      },
    });

    expect(html.match(/border-top:1px solid #e5e7eb;margin-top:16px/g)).toHaveLength(1);
  });
});

describe('インフォメーション（09）', () => {
  it('URLとテキストが揃った行だけ出す', () => {
    const html = buildMailHtml({
      ...INITIAL_MAIL_DATA,
      infoLinks: [
        { ...createInfoLink('link-1'), url: LINK_URL, text: '配信停止' },
        { ...createInfoLink('link-2'), url: LINK_URL, text: '' },
        { ...createInfoLink('link-3'), url: '', text: 'テキストだけ' },
      ],
    });

    expect(html).toContain('配信停止');
    expect(html).not.toContain('テキストだけ');
  });

  it('1行も出せなければブロックごと出さない', () => {
    const html = buildMailHtml({
      ...INITIAL_MAIL_DATA,
      infoLinks: [createInfoLink('link-1')],
    });

    expect(html).toContain('左のフォームに入力すると');
  });
});

describe('配信用とプレビュー用の差', () => {
  const data: MailData = {
    ...INITIAL_MAIL_DATA,
    subject: '8月号',
    stripBanner: { url: LINK_URL, imageUrl: IMAGE_URL },
  };

  it('配信用は body に余白を持ち、スクロールバー用のスタイルを持たない', () => {
    const html = buildMailHtml(data);

    expect(html).toContain('padding:24px 12px;');
    expect(html).not.toContain('scrollbar-width');
  });

  it('プレビュー用は body の余白を落とし、スクロールバーを隠す', () => {
    const html = buildMailHtml(data, { forPreview: true });

    expect(html).not.toContain('padding:24px 12px;');
    expect(html).toContain('scrollbar-width: none;');
  });

  it('body の中身は配信用とプレビュー用で完全に同じ', () => {
    // 「プレビューどおりのHTMLが出力される」ことの担保
    expect(bodyInner(buildMailHtml(data, { forPreview: true }))).toBe(
      bodyInner(buildMailHtml(data)),
    );
  });
});

describe('レイアウトの基準幅', () => {
  it('カードは MAIL_WIDTH、本文は MAIL_CONTENT_WIDTH を基準にする', () => {
    const html = buildMailHtml(dataWithColumnItem('three', { boldText: 'テキスト' }));

    expect(html).toContain(`width:${MAIL_WIDTH}px;max-width:100%`);
    expect(html).toContain(`width:${MAIL_CONTENT_WIDTH}px;max-width:100%`);
  });

  it('レイアウトは table で組む（メールクライアントが head の CSS を落とすため）', () => {
    const html = buildMailHtml(dataWithColumnItem('three', { boldText: 'テキスト' }));

    expect(html).toContain('<table role="presentation"');
    expect(html).not.toContain('display:flex');
    expect(html).not.toContain('display:grid');
  });
});
