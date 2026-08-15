import { mailReducer, type MailAction } from '@/lib/mailReducer';
import {
  COLUMN_VARIANT_CONFIG,
  createColumnButton,
  createColumnItem,
  createColumnSet,
  createInfoLink,
  createLargeBanner,
  createTopicItem,
  INITIAL_MAIL_DATA,
  MAX_BOTTOM_BANNERS,
  MAX_COLUMN_BUTTONS,
  MAX_COLUMN_ITEMS,
  MAX_COLUMN_SETS,
  MAX_INFO_LINKS,
  MAX_LARGE_BANNERS,
  MAX_TOPIC_ITEMS,
  type ColumnVariant,
  type MailData,
} from '@/types/mail';

/** 一連の action を順に流し込む */
function reduceAll(state: MailData, actions: MailAction[]): MailData {
  return actions.reduce(mailReducer, state);
}

describe('下書きの復元とクリア', () => {
  it('restoreDraft は渡した内容をそのまま state にする', () => {
    const draft: MailData = { ...INITIAL_MAIL_DATA, subject: '復元された件名' };

    const state = mailReducer(INITIAL_MAIL_DATA, { type: 'restoreDraft', data: draft });

    expect(state).toBe(draft);
  });

  it('clearAll は初期値と同じ参照を返す', () => {
    const edited = mailReducer(INITIAL_MAIL_DATA, {
      type: 'setField',
      field: 'subject',
      value: '8月号',
    });

    // 参照が一致することに MailEditor の「未編集なら保存しない」判定が依存している
    expect(mailReducer(edited, { type: 'clearAll' })).toBe(INITIAL_MAIL_DATA);
  });
});

describe('setField', () => {
  it('配信日と件名を更新する', () => {
    const state = reduceAll(INITIAL_MAIL_DATA, [
      { type: 'setField', field: 'deliveryDate', value: '202608031000' },
      { type: 'setField', field: 'subject', value: '8月号' },
    ]);

    expect(state.deliveryDate).toBe('202608031000');
    expect(state.subject).toBe('8月号');
  });

  it('元の state を書き換えない', () => {
    const state = mailReducer(INITIAL_MAIL_DATA, {
      type: 'setField',
      field: 'subject',
      value: '8月号',
    });

    expect(state).not.toBe(INITIAL_MAIL_DATA);
    expect(INITIAL_MAIL_DATA.subject).toBe('');
  });
});

describe('帯バナー（最大1件・null で未追加を表す）', () => {
  it('追加すると空のバナーになる', () => {
    const state = mailReducer(INITIAL_MAIL_DATA, { type: 'addStripBanner' });

    expect(state.stripBanner).toEqual({ url: '', imageUrl: '' });
  });

  it('追加済みのときに再度追加しても state ごと据え置く', () => {
    const added = mailReducer(INITIAL_MAIL_DATA, { type: 'addStripBanner' });
    const again = mailReducer(added, { type: 'addStripBanner' });

    expect(again).toBe(added);
  });

  it('削除すると null に戻る', () => {
    const added = mailReducer(INITIAL_MAIL_DATA, { type: 'addStripBanner' });
    const removed = mailReducer(added, { type: 'removeStripBanner' });

    expect(removed.stripBanner).toBeNull();
  });

  it('未追加（null）のときのフィールド更新は何もしない', () => {
    // 追加前に値が入る経路を塞いでいるか
    const state = mailReducer(INITIAL_MAIL_DATA, {
      type: 'setStripBannerField',
      field: 'url',
      value: 'https://example.com',
    });

    expect(state).toBe(INITIAL_MAIL_DATA);
  });

  it('追加後はフィールドを更新できる', () => {
    const state = reduceAll(INITIAL_MAIL_DATA, [
      { type: 'addStripBanner' },
      { type: 'setStripBannerField', field: 'imageUrl', value: 'https://example.com/a.png' },
    ]);

    expect(state.stripBanner).toEqual({ url: '', imageUrl: 'https://example.com/a.png' });
  });
});

