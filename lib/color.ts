const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHexColor(value: string): boolean {
  return HEX_COLOR_PATTERN.test(value.trim());
}

/**
 * style 属性に色を差し込む前に必ず通す。
 *
 * escapeHtml だけでは `red;background:url(...)` のような値が
 * 別の宣言として解釈されてしまうため、'#rgb' / '#rrggbb' 以外は
 * すべて fallback に倒す。
 */
export function toSafeHexColor(value: string, fallback: string): string {
  return isHexColor(value) ? value.trim().toLowerCase() : fallback;
}

/**
 * <input type="color"> は '#rrggbb'（6桁）しか受け付けないため、
 * '#fff' のような3桁表記を展開し、不正な値は fallback に倒す。
 */
export function toColorPickerValue(value: string, fallback: string): string {
  const safe = toSafeHexColor(value, fallback);
  if (safe.length !== 4) return safe;

  const [, r, g, b] = safe;
  return `#${r}${r}${g}${g}${b}${b}`;
}
