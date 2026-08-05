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
      className="border-rule text-fg-soft hover:border-accent hover:bg-accent-soft hover:text-accent focus-visible:outline-accent disabled:hover:border-rule disabled:hover:text-fg-soft w-full rounded-lg border py-2.5 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {disabled ? fullLabel : label}
    </button>
  );
}
