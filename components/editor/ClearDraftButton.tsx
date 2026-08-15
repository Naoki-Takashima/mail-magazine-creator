'use client';

import { useState } from 'react';

type ClearDraftButtonProps = {
  onClear: () => void;
};

/**
 * 入力を全部消すボタン。
 *
 * 取り返しがつかない操作なので確認を挟むが、window.confirm は使わない。
 * ブラウザのモーダルはページの操作を止めてしまううえ、見た目もテーマから浮く。
 * 代わりに、押した場所がそのまま確認の並びに変わるインライン2段階にしている。
 */
export function ClearDraftButton({ onClear }: ClearDraftButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const buttonClassName =
    'focus-visible:outline-accent rounded-md text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2';

  if (isConfirming) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-fg-soft text-[13px]">入力をすべて消しますか？</p>
        <button
          type="button"
          onClick={() => {
            setIsConfirming(false);
            onClear();
          }}
          className={`text-danger font-medium hover:underline ${buttonClassName}`}
        >
          消す
        </button>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          className={`text-fg-faint hover:text-fg-soft ${buttonClassName}`}
        >
          やめる
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      className={`text-fg-faint hover:text-danger ${buttonClassName}`}
    >
      入力をすべてクリア
    </button>
  );
}
