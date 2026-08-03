type AppHeaderProps = {
  isPreviewOpen: boolean;
  /** 開閉対象パネルの id（aria-controls 用） */
  previewPanelId: string;
  onTogglePreview: () => void;
};

export function AppHeader({ isPreviewOpen, previewPanelId, onTogglePreview }: AppHeaderProps) {
  return (
    <header className="border-rule bg-paper/85 sticky top-0 z-10 border-b backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-ink text-lg tracking-wide">Mailmag</span>
          <span
            aria-hidden
            className="bg-vermilion hidden h-3 w-px shrink-0 self-center sm:block"
          />
          <span className="text-ink-faint hidden font-mono text-[11px] tracking-[0.24em] uppercase sm:block">
            Proof Sheet
          </span>
        </div>

        <button
          type="button"
          onClick={onTogglePreview}
          aria-expanded={isPreviewOpen}
          aria-controls={previewPanelId}
          className="border-rule text-ink hover:border-vermilion hover:text-vermilion focus-visible:outline-vermilion group inline-flex items-center gap-2.5 border px-3.5 py-2 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span
            aria-hidden
            className={`size-2 border transition-colors ${
              isPreviewOpen ? 'border-vermilion bg-vermilion' : 'border-ink-faint bg-transparent'
            }`}
          />
          {isPreviewOpen ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>
    </header>
  );
}