describe('大バナー', () => {
  it('id を指定して追加・更新・削除できる', () => {
    const added = reduceAll(INITIAL_MAIL_DATA, [
      { type: 'addLargeBanner', id: 'a' },
      { type: 'addLargeBanner', id: 'b' },
      { type: 'setLargeBannerField', id: 'b', field: 'buttonText', value: '詳しく見る' },
    ]);

    expect(added.largeBanners.map((banner) => banner.id)).toEqual(['a', 'b']);
    expect(added.largeBanners[1].buttonText).toBe('詳しく見る');

    const removed = mailReducer(added, { type: 'removeLargeBanner', id: 'a' });
    expect(removed.largeBanners.map((banner) => banner.id)).toEqual(['b']);
  });

  it('上限を超えて追加しない（配列の参照も変えない）', () => {
    const filled = reduceAll(
      INITIAL_MAIL_DATA,
      Array.from({ length: MAX_LARGE_BANNERS }, (_, index) => ({
        type: 'addLargeBanner' as const,
        id: `banner-${index}`,
      })),
    );
    const overflowed = mailReducer(filled, { type: 'addLargeBanner', id: 'overflow' });

    expect(filled.largeBanners).toHaveLength(MAX_LARGE_BANNERS);
    expect(overflowed.largeBanners).toBe(filled.largeBanners);
  });

  it('存在しない id への操作は配列の中身を変えない', () => {
    const added = mailReducer(INITIAL_MAIL_DATA, { type: 'addLargeBanner', id: 'a' });
    const removed = mailReducer(added, { type: 'removeLargeBanner', id: 'unknown' });
    const updated = mailReducer(added, {
      type: 'setLargeBannerField',
      id: 'unknown',
      field: 'url',
      value: 'https://example.com',
    });

    expect(removed.largeBanners).toEqual(added.largeBanners);
    expect(updated.largeBanners).toEqual(added.largeBanners);
  });
});

/*
 * 3カラム / 2カラムは同一実装で、差は COLUMN_VARIANT_CONFIG だけ。
 * 片方だけ通るテストに意味は無いので、必ず両方を同じテストで回す。
 */
describe.each<ColumnVariant>(['three', 'two'])('カラムボックス（%s）', (variant) => {
  const stateKey = COLUMN_VARIANT_CONFIG[variant].stateKey;
  const withSet = mailReducer(INITIAL_MAIL_DATA, { type: 'addColumnSet', variant, id: 'set-1' });

  it('セットを追加すると対象のバリアントにだけ入る', () => {
    const other = variant === 'three' ? 'twoColumnSets' : 'threeColumnSets';

    expect(withSet[stateKey]).toHaveLength(1);
    expect(withSet[other]).toHaveLength(0);
  });

  it('セットは上限までしか追加できない', () => {
    const overflowed = mailReducer(withSet, { type: 'addColumnSet', variant, id: 'set-2' });

    expect(withSet[stateKey]).toHaveLength(MAX_COLUMN_SETS);
    expect(overflowed[stateKey]).toBe(withSet[stateKey]);
  });

  it('セットのタイトルを更新できる', () => {
    const state = mailReducer(withSet, {
      type: 'setColumnSetField',
      variant,
      setId: 'set-1',
      field: 'title',
      value: '今月のおすすめ',
    });

    expect(state[stateKey][0].title).toBe('今月のおすすめ');
  });

  it('アイテムを追加・更新・削除できる', () => {
    const added = reduceAll(withSet, [
      { type: 'addColumnItem', variant, setId: 'set-1', id: 'item-1' },
      {
        type: 'setColumnItemField',
        variant,
        setId: 'set-1',
        itemId: 'item-1',
        field: 'boldText',
        value: '新商品',
      },
    ]);

    expect(added[stateKey][0].items[0]).toMatchObject({ id: 'item-1', boldText: '新商品' });

    const removed = mailReducer(added, {
      type: 'removeColumnItem',
      variant,
      setId: 'set-1',
      itemId: 'item-1',
    });
    expect(removed[stateKey][0].items).toHaveLength(0);
  });

  it('アイテムは上限までしか追加できない', () => {
    const filled = reduceAll(
      withSet,
      Array.from({ length: MAX_COLUMN_ITEMS }, (_, index) => ({
        type: 'addColumnItem' as const,
        variant,
        setId: 'set-1',
        id: `item-${index}`,
      })),
    );
    const overflowed = mailReducer(filled, {
      type: 'addColumnItem',
      variant,
      setId: 'set-1',
      id: 'overflow',
    });

    expect(filled[stateKey][0].items).toHaveLength(MAX_COLUMN_ITEMS);
    expect(overflowed[stateKey][0].items).toBe(filled[stateKey][0].items);
  });

  it('ボタンを追加・更新・削除でき、上限を超えない', () => {
    const filled = reduceAll(
      withSet,
      Array.from({ length: MAX_COLUMN_BUTTONS }, (_, index) => ({
        type: 'addColumnButton' as const,
        variant,
        setId: 'set-1',
        id: `button-${index}`,
      })),
    );
    const overflowed = mailReducer(filled, {
      type: 'addColumnButton',
      variant,
      setId: 'set-1',
      id: 'overflow',
    });

    expect(filled[stateKey][0].buttons).toHaveLength(MAX_COLUMN_BUTTONS);
    expect(overflowed[stateKey][0].buttons).toBe(filled[stateKey][0].buttons);

    const updated = mailReducer(filled, {
      type: 'setColumnButtonField',
      variant,
      setId: 'set-1',
      buttonId: 'button-0',
      field: 'text',
      value: '一覧を見る',
    });
    expect(updated[stateKey][0].buttons[0].text).toBe('一覧を見る');

    const removed = mailReducer(filled, {
      type: 'removeColumnButton',
      variant,
      setId: 'set-1',
      buttonId: 'button-0',
    });
    expect(removed[stateKey][0].buttons).toHaveLength(MAX_COLUMN_BUTTONS - 1);
  });

  it('存在しないセットへの操作は中身を変えない', () => {
    const state = mailReducer(withSet, {
      type: 'addColumnItem',
      variant,
      setId: 'unknown',
      id: 'item-1',
    });

    expect(state[stateKey]).toEqual(withSet[stateKey]);
  });

  it('セットを削除できる', () => {
    const removed = mailReducer(withSet, { type: 'removeColumnSet', variant, setId: 'set-1' });

    expect(removed[stateKey]).toHaveLength(0);
  });
});

