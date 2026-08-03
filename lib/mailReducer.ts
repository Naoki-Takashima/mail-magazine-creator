import {
  COLUMN_VARIANT_CONFIG,
  createColumnButton,
  createColumnItem,
  createColumnSet,
  createLargeBanner,
  MAX_COLUMN_BUTTONS,
  MAX_COLUMN_ITEMS,
  MAX_COLUMN_SETS,
  MAX_LARGE_BANNERS,
  type ColumnSet,
  type ColumnVariant,
  type EditableColumnButtonField,
  type EditableColumnItemField,
  type EditableColumnSetField,
  type EditableLargeBannerField,
  type MailData,
  type SimpleMailField,
  type StripBanner,
} from '@/types/mail';

export type MailAction =
  | { type: 'setField'; field: SimpleMailField; value: string }
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
    };

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

    case 'setStripBannerField':
      return {
        ...state,
        stripBanner: { ...state.stripBanner, [action.field]: action.value },
      };

    case 'addLargeBanner':
      // UI側でもボタンを disabled にしているが、上限は state 側でも守る
      if (state.largeBanners.length >= MAX_LARGE_BANNERS) return state;
      return {
        ...state,
        largeBanners: [...state.largeBanners, createLargeBanner(action.id)],
      };

    case 'removeLargeBanner':
      return {
        ...state,
        largeBanners: state.largeBanners.filter((banner) => banner.id !== action.id),
      };

    case 'setLargeBannerField':
      return {
        ...state,
        largeBanners: state.largeBanners.map((banner) =>
          banner.id === action.id ? { ...banner, [action.field]: action.value } : banner,
        ),
      };

    case 'addColumnSet': {
      const sets = state[COLUMN_VARIANT_CONFIG[action.variant].stateKey];
      if (sets.length >= MAX_COLUMN_SETS) return state;
      return replaceSets(state, action.variant, [...sets, createColumnSet(action.id)]);
    }

    case 'removeColumnSet': {
      const sets = state[COLUMN_VARIANT_CONFIG[action.variant].stateKey];
      return replaceSets(
        state,
        action.variant,
        sets.filter((set) => set.id !== action.setId),
      );
    }

    case 'setColumnSetField':
      return updateSet(state, action.variant, action.setId, (set) => ({
        ...set,
        [action.field]: action.value,
      }));

    case 'addColumnItem':
      return updateSet(state, action.variant, action.setId, (set) =>
        set.items.length >= MAX_COLUMN_ITEMS
          ? set
          : { ...set, items: [...set.items, createColumnItem(action.id)] },
      );

    case 'removeColumnItem':
      return updateSet(state, action.variant, action.setId, (set) => ({
        ...set,
        items: set.items.filter((item) => item.id !== action.itemId),
      }));

    case 'setColumnItemField':
      return updateSet(state, action.variant, action.setId, (set) => ({
        ...set,
        items: set.items.map((item) =>
          item.id === action.itemId ? { ...item, [action.field]: action.value } : item,
        ),
      }));

    case 'addColumnButton':
      return updateSet(state, action.variant, action.setId, (set) =>
        set.buttons.length >= MAX_COLUMN_BUTTONS
          ? set
          : { ...set, buttons: [...set.buttons, createColumnButton(action.id)] },
      );

    case 'removeColumnButton':
      return updateSet(state, action.variant, action.setId, (set) => ({
        ...set,
        buttons: set.buttons.filter((button) => button.id !== action.buttonId),
      }));

    case 'setColumnButtonField':
      return updateSet(state, action.variant, action.setId, (set) => ({
        ...set,
        buttons: set.buttons.map((button) =>
          button.id === action.buttonId ? { ...button, [action.field]: action.value } : button,
        ),
      }));
  }
}
