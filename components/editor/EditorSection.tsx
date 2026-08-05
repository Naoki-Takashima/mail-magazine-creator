import type { ReactNode } from 'react';

type EditorSectionProps = {
  title: string;
  required?: boolean;
  /** 「最大3件」などの補助表示。見出し右端に置く */
  meta?: ReactNode;
  children: ReactNode;
};

/**
 * 入力エリアをブロック単位で区切る枠。
 * 見出しと必須マークをここに集約し、各セクションは中身のフィールドだけを組み立てればよい。
 *
 * ブロックは枠で囲わない。9つ並ぶと枠が主張しすぎるため、
 * 面はすべて白のまま、余白と 1px の区切り線だけで境界を示す。
 */
export function EditorSection({ title, required = false, meta, children }: EditorSectionProps) {
  return (
    <section className="border-rule border-t px-6 py-9 sm:px-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-fg text-[15px] font-semibold">
          {title}
          {required ? (
            <span aria-label="必須" className="text-danger ml-1 align-super text-[12px]">
              ※
            </span>
          ) : null}
        </h3>
        {meta ? <span className="text-fg-faint ml-auto text-[12px]">{meta}</span> : null}
      </div>

      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
