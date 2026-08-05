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
 * 入力ブロックとは役割が違うので EditorSection（必須マーク付きの見出し）は使わず、
 * 独立した節として組む。唯一の主要アクションなので、
 * 他のボタンとは変えてアクセント色で塗る。
 */
export function ExportSection({ fileName, blockedReason, onExport }: ExportSectionProps) {
  const isBlocked = blockedReason !== null;

  return (
    <section className="border-rule border-t px-6 py-9 sm:px-8">
      <h3 className="text-fg text-[15px] font-semibold">HTML出力</h3>

      <div className="mt-5">
        <button
          type="button"
          onClick={onExport}
          disabled={isBlocked}
          aria-describedby={isBlocked ? REASON_ID : undefined}
          className="bg-accent focus-visible:outline-accent w-full rounded-lg py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:opacity-30"
        >
          HTMLを出力
        </button>

        {isBlocked ? (
          <p id={REASON_ID} className="text-danger mt-2 text-[12px]">
            {blockedReason}
          </p>
        ) : (
          // 桁が揃うとファイル名を読み取りやすいので、ここだけ等幅にする
          <p className="text-fg-faint mt-2 font-mono text-[12px]">{fileName}</p>
        )}
      </div>
    </section>
  );
}
