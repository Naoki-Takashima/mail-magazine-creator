import type { MailData, ValidationErrors } from '@/types/mail';

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

/**
 * 空欄はエラーにしない（未入力＝そのブロックを出さないだけ）。
 * 「入力されているが不正」のときだけエラーを返す。
 */
export function validateMailData(data: MailData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (data.url.trim() !== '' && !isSafeHttpUrl(data.url)) {
    errors.url = URL_ERROR_MESSAGE;
  }

  if (data.imageUrl.trim() !== '' && !isSafeHttpUrl(data.imageUrl)) {
    errors.imageUrl = URL_ERROR_MESSAGE;
  }

  return errors;
}
