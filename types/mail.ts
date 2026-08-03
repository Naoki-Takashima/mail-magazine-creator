/**
 * メルマガ1通ぶんのコンテンツ。
 * 入力途中の不正値もそのまま保持するため、すべて string で持つ。
 * （検証は lib/validation.ts、表示可否の判断はプレビュー側で行う）
 */
export type MailData = {
  url: string;
  imageUrl: string;
  text: string;
};

/** MailData のフィールド名。updateField(field, value) を型安全に1本化するために使う */
export type MailField = keyof MailData;

/** フィールド単位の検証エラー。キーが無い = そのフィールドはエラー無し */
export type ValidationErrors = Partial<Record<MailField, string>>;

export const INITIAL_MAIL_DATA: MailData = {
  url: '',
  imageUrl: '',
  text: '',
};
