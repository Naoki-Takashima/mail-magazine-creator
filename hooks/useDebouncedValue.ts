'use client';

import { useEffect, useState } from 'react';

/**
 * 入力欄そのものは即時反映のまま、プレビュー（iframe の再読み込みを伴う）だけを遅らせる。
 * lodash.debounce を入れるほどの処理ではないので自前で持つ。
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timerId = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timerId);
  }, [value, delayMs]);

  return debouncedValue;
}
