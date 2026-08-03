/**
 * 配信日は要件どおり 'YYYYMMDDhhmm'（12桁）で保持する。
 * 入力UIは <input type="datetime-local"> なので、この層で相互変換する。
 */

const COMPACT_PATTERN = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})$/;
const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const;

type DateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function parseCompact(value: string): DateTimeParts | null {
  const matched = COMPACT_PATTERN.exec(value);
  if (!matched) return null;

  const [, year, month, day, hour, minute] = matched.map(Number);
  const parts = { year, month, day, hour, minute };

  // 「20260231」のような存在しない日付を弾く。
  // Date は繰り上げてしまうため、組み立て直した値と一致するかで確認する。
  const date = new Date(year, month - 1, day, hour, minute);
  const isReal =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute;

  return isReal ? parts : null;
}

export function isValidCompactDateTime(value: string): boolean {
  return parseCompact(value) !== null;
}

/** '2026-08-03T10:00' → '202608031000'。不正な入力は '' を返す */
export function toCompactDateTime(datetimeLocalValue: string): string {
  const compact = datetimeLocalValue.replace(/[-T:]/g, '').slice(0, 12);
  return isValidCompactDateTime(compact) ? compact : '';
}

/** '202608031000' → '2026-08-03T10:00'。不正な入力は '' を返す（input の value 用） */
export function toDatetimeLocalValue(compact: string): string {
  const matched = COMPACT_PATTERN.exec(compact);
  if (!matched || !isValidCompactDateTime(compact)) return '';

  const [, year, month, day, hour, minute] = matched;
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/** '202608031000' → '2026年8月3日(月) 10:00'。不正な入力は '' を返す */
export function formatDeliveryDate(compact: string): string {
  const parts = parseCompact(compact);
  if (!parts) return '';

  const { year, month, day, hour, minute } = parts;
  const weekday = WEEKDAY_LABELS[new Date(year, month - 1, day).getDay()];
  const paddedHour = String(hour).padStart(2, '0');
  const paddedMinute = String(minute).padStart(2, '0');

  return `${year}年${month}月${day}日(${weekday}) ${paddedHour}:${paddedMinute}`;
}
