import '@testing-library/jest-dom';

/*
 * jsdom には ResizeObserver が無い（useElementSize が使う）。
 * 実寸を測るテストは書かない方針なので、呼ばれても落ちないだけのスタブで足りる。
 */
class ResizeObserverStub implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??= ResizeObserverStub;