describe('下部大バナー', () => {
  it('ブロックのタイトルを更新する', () => {
    const state = mailReducer(INITIAL_MAIL_DATA, {
      type: 'setBottomBannerBlockField',
      field: 'title',
      value: 'ピックアップ',
    });

    expect(state.bottomBannerBlock.title).toBe('ピックアップ');
  });

  it('バナーを追加・更新・削除でき、上限を超えない', () => {
    const filled = reduceAll(
      INITIAL_MAIL_DATA,
      Array.from({ length: MAX_BOTTOM_BANNERS }, (_, index) => ({
        type: 'addBottomBanner' as const,
        id: `banner-${index}`,
      })),
    );
    const overflowed = mailReducer(filled, { type: 'addBottomBanner', id: 'overflow' });

    expect(filled.bottomBannerBlock.banners).toHaveLength(MAX_BOTTOM_BANNERS);
    expect(overflowed.bottomBannerBlock.banners).toBe(filled.bottomBannerBlock.banners);

    const updated = mailReducer(filled, {
      type: 'setBottomBannerField',
      id: 'banner-0',
      field: 'imageUrl',
      value: 'https://example.com/a.png',
    });
    expect(updated.bottomBannerBlock.banners[0].imageUrl).toBe('https://example.com/a.png');

    const removed = mailReducer(filled, { type: 'removeBottomBanner', id: 'banner-0' });
    expect(removed.bottomBannerBlock.banners).toHaveLength(MAX_BOTTOM_BANNERS - 1);
  });
});

describe('トピックス', () => {
  it('ブロックのタイトルとボタンを更新する', () => {
    const state = reduceAll(INITIAL_MAIL_DATA, [
      { type: 'setTopicsBlockField', field: 'titleColor', value: '#2383e2' },
      { type: 'setTopicsButtonField', field: 'text', value: 'もっと見る' },
    ]);

    expect(state.topicsBlock.titleColor).toBe('#2383e2');
    expect(state.topicsBlock.button.text).toBe('もっと見る');
  });

  it('アイテムを追加・更新・削除でき、上限を超えない', () => {
    const filled = reduceAll(
      INITIAL_MAIL_DATA,
      Array.from({ length: MAX_TOPIC_ITEMS }, (_, index) => ({
        type: 'addTopicItem' as const,
        id: `topic-${index}`,
      })),
    );
    const overflowed = mailReducer(filled, { type: 'addTopicItem', id: 'overflow' });

    expect(filled.topicsBlock.items).toHaveLength(MAX_TOPIC_ITEMS);
    expect(overflowed.topicsBlock.items).toBe(filled.topicsBlock.items);

    const updated = mailReducer(filled, {
      type: 'setTopicItemField',
      id: 'topic-0',
      field: 'boldText',
      value: 'お知らせ',
    });
    expect(updated.topicsBlock.items[0].boldText).toBe('お知らせ');

    const removed = mailReducer(filled, { type: 'removeTopicItem', id: 'topic-0' });
    expect(removed.topicsBlock.items).toHaveLength(MAX_TOPIC_ITEMS - 1);
  });
});

