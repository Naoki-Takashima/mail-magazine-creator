'use client';

import { useLayoutEffect, useRef, useState } from 'react';

export type ElementSize = { width: number; height: number };

/** 計測前（SSR / 初回描画）の値。呼び出し側でフォールバックを選べるよう 0 にしている */
const UNMEASURED: ElementSize = { width: 0, height: 0 };

/**
 * 要素の実寸を購読する。
 *
 * スマホ枠は「使える高さから逆算して縦横比を保った大きさ」を決める必要があり、
 * CSS だけでは長さ同士の比（= 縮小率という無次元の数）を作れないため、実寸を測る。
 *
 * paint 前に反映したいので useEffect ではなく useLayoutEffect を使う。
 */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ElementSize>(UNMEASURED);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    // 同じ値での再レンダリングを避ける（リサイズ中は毎フレーム発火する）
    const apply = (width: number, height: number) => {
      setSize((previous) =>
        previous.width === width && previous.height === height ? previous : { width, height },
      );
    };

    // ResizeObserver の初回コールバックは paint のあとに来るため、
    // これが無いと hydration 後にもう1フレームだけ未計測の大きさで描かれてしまう。
    // ここで同期的に測っておけば、最初の paint から正しい寸法になる。
    // getBoundingClientRect は border-box なので、border / padding を持つ要素には使わないこと
    const rect = element.getBoundingClientRect();
    apply(rect.width, rect.height);

    const observer = new ResizeObserver((entries) => {
      const contentRect = entries[0]?.contentRect;
      if (!contentRect) return;
      apply(contentRect.width, contentRect.height);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}
