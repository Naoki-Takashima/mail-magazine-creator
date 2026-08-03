import { isValidCompactDateTime } from '@/lib/deliveryDate';
import type {
  BannerErrors,
  LargeBanner,
  MailData,
  StripBanner,
  ValidationErrors,
} from '@/types/mail';

const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * http / https のURLだけを許可する。
 * javascript: や data: を弾くことで、プレビュー内のリンク・画像srcが
 * スクリプト実行の経路になるのを防ぐ。
 */
export function isSafeHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === '') return false;

  try {
    const parsed = new URL(trimmed);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/** 安全なURLならトリム済み文字列を、そうでなければ null を返す */
export function toSafeHttpUrl(value: string): string | null {
  return isSafeHttpUrl(value) ? value.trim() : null;
}

const URL_ERROR_MESSAGE = 'http:// または https:// で始まるURLを入力してください';

/** 入力があり、かつ不正なURLのときだけメッセージを返す（空欄はエラーにしない） */
function urlErrorOf(value: string): string | undefined {
  if (value.trim() === '') return undefined;
  return isSafeHttpUrl(value) ? undefined : URL_ERROR_MESSAGE;
}

/** エラーが1つも無ければ undefined を返す（呼び出し側でキーごと省くため） */
function toBannerErrors(errors: BannerErrors): BannerErrors | undefined {
  return Object.keys(errors).length > 0 ? errors : undefined;
}

function validateStripBanner(banner: StripBanner): BannerErrors | undefined {
  const errors: BannerErrors = {};

  const urlError = urlErrorOf(banner.url);
  if (urlError) errors.url = urlError;

  const imageUrlError = urlErrorOf(banner.imageUrl);
  if (imageUrlError) errors.imageUrl = imageUrlError;

  return toBannerErrors(errors);
}

function validateLargeBanner(banner: LargeBanner): BannerErrors | undefined {
  const errors: BannerErrors = {};

  const urlError = urlErrorOf(banner.url);
  if (urlError) errors.url = urlError;

  const imageUrlError = urlErrorOf(banner.imageUrl);
  if (imageUrlError) errors.imageUrl = imageUrlError;

  const buttonUrlError = urlErrorOf(banner.buttonUrl);
  if (buttonUrlError) errors.buttonUrl = buttonUrlError;

  return toBannerErrors(errors);
}

/**
 * 必須項目（配信日・件名）は未入力自体をエラーにする。
 * バナー系は任意入力なので「入力されているが不正」のときだけエラーを返す。
 */
export function validateMailData(data: MailData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (data.deliveryDate === '') {
    errors.deliveryDate = '配信日を入力してください';
  } else if (!isValidCompactDateTime(data.deliveryDate)) {
    errors.deliveryDate = '有効な日時を入力してください';
  }

  if (data.subject.trim() === '') {
    errors.subject = '件名を入力してください';
  }

  const stripBannerErrors = validateStripBanner(data.stripBanner);
  if (stripBannerErrors) {
    errors.stripBanner = stripBannerErrors;
  }

  const largeBannerErrors: Record<string, BannerErrors> = {};
  for (const banner of data.largeBanners) {
    const bannerErrors = validateLargeBanner(banner);
    if (bannerErrors) {
      largeBannerErrors[banner.id] = bannerErrors;
    }
  }
  if (Object.keys(largeBannerErrors).length > 0) {
    errors.largeBanners = largeBannerErrors;
  }

  return errors;
}
