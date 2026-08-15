type RestoreNoticeProps = {
  onDiscard: () => void;
};

/**
 * 前回の入力を復元したことを知らせる帯。
 *
 * 黙って復元すると「新しく作り始めたつもりが前回の内容だった」に気づけないため、
 * 復元した直後だけ出して、その場で捨てられるようにする。
 * 復元は直前の操作なので、破棄に確認は挟まない（失うものがまだ無い）。
 */
export function RestoreNotice({ onDiscard }: RestoreNoticeProps) {
  return (
    <div
      role="status"
      className="border-accent-soft bg-accent-soft text-fg-soft mx-6 mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border px-4 py-3 text-[13px] sm:mx-8"
    >
      <p>前回の入力を復元しました</p>
      <button
        type="button"
        onClick={onDiscard}
        className="text-accent focus-visible:outline-accent rounded-md text-[13px] font-medium underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        破棄する
      </button>
    </div>
  );
}
