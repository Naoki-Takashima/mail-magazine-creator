import type { ReactNode } from 'react';

type FormFieldProps = {
  /** 校正刷り風の通し番号（"01" など） */
  index: string;
  label: string;
  /** input / textarea の id。label と aria-describedby の結線に使う */
  fieldId: string;
  description: string;
  error?: string;
  children: ReactNode;
};

/**
 * ラベル・補足・エラーの見た目と a11y 結線を1か所に集約する。
 * 入力欄そのものは children として受け取り、input / textarea の差を吸収しない。
 */
export function FormField({ index, label, fieldId, description, error, children }: FormFieldProps) {
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;

  return (
    <div className="group border-rule border-t px-6 py-7 sm:px-8">
      <div className="flex items-baseline gap-3">
        <span
          aria-hidden
          className="text-ink-faint group-focus-within:text-vermilion font-mono text-[11px] tracking-[0.2em] transition-colors"
        >
          {index}
        </span>
        <label
          htmlFor={fieldId}
          className="text-ink font-mono text-[11px] tracking-[0.22em] uppercase"
        >
          {label}
        </label>
      </div>

      <p id={descriptionId} className="text-ink-soft mt-1.5 mb-3 text-[13px] leading-relaxed">
        {description}
      </p>

      {children}

      {error ? (
        <p id={errorId} role="alert" className="text-vermilion mt-2 text-[13px] leading-relaxed">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * 入力欄に共通で当てるクラス。
 * 下線だけの罫線表現に統一し、フォーカス時に朱色へ変わる。
 */
export const fieldClassName =
  'w-full border-0 border-b border-rule bg-transparent pb-2 text-[15px] text-ink ' +
  'placeholder:text-ink-faint/70 outline-none transition-colors ' +
  'focus:border-vermilion focus:ring-0';

/** aria-describedby に渡す id 列を組み立てる */
export function describedBy(fieldId: string, hasError: boolean): string {
  return hasError ? `${fieldId}-description ${fieldId}-error` : `${fieldId}-description`;
}
