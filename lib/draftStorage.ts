import { INITIAL_MAIL_DATA, type MailData } from '@/types/mail';

const DRAFT_KEY = 'mail-magazine-creator:draft';

/**
 * 保存形式の版。
 * MailData の形を変えたら必ず上げる。上げ忘れると、キーが欠けた古い下書きが
 * そのまま復元されて画面が壊れる。
 */
const DRAFT_VERSION = 1;

type StoredDraft = {
  version: number;
  data: MailData;
};

/**
 * localStorage を取り出す。SSR（window が無い）と、
 * 設定で無効化されている場合の例外を吸収する。
 */
function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * トップレベルのキーの型だけを見る簡易チェック。
 * 中身まで検証しないのは、形が変わったときは DRAFT_VERSION で丸ごと捨てる方針のため。
 */
function looksLikeMailData(value: unknown): value is Partial<MailData> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

  const draft = value as Partial<MailData>;
  const isStringOrMissing = (v: unknown) => v === undefined || typeof v === 'string';
  const isArrayOrMissing = (v: unknown) => v === undefined || Array.isArray(v);

  return (
    isStringOrMissing(draft.deliveryDate) &&
    isStringOrMissing(draft.subject) &&
    isArrayOrMissing(draft.largeBanners) &&
    isArrayOrMissing(draft.threeColumnSets) &&
    isArrayOrMissing(draft.twoColumnSets) &&
    isArrayOrMissing(draft.infoLinks)
  );
}

/** 保存済みの下書き。無い・壊れている・版が違うときは null（呼び出し側は初期値のまま進む） */
export function loadDraft(): MailData | null {
  const storage = getStorage();
  if (storage === null) return null;

  try {
    const raw = storage.getItem(DRAFT_KEY);
    if (raw === null) return null;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;

    const { version, data } = parsed as Partial<StoredDraft>;
    if (version !== DRAFT_VERSION) return null;
    if (!looksLikeMailData(data)) return null;

    // 版が同じでもキーが欠けている可能性はあるので、初期値の上に載せる
    return { ...INITIAL_MAIL_DATA, ...data };
  } catch {
    return null;
  }
}

/** 保存できなくてもアプリは動き続けるべきなので、失敗は握りつぶす（容量超過など） */
export function saveDraft(data: MailData): void {
  const storage = getStorage();
  if (storage === null) return;

  try {
    const draft: StoredDraft = { version: DRAFT_VERSION, data };
    storage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // 保存できなくても入力・プレビュー・HTML出力は続けられる
  }
}

export function clearDraft(): void {
  const storage = getStorage();
  if (storage === null) return;

  try {
    storage.removeItem(DRAFT_KEY);
  } catch {
    // 消せなくても画面上の入力は空になっている
  }
}
