const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * ユーザー入力を HTML に埋め込む前に必ず通す。
 * プレビューは iframe の srcDoc に文字列としてHTMLを流し込むため、
 * エスケープを省くと入力欄がそのままXSSの経路になる。
 */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
}

/** 改行を <br /> に変換する。入力は事前に escapeHtml 済みであること */
export function nl2br(escaped: string): string {
  return escaped.replace(/\r\n|\r|\n/g, '<br />');
}
