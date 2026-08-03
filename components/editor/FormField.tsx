import type { ReactNode } from 'react';

type FormFieldProps = {
  label: string;
  /** input の id。label と aria-describedby の結線に使う */
  fieldId: string;
  /** 補足文。不要なフィールドでは省略できる */
  description?: string;
  error?: string;
  children: ReactNode;
};

/**
 * ラベル・補足・エラーの見た目と a11y 結線を1か所に集約する。
 * 入力欄そのものは children として受け取り、input の種類の差は吸収しない。
 */
export function FormField({ label, fieldId, description, error, children }: FormFieldProps) {
  return (
    <div className="group">
      <label
        htmlFor={fieldId}
        className="text-ink font-mono text-[11px] tracking-[0.22em] uppercase"
      >
        {label}
      </label>

      {description ? (
        <p
          id={descriptionId(fieldId)}
          className="text-ink-soft mt-1 mb-2.5 text-[13px] leading-relaxed"
        >
          {description}
        </p>
      ) : (
        <div className="h-2.5" />
      )}

      {children}

      {error ? (
        <p
          id={errorId(fieldId)}
          role="alert"
          className="text-vermilion mt-2 text-[13px] leading-relaxed"
        >
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

export function descriptionId(fieldId: string): string {
  return `${fieldId}-description`;
}

export function errorId(fieldId: string): string {
  return `${fieldId}-error`;
}

/**
 * aria-describedby に渡す id 列を組み立てる。
 * 存在しない要素を指さないよう、実際に描画されるものだけを並べる。
 */
export function describedBy(
  fieldId: string,
  options: { hasDescription: boolean; hasError: boolean },
): string | undefined {
  const ids = [
    options.hasDescription ? descriptionId(fieldId) : null,
    options.hasError ? errorId(fieldId) : null,
  ].filter((id): id is string => id !== null);

  return ids.length > 0 ? ids.join(' ') : undefined;
}
