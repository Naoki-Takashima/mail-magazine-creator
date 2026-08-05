import { isValidCompactDateTime } from '@/lib/deliveryDate';
import type {
  BannerErrors,
  ButtonContent,
  ColumnButtonErrors,
  ColumnItemErrors,
  ColumnSet,
  ColumnSetErrors,
  InfoLinkErrors,
  LargeBanner,
  MailData,
  StripBanner,
  TopicItem,
  TopicItemErrors,
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
function omitIfEmpty<T extends object>(errors: T): T | undefined {
  return Object.keys(errors).length > 0 ? errors : undefined;
}

/** id をキーにしたエラーの辞書を組み立てる。1件もなければ undefined */
function collectById<T extends { id: string }, E extends object>(
  items: T[],
  validate: (item: T) => E | undefined,
): Record<string, E> | undefined {
  const result: Record<string, E> = {};

  for (const item of items) {
    const errors = validate(item);
    if (errors) result[item.id] = errors;
  }

  return omitIfEmpty(result);
}

function validateStripBanner(banner: StripBanner | null): BannerErrors | undefined {
  if (banner === null) return undefined;

  const errors: BannerErrors = {};

  const urlError = urlErrorOf(banner.url);
  if (urlError) errors.url = urlError;

  const imageUrlError = urlErrorOf(banner.imageUrl);
  if (imageUrlError) errors.imageUrl = imageUrlError;

  return omitIfEmpty(errors);
}

function validateLargeBanner(banner: LargeBanner): BannerErrors | undefined {
  const errors: BannerErrors = {};

  const urlError = urlErrorOf(banner.url);
  if (urlError) errors.url = urlError;

  const imageUrlError = urlErrorOf(banner.imageUrl);
  if (imageUrlError) errors.imageUrl = imageUrlError;

  const buttonUrlError = urlErrorOf(banner.buttonUrl);
  if (buttonUrlError) errors.buttonUrl = buttonUrlError;

  return omitIfEmpty(errors);
}

/**
 * カラムセット群の検証。3カラム / 2カラムで構造が同じなので共用する。
 * 文字数はフォーム側の maxLength でハード制限しているため、ここでは見ない。
 */
function validateColumnSets(sets: ColumnSet[]): Record<string, ColumnSetErrors> | undefined {
  return collectById(sets, (set) => {
    const setErrors: ColumnSetErrors = {};

    const itemErrors = collectById(set.items, (item) => {
      const errors: ColumnItemErrors = {};

      const urlError = urlErrorOf(item.url);
      if (urlError) errors.url = urlError;

      const imageUrlError = urlErrorOf(item.imageUrl);
      if (imageUrlError) errors.imageUrl = imageUrlError;

      const logoUrlError = urlErrorOf(item.logoUrl);
      if (logoUrlError) errors.logoUrl = logoUrlError;

      return omitIfEmpty(errors);
    });
    if (itemErrors) setErrors.items = itemErrors;

    const buttonErrors = collectById(set.buttons, (button) => {
      const errors: ColumnButtonErrors = {};

      const urlError = urlErrorOf(button.url);
      if (urlError) errors.url = urlError;

      return omitIfEmpty(errors);
    });
    if (buttonErrors) setErrors.buttons = buttonErrors;

    return omitIfEmpty(setErrors);
  });
}

function validateTopicItem(item: TopicItem): TopicItemErrors | undefined {
  const errors: TopicItemErrors = {};

  const urlError = urlErrorOf(item.url);
  if (urlError) errors.url = urlError;

  const imageUrlError = urlErrorOf(item.imageUrl);
  if (imageUrlError) errors.imageUrl = imageUrlError;

  return omitIfEmpty(errors);
}

function validateButtonContent(button: ButtonContent): ColumnButtonErrors | undefined {
  const errors: ColumnButtonErrors = {};

  const urlError = urlErrorOf(button.url);
  if (urlError) errors.url = urlError;

  return omitIfEmpty(errors);
}

function validateInfoLink(link: { url: string }): InfoLinkErrors | undefined {
  const errors: InfoLinkErrors = {};

  const urlError = urlErrorOf(link.url);
  if (urlError) errors.url = urlError;

  return omitIfEmpty(errors);
}

/**
 * エラーが1件でもあれば true。
 * validateMailData は中身が空のキーを省いて返すので、トップレベルの鍵の数だけ見れば足りる。
 */
export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * 必須項目（配信日・件名）の未入力エラーだけを伏せた写しを返す。
 *
 * 何も入力していない初期表示でいきなり赤字が並ぶのを避けるためのもの。
 * URLエラーは「入力した結果」なので伏せない。
 */
export function omitRequiredErrors(errors: ValidationErrors): ValidationErrors {
  const visible = { ...errors };
  delete visible.deliveryDate;
  delete visible.subject;
  return visible;
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

  const largeBannerErrors = collectById(data.largeBanners, validateLargeBanner);
  if (largeBannerErrors) {
    errors.largeBanners = largeBannerErrors;
  }

  const threeColumnErrors = validateColumnSets(data.threeColumnSets);
  if (threeColumnErrors) {
    errors.threeColumnSets = threeColumnErrors;
  }

  const twoColumnErrors = validateColumnSets(data.twoColumnSets);
  if (twoColumnErrors) {
    errors.twoColumnSets = twoColumnErrors;
  }

  const bottomBannerErrors = collectById(data.bottomBannerBlock.banners, validateLargeBanner);
  if (bottomBannerErrors) {
    errors.bottomBanners = bottomBannerErrors;
  }

  const topicItemErrors = collectById(data.topicsBlock.items, validateTopicItem);
  if (topicItemErrors) {
    errors.topicItems = topicItemErrors;
  }

  const topicsButtonErrors = validateButtonContent(data.topicsBlock.button);
  if (topicsButtonErrors) {
    errors.topicsButton = topicsButtonErrors;
  }

  const infoLinkErrors = collectById(data.infoLinks, validateInfoLink);
  if (infoLinkErrors) {
    errors.infoLinks = infoLinkErrors;
  }

  return errors;
}
