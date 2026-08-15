import { clearDraft, loadDraft, saveDraft } from '@/lib/draftStorage';
import { INITIAL_MAIL_DATA, type MailData } from '@/types/mail';

const DRAFT_KEY = 'mail-magazine-creator:draft';

/** 入力済みの下書き。全ブロックを埋める必要はないので、代表的なキーだけ触る */
function createEditedDraft(): MailData {
  return {
    ...INITIAL_MAIL_DATA,
    deliveryDate: '202608051200',
    subject: '【8月号】今月のおすすめ',
    stripBanner: { url: 'https://example.com/lp', imageUrl: 'https://example.com/strip.png' },
    infoLinks: [{ id: 'link-1', text: '配信停止はこちら', url: 'https://example.com/unsubscribe' }],
  };
}

/** 保存済みの中身を直接組み立てる（壊れたデータを作るため） */
function writeRaw(value: unknown): void {
  window.localStorage.setItem(DRAFT_KEY, typeof value === 'string' ? value : JSON.stringify(value));
}

beforeEach(() => {
  window.localStorage.clear();
  jest.restoreAllMocks();
});

describe('保存と読み込み', () => {
  it('保存した内容がそのまま戻る', () => {
    const draft = createEditedDraft();

    saveDraft(draft);

    expect(loadDraft()).toEqual(draft);
  });

  it('版を添えて保存する（形が変わった古い下書きを捨てられるようにするため）', () => {
    saveDraft(createEditedDraft());

    const stored = JSON.parse(window.localStorage.getItem(DRAFT_KEY) as string) as {
      version: number;
    };
    expect(stored.version).toBe(1);
  });

  it('保存が無ければ null', () => {
    expect(loadDraft()).toBeNull();
  });

  it('clearDraft で消える', () => {
    saveDraft(createEditedDraft());

    clearDraft();

    expect(loadDraft()).toBeNull();
    expect(window.localStorage.getItem(DRAFT_KEY)).toBeNull();
  });
});

describe('壊れた下書きは読まない', () => {
  it.each([
    ['JSON として壊れている', '{壊れたJSON'],
    ['版が違う', { version: 999, data: createEditedDraft() }],
    ['data が配列', { version: 1, data: [1, 2, 3] }],
    ['data が null', { version: 1, data: null }],
    ['data が文字列', { version: 1, data: 'draft' }],
    ['キーの型が違う', { version: 1, data: { subject: 123 } }],
    ['配列であるべきキーがオブジェクト', { version: 1, data: { largeBanners: {} } }],
    ['版が無い', { data: createEditedDraft() }],
  ])('%s ときは null を返す', (_label, value) => {
    writeRaw(value);

    expect(loadDraft()).toBeNull();
  });
});

describe('キーが欠けた下書き', () => {
  it('初期値の上に載せて復元する', () => {
    writeRaw({ version: 1, data: { subject: '件名だけ' } });

    const draft = loadDraft();

    expect(draft).not.toBeNull();
    expect(draft?.subject).toBe('件名だけ');
    // 欠けていたキーは初期値のまま
    expect(draft?.largeBanners).toEqual([]);
    expect(draft?.stripBanner).toBeNull();
    expect(draft?.topicsBlock).toEqual(INITIAL_MAIL_DATA.topicsBlock);
  });
});

describe('localStorage が使えない環境', () => {
  it('保存に失敗してもアプリを落とさない（容量超過など）', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => saveDraft(createEditedDraft())).not.toThrow();
  });

  it('読み込みに失敗したら null を返す', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(loadDraft()).toBeNull();
  });

  it('削除に失敗してもアプリを落とさない', () => {
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(() => clearDraft()).not.toThrow();
  });
});
