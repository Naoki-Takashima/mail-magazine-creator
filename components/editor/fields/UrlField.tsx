import { BaseInputField, type FieldProps } from '@/components/editor/fields/BaseInputField';

type UrlFieldProps = FieldProps & {
  placeholder?: string;
};

export function UrlField({ placeholder, ...fieldProps }: UrlFieldProps) {
  return (
    <BaseInputField
      {...fieldProps}
      inputProps={{
        type: 'url',
        inputMode: 'url',
        placeholder,
        autoComplete: 'off',
        spellCheck: false,
      }}
    />
  );
}
