import type { ReactNode } from 'react';

type EditorSectionProps = {
  /** 校正刷り風の通し番号（"01" など） */
  index: string;
  title: string;
  description: string;
  required?: boolean;
  /** 「最大3件」などの補助表示。見出し右端に置く */
  meta?: ReactNode;
  children: ReactNode;
};

/**
 * 入力エリアをブロック単位で区切る枠。
 * ブロック番号・見出し・必須バッジをここに集約し、
 * 各セクションは中身のフィールドだけを組み立てればよいようにする。
 */
export function EditorSection({
  index,
  title,
  description,
  required = false,
  meta,
  children,
}: EditorSectionProps) {
  return (
    <section className="border-rule border-t px-6 py-7 sm:px-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span aria-hidden className="text-ink-faint font-mono text-[11px] tracking-[0.2em]">
          {index}
        </span>
        <h3 className="font-display text-ink text-lg">{title}</h3>
        {required ? (
          <span className="border-vermilion text-vermilion border px-1.5 py-px font-mono text-[10px] tracking-[0.16em] uppercase">
            Required
          </span>
        ) : (
          <span className="border-rule text-ink-faint border px-1.5 py-px font-mono text-[10px] tracking-[0.16em] uppercase">
            Optional
          </span>
        )}
        {meta ? <span className="ml-auto">{meta}</span> : null}
      </div>

      <p className="text-ink-soft mt-2 text-[13px] leading-relaxed">{description}</p>

      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}
