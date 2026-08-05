import {
  COLUMN_VARIANT_CONFIG,
  createColumnButton,
  createColumnItem,
  createColumnSet,
  createInfoLink,
  createLargeBanner,
  createStripBanner,
  createTopicItem,
  MAX_BOTTOM_BANNERS,
  MAX_COLUMN_BUTTONS,
  MAX_COLUMN_ITEMS,
  MAX_COLUMN_SETS,
  MAX_INFO_LINKS,
  MAX_LARGE_BANNERS,
  MAX_TOPIC_ITEMS,
  type ButtonContent,
  type ColumnSet,
  type ColumnVariant,
  type EditableBlockTitleField,
  type EditableColumnButtonField,
  type EditableColumnItemField,
  type EditableColumnSetField,
  type EditableInfoLinkField,
  type EditableLargeBannerField,
  type EditableTopicItemField,
  type MailData,
  type SimpleMailField,
  type StripBanner,
} from '@/types/mail';

export type MailAction =
  | { type: 'setField'; field: SimpleMailField; value: string }
  | { type: 'addStripBanner' }
  | { type: 'removeStripBanner' }
  | { type: 'setStripBannerField'; field: keyof StripBanner; value: string }
  | { type: 'addLargeBanner'; id: string }
  | { type: 'removeLargeBanner'; id: string }
  | {
      type: 'setLargeBannerField';
      id: string;
      field: EditableLargeBannerField;
      value: string;
    }
  // 以下はカラムボックス（3カラム / 2カラム）。variant で対象の配列を切り替える
  | { type: 'addColumnSet'; variant: ColumnVariant; id: string }
  | { type: 'removeColumnSet'; variant: ColumnVariant; setId: string }
  | {
      type: 'setColumnSetField';
      variant: ColumnVariant;
      setId: string;
      field: EditableColumnSetField;
      value: string;
    }
  | { type: 'addColumnItem'; variant: ColumnVariant; setId: string; id: string }
  | { type: 'removeColumnItem'; variant: ColumnVariant; setId: string; itemId: string }
  | {
      type: 'setColumnItemField';
      variant: ColumnVariant;
      setId: string;
      itemId: string;
      field: EditableColumnItemField;
      value: string;
    }
  | { type: 'addColumnButton'; variant: ColumnVariant; setId: string; id: string }
  | { type: 'removeColumnButton'; variant: ColumnVariant; setId: string; buttonId: string }
  | {
      type: 'setColumnButtonField';
      variant: ColumnVariant;
      setId: string;
      buttonId: string;
      field: EditableColumnButtonField;
      value: string;
    }
  // 下部大バナー
  | { type: 'setBottomBannerBlockField'; field: EditableBlockTitleField; value: string }
  | { type: 'addBottomBanner'; id: string }
  | { type: 'removeBottomBanner'; id: string }
  | {
      type: 'setBottomBannerField';
      id: string;
      field: EditableLargeBannerField;
      value: string;
    }
  // トピックスエリア
  | { type: 'setTopicsBlockField'; field: EditableBlockTitleField; value: string }
  | { type: 'addTopicItem'; id: string }
  | { type: 'removeTopicItem'; id: string }
  | { type: 'setTopicItemField'; id: string; field: EditableTopicItemField; value: string }
  | { type: 'setTopicsButtonField'; field: keyof ButtonContent; value: string }
  // インフォメーション（フッター）
  | { type: 'addInfoLink'; id: string }
  | { type: 'removeInfoLink'; id: string }
  | { type: 'setInfoLinkField'; id: string; field: EditableInfoLinkField; value: string };

/** 上限に達していれば元の配列をそのまま返す（UIの disabled と二重で守る） */
function addToList<T>(list: T[], max: number, item: T): T[] {
  return list.length >= max ? list : [...list, item];
}

function removeFromList<T extends { id: string }>(list: T[], id: string): T[] {
  return list.filter((entry) => entry.id !== id);
}

/** id が一致する要素だけ、指定フィールドを差し替える */
function updateInList<T extends { id: string }>(
  list: T[],
  id: string,
  field: Exclude<keyof T, 'id'>,
  value: string,
): T[] {
  return list.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry));
}

/** 対象バリアントのセット配列だけを差し替える */
function replaceSets(state: MailData, variant: ColumnVariant, sets: ColumnSet[]): MailData {
  return { ...state, [COLUMN_VARIANT_CONFIG[variant].stateKey]: sets };
}

/**
 * 1セットだけを updater の結果で置き換える。
 * カラム系9アクションの入れ子更新をここに集約している。
 */
function updateSet(
  state: MailData,
  variant: ColumnVariant,
  setId: string,
  updater: (set: ColumnSet) => ColumnSet,
): MailData {
  const sets = state[COLUMN_VARIANT_CONFIG[variant].stateKey];
  return replaceSets(
    state,
    variant,
    sets.map((set) => (set.id === setId ? updater(set) : set)),
  );
}

/**
 * 入力状態の更新をまとめた純関数。
 * ネストと可変長配列が入ったため、useState の入れ子更新ではなく useReducer で扱う。
 *
 * id の採番は呼び出し側（crypto.randomUUID）に任せ、この関数は副作用を持たない。
 */
