import { isValidEmail } from '@/lib/validation';

/** テスト配信1通ぶんの中身。クライアントと Route Handler で共有する */
export type TestDeliveryRequest = {
  /** 宛先。1件だけ */
  to: string;
  subject: string;
  /** 配信用HTML（forPreview なし） */
  html: string;
};

/** 送信の結果。失敗の理由はそのまま画面に出せる日本語にしておく */
export type TestDeliveryResult = { ok: true } | { ok: false; message: string };

/**
 * 受け付けるHTMLの上限。
 * Gmail は 102KB を超えた本文を切り詰めるので、実用上はこれで十分に余裕がある。
 * 画像はすべてURL参照で埋め込まないため、通常の入力がここに届くことはない。
 */
export const MAX_HTML_BYTES = 1024 * 1024;

export const NOT_CONFIGURED_MESSAGE = '送信の設定が完了していません。管理者に連絡してください';
export const SEND_FAILED_MESSAGE = '送信に失敗しました。しばらくしてから再度お試しください';
export const NETWORK_FAILED_MESSAGE = '通信に失敗しました。接続を確認してください';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * 素の JSON を TestDeliveryRequest に変換する。不正なら理由の文字列を返す。
 *
 * エンドポイントは誰でも直接叩けるので、画面側の検証を通ったことは前提にしない。
 * 戻り値を union にしているのは、呼び出し側が例外処理を書かずに
 * 「文字列なら 400 で返す」だけで済ませられるようにするため。
 */
export function parseTestDeliveryRequest(input: unknown): TestDeliveryRequest | string {
  if (!isRecord(input)) return 'リクエストの形式が不正です';

  const { to, subject, html } = input;
  if (typeof to !== 'string' || typeof subject !== 'string' || typeof html !== 'string') {
    return 'リクエストの形式が不正です';
  }

  if (!isValidEmail(to)) return 'メールアドレスの形式で入力してください';
  if (subject.trim() === '') return '件名を入力してください';
  if (html === '') return '送信する内容がありません';

  // 文字数ではなくバイト数で見る。日本語は1文字3バイトになるため
  if (new TextEncoder().encode(html).length > MAX_HTML_BYTES) {
    return '内容が大きすぎるため送信できません';
  }

  return { to: to.trim(), subject, html };
}
