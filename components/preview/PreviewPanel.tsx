import { MailFrame } from '@/components/preview/MailFrame';
import { PreviewMeta } from '@/components/preview/PreviewMeta';

type PreviewPanelProps = {
  html: string;
  /** 'YYYYMMDDhhmm'。メール本文には含めず、メタ欄に表示する */
  deliveryDate: string;
  subject: string;
  /** 開閉トグルの aria-controls と対応させる id */
  panelId: string;
};

/**
 * プレビューの「額縁」。メール本文の描画は MailFrame に委譲する。
 * 用紙を沈めた色 + 方眼テクスチャの上に白いメール本体を置き、
 * 校正台にメールを1枚載せたような見え方にしている。
 */
export function PreviewPanel({ html, deliveryDate, subject, panelId }: PreviewPanelProps) {
  return (
    <section
      id={panelId}
      aria-labelledby="preview-heading"
      className="bg-paper-sunk texture-grid border-rule relative flex min-w-0 flex-col border-t lg:border-t-0 lg:border-l"
    >
      {/* 縦組みのラベル。パネルの左端に沿わせて版面のアクセントにする */}
      <span
        aria-hidden
        className="text-ink-faint pointer-events-none absolute top-8 left-3 hidden font-mono text-[10px] tracking-[0.4em] uppercase [writing-mode:vertical-rl] lg:block"
      >
        Live Preview
      </span>

      <header className="px-6 pt-8 pb-6 sm:px-10 lg:pl-14">
        <p className="text-ink-faint font-mono text-[11px] tracking-[0.28em] uppercase">Render</p>
        <h2 id="preview-heading" className="font-display text-ink mt-2 text-2xl">
          プレビュー
        </h2>
      </header>

      <div className="px-4 pb-5 sm:px-10 lg:pl-14">
        <PreviewMeta deliveryDate={deliveryDate} subject={subject} />
      </div>

      <div className="flex-1 px-4 pb-8 sm:px-10 lg:pl-14">
        <div className="border-rule h-full overflow-hidden border shadow-[0_18px_40px_-28px_rgba(23,21,15,0.55)]">
          <MailFrame html={html} />
        </div>
      </div>
    </section>
  );
}
