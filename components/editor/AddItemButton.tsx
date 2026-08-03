type AddItemButtonProps = {
  label: string;
  /** 上限に達したときに表示する文言 */
  fullLabel: string;
  disabled: boolean;
  onClick: () => void;
};

/**
 * 「+ 追加」の破線ボタン。
 * 大バナー・カラムセット・カラムアイテム・ボタンで見た目を揃えるため共通化している。
 */
export function AddItemButton({ label, fullLabel, disabled, onClick }: AddItemButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="border-rule text-ink hover:border-vermilion hover:text-vermilion focus-visible:outline-vermilion disabled:hover:border-rule disabled:hover:text-ink w-full border border-dashed py-3 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {disabled ? fullLabel : label}
    </button>
  );
}
