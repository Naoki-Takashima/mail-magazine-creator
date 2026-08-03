import { describedBy, FormField, fieldClassName } from '@/components/editor/FormField';

const FIELD_ID = 'mail-image-url';

type ImageInputProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function ImageInput({ value, error, onChange }: ImageInputProps) {
  return (
    <FormField
      index="02"
      label="Image URL"
      fieldId={FIELD_ID}
      description="メール冒頭のメインビジュアルです。公開済みの画像URLを指定してください。"
      error={error}
    >
      <input
        id={FIELD_ID}
        type="url"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://example.com/hero.png"
        aria-invalid={error !== undefined}
        aria-describedby={describedBy(FIELD_ID, error !== undefined)}
        className={fieldClassName}
      />
    </FormField>
  );
}