describe('インフォメーション', () => {
  it('リンクを追加・更新・削除でき、上限を超えない', () => {
    const filled = reduceAll(
      INITIAL_MAIL_DATA,
      Array.from({ length: MAX_INFO_LINKS }, (_, index) => ({
        type: 'addInfoLink' as const,
        id: `link-${index}`,
      })),
    );
    const overflowed = mailReducer(filled, { type: 'addInfoLink', id: 'overflow' });

    expect(filled.infoLinks).toHaveLength(MAX_INFO_LINKS);
    expect(overflowed.infoLinks).toBe(filled.infoLinks);

    const updated = mailReducer(filled, {
      type: 'setInfoLinkField',
      id: 'link-0',
      field: 'text',
      value: '配信停止',
    });
    expect(updated.infoLinks[0].text).toBe('配信停止');

    const removed = mailReducer(filled, { type: 'removeInfoLink', id: 'link-0' });
    expect(removed.infoLinks).toHaveLength(MAX_INFO_LINKS - 1);
  });
});

describe('不変性', () => {
  /** 全ブロックに1件ずつ入った state。どの action でもここを壊さないことを見る */
  function createPopulatedState(): MailData {
    return {
      ...INITIAL_MAIL_DATA,
      stripBanner: { url: '', imageUrl: '' },
      largeBanners: [createLargeBanner('banner-1')],
      threeColumnSets: [
        {
          ...createColumnSet('set-1'),
          items: [createColumnItem('item-1')],
          buttons: [createColumnButton('button-1')],
        },
      ],
      twoColumnSets: [createColumnSet('set-2')],
      bottomBannerBlock: {
        ...INITIAL_MAIL_DATA.bottomBannerBlock,
        banners: [createLargeBanner('bottom-1')],
      },
      topicsBlock: { ...INITIAL_MAIL_DATA.topicsBlock, items: [createTopicItem('topic-1')] },
      infoLinks: [createInfoLink('link-1')],
    };
  }

  const actions: MailAction[] = [
    { type: 'setField', field: 'subject', value: 'x' },
    { type: 'removeStripBanner' },
    { type: 'setStripBannerField', field: 'url', value: 'x' },
    { type: 'addLargeBanner', id: 'new' },
    { type: 'removeLargeBanner', id: 'banner-1' },
    { type: 'setLargeBannerField', id: 'banner-1', field: 'url', value: 'x' },
    { type: 'addColumnSet', variant: 'two', id: 'new' },
    { type: 'removeColumnSet', variant: 'three', setId: 'set-1' },
    { type: 'setColumnSetField', variant: 'three', setId: 'set-1', field: 'title', value: 'x' },
    { type: 'addColumnItem', variant: 'three', setId: 'set-1', id: 'new' },
    { type: 'removeColumnItem', variant: 'three', setId: 'set-1', itemId: 'item-1' },
    {
      type: 'setColumnItemField',
      variant: 'three',
      setId: 'set-1',
      itemId: 'item-1',
      field: 'boldText',
      value: 'x',
    },
    { type: 'addColumnButton', variant: 'three', setId: 'set-1', id: 'new' },
    { type: 'removeColumnButton', variant: 'three', setId: 'set-1', buttonId: 'button-1' },
    {
      type: 'setColumnButtonField',
      variant: 'three',
      setId: 'set-1',
      buttonId: 'button-1',
      field: 'text',
      value: 'x',
    },
    { type: 'setBottomBannerBlockField', field: 'title', value: 'x' },
    { type: 'addBottomBanner', id: 'new' },
    { type: 'removeBottomBanner', id: 'bottom-1' },
    { type: 'setBottomBannerField', id: 'bottom-1', field: 'url', value: 'x' },
    { type: 'setTopicsBlockField', field: 'title', value: 'x' },
    { type: 'addTopicItem', id: 'new' },
    { type: 'removeTopicItem', id: 'topic-1' },
    { type: 'setTopicItemField', id: 'topic-1', field: 'boldText', value: 'x' },
    { type: 'setTopicsButtonField', field: 'text', value: 'x' },
    { type: 'addInfoLink', id: 'new' },
    { type: 'removeInfoLink', id: 'link-1' },
    { type: 'setInfoLinkField', id: 'link-1', field: 'text', value: 'x' },
  ];

  it.each(actions.map((action) => [action.type, action] as const))(
    '%s は元の state を書き換えない',
    (_type, action) => {
      const state = createPopulatedState();
      // MailData は文字列と配列・オブジェクトだけなので JSON で深いコピーが取れる
      const snapshot = JSON.parse(JSON.stringify(state)) as MailData;

      mailReducer(state, action);

      expect(state).toEqual(snapshot);
    },
  );
});
