import { describedBy, FormField, fieldClassName } from '@/components/editor/FormField';

const FIELD_ID = 'mail-url';

type UrlInputProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function UrlInput({ value, error, onChange }: UrlInputProps) {
  return (
    <FormField
      index="01"
      label="URL"
      fieldId={FIELD_ID}
      description="メール本文の末尾にリンクとして差し込まれます。"
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
        placeholder="https://example.com/campaign"
        aria-invalid={error !== undefined}
        aria-describedby={describedBy(FIELD_ID, error !== undefined)}
        className={fieldClassName}
      />
    </FormField>
  );
}
