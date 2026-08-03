import { describedBy, FormField, fieldClassName } from '@/components/editor/FormField';

const FIELD_ID = 'mail-text';

type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TextInput({ value, onChange }: TextInputProps) {
  return (
    <FormField
      index="03"
      label="Text"
      fieldId={FIELD_ID}
      description="本文です。改行はそのまま反映されます（装飾記法は未対応）。"
    >
      <textarea
        id={FIELD_ID}
        rows={7}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={'いつもご利用ありがとうございます。\n今月のおすすめをお届けします。'}
        aria-describedby={describedBy(FIELD_ID, false)}
        className={`${fieldClassName} resize-y leading-relaxed`}
      />
    </FormField>
  );
}
