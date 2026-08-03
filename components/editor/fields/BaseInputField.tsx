import type { InputHTMLAttributes } from 'react';

import { describedBy, fieldClassName, FormField } from '@/components/editor/FormField';

export type FieldProps = {
  fieldId: string;
  label: string;
  description?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

type BaseInputFieldProps = FieldProps & {
  /** input に渡す属性。type / placeholder / inputMode などの差分をここで吸収する */
  inputProps: Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'value' | 'onChange'>;
};

/**
 * FormField と input の結線をまとめた内部コンポーネント。
 * 個々のフィールド（TextField / UrlField / …）はこれに属性を渡すだけにする。
 */
export function BaseInputField({
  fieldId,
  label,
  description,
  value,
  error,
  onChange,
  inputProps,
}: BaseInputFieldProps) {
  return (
    <FormField label={label} fieldId={fieldId} description={description} error={error}>
      <input
        {...inputProps}
        id={fieldId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error !== undefined}
        aria-describedby={describedBy(fieldId, {
          hasDescription: description !== undefined,
          hasError: error !== undefined,
        })}
        className={fieldClassName}
      />
    </FormField>
  );
}
