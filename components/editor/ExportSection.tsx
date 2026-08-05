type ExportSectionProps = {
  /** 出力されるファイル名。押す前に見せる。配信日時が未入力なら null */
  fileName: string | null;
  /** 出力できなかった理由。出力を試みてエラーだったときだけ入る */
  blockedReason: string | null;
  onExport: () => void;
};

const REASON_ID = 'export-blocked-reason';

/**
 * 入力の最後に置く HTML 出力ブロック。
 *
 * 入力ブロックとは役割が違うので EditorSection は使わず、独立した節として組む。
 * ボタン自体が用途を名乗っているので見出しは置かない。
 * 唯一の主要アクションなので、他のボタンとは変えてアクセント色で塗る。
 *
 * ボタンは disabled にしない。押せないボタンは理由を返せないため、
 * 「押す → 足りない項目のエラーが出る」という順にしている。
 */
export function ExportSection({ fileName, blockedReason, onExport }: ExportSectionProps) {
  const isBlocked = blockedReason !== null;

  return (
    <section className="border-rule border-t px-6 py-9 sm:px-8">
      <button
        type="button"
        onClick={onExport}
        aria-describedby={isBlocked ? REASON_ID : undefined}
        className="bg-accent focus-visible:outline-accent w-full rounded-lg py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        HTMLを出力
      </button>

      {isBlocked ? (
        // 押した直後に出る文なので、読み上げにも届くよう alert にする
        <p id={REASON_ID} role="alert" className="text-danger mt-2 text-[12px]">
          {blockedReason}
        </p>
      ) : fileName !== null ? (
        // 桁が揃うとファイル名を読み取りやすいので、ここだけ等幅にする
        <p className="text-fg-faint mt-2 font-mono text-[12px]">{fileName}</p>
      ) : null}
    </section>
  );
}
