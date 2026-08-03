import type { ReactNode } from 'react';

type FormFieldProps = {
  label: string;
  /** input の id。label と aria-describedby の結線に使う */
  fieldId: string;
  error?: string;
  children: ReactNode;
};

/**
 * ラベル・エラーの見た目と a11y 結線を1か所に集約する。
 * 入力欄そのものは children として受け取り、input の種類の差は吸収しない。
 */
export function FormField({ label, fieldId, error, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={fieldId} className="text-fg-soft mb-1.5 block text-[12px] font-medium">
        {label}
      </label>

      {children}

      {error ? (
        <p id={errorId(fieldId)} role="alert" className="text-danger mt-1.5 text-[12px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * 入力欄に共通で当てるクラス。
 * 箱型の枠線に統一し、フォーカスするとアクセント色の枠 + 淡いリングが光る。
 * 不正な値のときは aria-invalid をそのまま見た目に反映させる。
 */
export const fieldClassName =
  'w-full rounded-lg border border-rule bg-canvas px-3 py-2 text-[14px] text-fg ' +
  'placeholder:text-fg-faint outline-none transition-[border-color,box-shadow] ' +
  'focus:border-accent focus:ring-2 focus:ring-accent-soft ' +
  'aria-invalid:border-danger aria-invalid:focus:ring-danger/15';

export function errorId(fieldId: string): string {
  return `${fieldId}-error`;
}

/** aria-describedby に渡す id。エラーが出ているときだけ結ぶ */
export function describedBy(fieldId: string, hasError: boolean): string | undefined {
  return hasError ? errorId(fieldId) : undefined;
}
