import {
  describeBlockedReason,
  hasValidationErrors,
  isSafeHttpUrl,
  isValidEmail,
  omitRequiredErrors,
  toSafeHttpUrl,
  validateMailData,
} from '@/lib/validation';
import {
  createColumnItem,
  createColumnSet,
  createLargeBanner,
  createTopicItem,
  INITIAL_MAIL_DATA,
  type MailData,
} from '@/types/mail';

const URL_ERROR = 'http:// または https:// で始まるURLを入力してください';

/** 必須項目だけ埋めた「エラーが1件も無い」状態を土台にする */
const VALID_BASE: MailData = {
  ...INITIAL_MAIL_DATA,
  deliveryDate: '202608031000',
  subject: '8月号のお知らせ',
};

describe('isSafeHttpUrl', () => {
  it.each(['https://example.com', 'http://example.com/path?a=1', '  https://example.com  '])(
    '%s を許可する',
    (value) => {
      expect(isSafeHttpUrl(value)).toBe(true);
    },
  );

  it.each([
    ['空文字', ''],
    ['空白のみ', '   '],
    ['スクリプト', 'javascript:alert(1)'],
    ['データURL', 'data:text/html,<script>alert(1)</script>'],
    ['ファイル', 'file:///etc/passwd'],
    ['相対パス', '/images/banner.png'],
    ['スキームなし', 'example.com'],
  ])('%s を弾く', (_label, value) => {
    expect(isSafeHttpUrl(value)).toBe(false);
  });
});

describe('toSafeHttpUrl', () => {
  it('安全なURLは前後の空白を落として返す', () => {
    expect(toSafeHttpUrl(' https://example.com ')).toBe('https://example.com');
  });

  it('安全でないURLは null を返す', () => {
    expect(toSafeHttpUrl('javascript:alert(1)')).toBeNull();
  });
});

describe('validateMailData', () => {
  it('必須項目が未入力ならエラーを返す', () => {
    const errors = validateMailData(INITIAL_MAIL_DATA);

    expect(errors.deliveryDate).toBe('配信日を入力してください');
    expect(errors.subject).toBe('件名を入力してください');
  });

  it('配信日が実在しない日時ならエラーを返す', () => {
    const errors = validateMailData({ ...VALID_BASE, deliveryDate: '202602301000' });

    expect(errors.deliveryDate).toBe('有効な日時を入力してください');
  });

  it('件名が空白だけならエラーを返す', () => {
    const errors = validateMailData({ ...VALID_BASE, subject: '   ' });

    expect(errors.subject).toBe('件名を入力してください');
  });

  it('必須が埋まっていればエラーは1件も無い', () => {
    expect(validateMailData(VALID_BASE)).toEqual({});
  });

  it('エラーが無いキーはオブジェクトに現れない', () => {
    // hasValidationErrors がトップレベルのキー数だけを見られる根拠
    const errors = validateMailData(VALID_BASE);

    expect(Object.keys(errors)).toHaveLength(0);
    expect('stripBanner' in errors).toBe(false);
  });

  it('任意項目は空欄ならエラーにしない', () => {
    const data: MailData = { ...VALID_BASE, stripBanner: { url: '', imageUrl: '' } };

    expect(validateMailData(data)).toEqual({});
  });

  it('帯バナーの不正なURLをフィールドごとに返す', () => {
    const data: MailData = {
      ...VALID_BASE,
      stripBanner: { url: 'javascript:alert(1)', imageUrl: 'https://example.com/a.png' },
    };

    expect(validateMailData(data).stripBanner).toEqual({ url: URL_ERROR });
  });

  it('帯バナーが未追加（null）なら検証対象にしない', () => {
    expect(validateMailData({ ...VALID_BASE, stripBanner: null }).stripBanner).toBeUndefined();
  });

  it('大バナーのエラーを id をキーにして返す', () => {
    const banner = { ...createLargeBanner('banner-1'), buttonUrl: 'not-a-url' };
    const data: MailData = { ...VALID_BASE, largeBanners: [createLargeBanner('banner-0'), banner] };

    expect(validateMailData(data).largeBanners).toEqual({
      'banner-1': { buttonUrl: URL_ERROR },
    });
  });

  it('カラムセットのエラーをセットid → アイテムid の入れ子で返す', () => {
    const item = { ...createColumnItem('item-1'), logoUrl: 'not-a-url' };
    const set = { ...createColumnSet('set-1'), items: [createColumnItem('item-0'), item] };
    const data: MailData = { ...VALID_BASE, threeColumnSets: [set] };

    expect(validateMailData(data).threeColumnSets).toEqual({
      'set-1': { items: { 'item-1': { logoUrl: URL_ERROR } } },
    });
  });

  it('3カラムと2カラムを別のキーで返す', () => {
    const set = {
      ...createColumnSet('set-1'),
      items: [{ ...createColumnItem('item-0'), url: 'not-a-url' }],
    };
    const data: MailData = { ...VALID_BASE, twoColumnSets: [set] };
    const errors = validateMailData(data);

    expect(errors.twoColumnSets).toBeDefined();
    expect(errors.threeColumnSets).toBeUndefined();
  });

  it('トピックスのアイテムとボタンを別のキーで返す', () => {
    const data: MailData = {
      ...VALID_BASE,
      topicsBlock: {
        ...VALID_BASE.topicsBlock,
        items: [{ ...createTopicItem('topic-0'), imageUrl: 'not-a-url' }],
        button: { ...VALID_BASE.topicsBlock.button, url: 'javascript:alert(1)' },
      },
    };
    const errors = validateMailData(data);

    expect(errors.topicItems).toEqual({ 'topic-0': { imageUrl: URL_ERROR } });
    expect(errors.topicsButton).toEqual({ url: URL_ERROR });
  });
});

