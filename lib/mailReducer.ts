import {
  createLargeBanner,
  MAX_LARGE_BANNERS,
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
    };

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
  }
}