export function mailReducer(state: MailData, action: MailAction): MailData {
  switch (action.type) {
    case 'setField':
      return { ...state, [action.field]: action.value };

    // 帯バナーは1件しか持てないので、配列ではなく null / オブジェクトで在り無しを表す
    case 'addStripBanner':
      return state.stripBanner === null ? { ...state, stripBanner: createStripBanner() } : state;

    case 'removeStripBanner':
      return { ...state, stripBanner: null };

    case 'setStripBannerField':
      // 入力欄は追加後しか出ないので、null のときは何もしない
      if (state.stripBanner === null) return state;
      return {
        ...state,
        stripBanner: { ...state.stripBanner, [action.field]: action.value },
      };

    case 'addLargeBanner':
      return {
        ...state,
        largeBanners: addToList(
          state.largeBanners,
          MAX_LARGE_BANNERS,
          createLargeBanner(action.id),
        ),
      };

    case 'removeLargeBanner':
      return { ...state, largeBanners: removeFromList(state.largeBanners, action.id) };

    case 'setLargeBannerField':
      return {
        ...state,
        largeBanners: updateInList(state.largeBanners, action.id, action.field, action.value),
      };

    case 'addColumnSet': {
      const sets = state[COLUMN_VARIANT_CONFIG[action.variant].stateKey];
      return replaceSets(
        state,
        action.variant,
        addToList(sets, MAX_COLUMN_SETS, createColumnSet(action.id)),
      );
    }

    case 'removeColumnSet': {
      const sets = state[COLUMN_VARIANT_CONFIG[action.variant].stateKey];
      return replaceSets(state, action.variant, removeFromList(sets, action.setId));
    }

    case 'setColumnSetField':
      return updateSet(state, action.variant, action.setId, (set) => ({
        ...set,
        [action.field]: action.value,
      }));

    case 'addColumnItem':
      return updateSet(state, action.variant, action.setId, (set) => ({
        ...set,
        items: addToList(set.items, MAX_COLUMN_ITEMS, createColumnItem(action.id)),
      }));

    case 'removeColumnItem':
      return updateSet(state, action.variant, action.setId, (set) => ({
        ...set,
        items: removeFromList(set.items, action.itemId),
      }));

    case 'setColumnItemField':
      return updateSet(state, action.variant, action.setId, (set) => ({
        ...set,
        items: updateInList(set.items, action.itemId, action.field, action.value),
      }));

    case 'addColumnButton':
      return updateSet(state, action.variant, action.setId, (set) => ({
        ...set,
        buttons: addToList(set.buttons, MAX_COLUMN_BUTTONS, createColumnButton(action.id)),
      }));

    case 'removeColumnButton':
      return updateSet(state, action.variant, action.setId, (set) => ({
        ...set,
        buttons: removeFromList(set.buttons, action.buttonId),
      }));

    case 'setColumnButtonField':
      return updateSet(state, action.variant, action.setId, (set) => ({
        ...set,
        buttons: updateInList(set.buttons, action.buttonId, action.field, action.value),
      }));

    case 'setBottomBannerBlockField':
      return {
        ...state,
        bottomBannerBlock: { ...state.bottomBannerBlock, [action.field]: action.value },
      };

    case 'addBottomBanner':
      return {
        ...state,
        bottomBannerBlock: {
          ...state.bottomBannerBlock,
          banners: addToList(
            state.bottomBannerBlock.banners,
            MAX_BOTTOM_BANNERS,
            createLargeBanner(action.id),
          ),
        },
      };

    case 'removeBottomBanner':
      return {
        ...state,
        bottomBannerBlock: {
          ...state.bottomBannerBlock,
          banners: removeFromList(state.bottomBannerBlock.banners, action.id),
        },
      };

    case 'setBottomBannerField':
      return {
        ...state,
        bottomBannerBlock: {
          ...state.bottomBannerBlock,
          banners: updateInList(
            state.bottomBannerBlock.banners,
            action.id,
            action.field,
            action.value,
          ),
        },
      };

    case 'setTopicsBlockField':
      return { ...state, topicsBlock: { ...state.topicsBlock, [action.field]: action.value } };

    case 'addTopicItem':
      return {
        ...state,
        topicsBlock: {
          ...state.topicsBlock,
          items: addToList(state.topicsBlock.items, MAX_TOPIC_ITEMS, createTopicItem(action.id)),
        },
      };

    case 'removeTopicItem':
      return {
        ...state,
        topicsBlock: {
          ...state.topicsBlock,
          items: removeFromList(state.topicsBlock.items, action.id),
        },
      };

    case 'setTopicItemField':
      return {
        ...state,
        topicsBlock: {
          ...state.topicsBlock,
          items: updateInList(state.topicsBlock.items, action.id, action.field, action.value),
        },
      };

    case 'setTopicsButtonField':
      return {
        ...state,
        topicsBlock: {
          ...state.topicsBlock,
          button: { ...state.topicsBlock.button, [action.field]: action.value },
        },
      };

    case 'addInfoLink':
      return {
        ...state,
        infoLinks: addToList(state.infoLinks, MAX_INFO_LINKS, createInfoLink(action.id)),
      };

    case 'removeInfoLink':
      return { ...state, infoLinks: removeFromList(state.infoLinks, action.id) };

    case 'setInfoLinkField':
      return {
        ...state,
        infoLinks: updateInList(state.infoLinks, action.id, action.field, action.value),
      };
  }
}