describe('hasValidationErrors', () => {
  it('エラーが空なら false', () => {
    expect(hasValidationErrors({})).toBe(false);
  });

  it('必須エラーだけでも true', () => {
    expect(hasValidationErrors({ subject: '件名を入力してください' })).toBe(true);
  });

  it('入れ子のエラーでも true', () => {
    expect(hasValidationErrors({ stripBanner: { url: URL_ERROR } })).toBe(true);
  });
});

describe('omitRequiredErrors', () => {
  it('配信日と件名のエラーだけを伏せる', () => {
    const errors = {
      deliveryDate: '配信日を入力してください',
      subject: '件名を入力してください',
      stripBanner: { url: URL_ERROR },
    };

    expect(omitRequiredErrors(errors)).toEqual({ stripBanner: { url: URL_ERROR } });
  });

  it('元のオブジェクトを書き換えない', () => {
    const errors = { deliveryDate: '配信日を入力してください' };
    omitRequiredErrors(errors);

    expect(errors.deliveryDate).toBe('配信日を入力してください');
  });
});

describe('isValidEmail', () => {
  it.each(['test@example.com', 'user.name+tag@example.co.jp', '  test@example.com  ', 'a@b.c'])(
    '%s を許可する',
    (value) => {
      expect(isValidEmail(value)).toBe(true);
    },
  );

  it.each([
    ['空文字', ''],
    ['空白のみ', '   '],
    ['@ が無い', 'test.example.com'],
    ['@ が2つ', 'test@@example.com'],
    ['ドメインにドットが無い', 'test@example'],
    ['ローカル部が無い', '@example.com'],
    ['途中に空白', 'te st@example.com'],
  ])('%s は弾く', (_label, value) => {
    expect(isValidEmail(value)).toBe(false);
  });
});

describe('describeBlockedReason', () => {
  it('エラーが無ければ null', () => {
    expect(describeBlockedReason({})).toBeNull();
  });

  it('必須が欠けていればその理由を返す', () => {
    expect(describeBlockedReason({ subject: '件名を入力してください' })).toBe(
      '配信日と件名を入力してください',
    );
  });

  it('必須の欠けをURLエラーより先に出す', () => {
    const errors = {
      deliveryDate: '配信日を入力してください',
      stripBanner: { url: URL_ERROR },
    };

    expect(describeBlockedReason(errors)).toBe('配信日と件名を入力してください');
  });

  it('必須が揃っていればURLのエラーを返す', () => {
    expect(describeBlockedReason({ stripBanner: { url: URL_ERROR } })).toBe(
      'URLのエラーを直してください',
    );
  });
});
