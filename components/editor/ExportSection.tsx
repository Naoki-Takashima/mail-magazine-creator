type ExportSectionProps = {
  /** 出力されるファイル名。押す前に見せる。出力できない状態なら null */
  fileName: string | null;
  /** disabled の理由。null なら出力できる */
  blockedReason: string | null;
  onExport: () => void;
};

const REASON_ID = 'export-blocked-reason';

/**
 * 入力の最後に置く HTML 出力ブロック。
 *
 * 01〜09 の入力ブロックとは役割が違うので EditorSection（番号 + 必須バッジ）は使わず、
 * 独立した節として組む。ボタンは唯一の主要アクションなので、
 * 「+ 追加」の破線ボタンとは変えて朱の実線にしている。
 */
export function ExportSection({ fileName, blockedReason, onExport }: ExportSectionProps) {
  const isBlocked = blockedReason !== null;

  return (
    <section className="border-rule border-t px-6 py-7 sm:px-8">
      <p className="text-ink-faint font-mono text-[11px] tracking-[0.28em] uppercase">Export</p>
      <h3 className="font-display text-ink mt-2 text-lg">HTML出力</h3>
      <p className="text-ink-soft mt-2 text-[13px] leading-relaxed">
        入力内容を1枚のHTMLファイルとして書き出します。ファイル名は配信日時になります。
      </p>

      <div className="mt-6">
        <button
          type="button"
          onClick={onExport}
          disabled={isBlocked}
          aria-describedby={isBlocked ? REASON_ID : undefined}
          className="bg-vermilion focus-visible:outline-vermilion w-full border border-transparent py-3.5 font-mono text-[11px] tracking-[0.18em] text-white uppercase transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:opacity-30"
        >
          HTMLを出力
        </button>

        {isBlocked ? (
          <p id={REASON_ID} className="text-vermilion mt-2.5 text-[13px] leading-relaxed">
            {blockedReason}
          </p>
        ) : (
          <p className="text-ink-faint mt-2.5 font-mono text-[11px] tracking-[0.1em]">{fileName}</p>
        )}
      </div>
    </section>
  );
}
