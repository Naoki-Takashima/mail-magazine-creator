import { TextEncoder } from 'node:util';

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

/*
 * jsdom は <dialog> の showModal / close を実装していない（TestDeliveryDialog が使う）。
 * トップレイヤーやフォーカスの閉じ込めはテストで見ないので、
 * open 属性と close イベントだけ本物に合わせたスタブで足りる。
 */
HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
  this.open = true;
};

HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
  this.open = false;
  this.dispatchEvent(new Event('close'));
};

/*
 * jsdom は TextEncoder を持たない（parseTestDeliveryRequest がバイト数を測るのに使う）。
 * 本番はサーバー（Node）で動くので、ここでも Node のものをそのまま借りる。
 */
globalThis.TextEncoder ??= TextEncoder;
