import { BaseInputField, type FieldProps } from '@/components/editor/fields/BaseInputField';

type TextFieldProps = FieldProps & {
  placeholder?: string;
  maxLength?: number;
};

export function TextField({ placeholder, maxLength, ...fieldProps }: TextFieldProps) {
  return (
    <BaseInputField
      {...fieldProps}
      inputProps={{ type: 'text', placeholder, maxLength, autoComplete: 'off' }}
    />
  );
}
