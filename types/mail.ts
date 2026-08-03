/** バナー共通の「画像 + 遷移先」 */
export type BannerLink = {
  url: string;
  imageUrl: string;
};

/** 帯バナー。最大1件なのでオブジェクト1つで持つ */
export type StripBanner = BannerLink;

export type LargeBanner = BannerLink & {
  /** React の key と更新対象の特定に使う */
  id: string;
  /** 空ならバナー本体の url をボタンにも流用する */
  buttonUrl: string;
  buttonText: string;
  /** '#rrggbb' 形式。既定は DEFAULT_BUTTON_TEXT_COLOR */
  buttonTextColor: string;
  /** '#rrggbb' 形式。既定は DEFAULT_BUTTON_BG_COLOR */
  buttonBgColor: string;
};

/**
 * メルマガ1通ぶんのコンテンツ。
 * 入力途中の不正値もそのまま保持するため、値はすべて string で持つ。
 * （検証は lib/validation.ts、表示可否の判断は lib/buildMailHtml.ts で行う）
 */
export type MailData = {
  /** 'YYYYMMDDhhmm'。必須。メール本文には出さない */
  deliveryDate: string;
  /** 必須。メール本文には出さない */
  subject: string;
  stripBanner: StripBanner;
  /** 最大 MAX_LARGE_BANNERS 件 */
  largeBanners: LargeBanner[];
};

export const MAX_LARGE_BANNERS = 3;
export const DEFAULT_BUTTON_TEXT_COLOR = '#ffffff';
export const DEFAULT_BUTTON_BG_COLOR = '#000000';

/** 単独で更新できる MailData のトップレベル項目 */
export type SimpleMailField = 'deliveryDate' | 'subject';

/** LargeBanner のうちユーザーが編集できる項目（id を除く） */
export type EditableLargeBannerField = Exclude<keyof LargeBanner, 'id'>;

/** バナー1件ぶんの検証エラー。キーが無い = そのフィールドはエラー無し */
export type BannerErrors = {
  url?: string;
  imageUrl?: string;
  buttonUrl?: string;
};

export type ValidationErrors = {
  deliveryDate?: string;
  subject?: string;
  stripBanner?: BannerErrors;
  /** バナーの id をキーにしたエラー */
  largeBanners?: Record<string, BannerErrors>;
};

export const INITIAL_MAIL_DATA: MailData = {
  deliveryDate: '',
  subject: '',
  stripBanner: { url: '', imageUrl: '' },
  largeBanners: [],
};

export function createLargeBanner(id: string): LargeBanner {
  return {
    id,
    url: '',
    imageUrl: '',
    buttonUrl: '',
    buttonText: '',
    buttonTextColor: DEFAULT_BUTTON_TEXT_COLOR,
    buttonBgColor: DEFAULT_BUTTON_BG_COLOR,
  };
}
