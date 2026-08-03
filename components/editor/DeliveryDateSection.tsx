import { EditorSection } from '@/components/editor/EditorSection';
import { DateTimeField } from '@/components/editor/fields/DateTimeField';

type DeliveryDateSectionProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function DeliveryDateSection({ value, error, onChange }: DeliveryDateSectionProps) {
  return (
    <EditorSection
      index="01"
      title="配信日"
      description="メールを送信する日時です。メール本文には差し込まれず、右のプレビュー上部に表示されます。"
      required
    >
      <DateTimeField
        fieldId="delivery-date"
        label="配信日時"
        description="内部では YYYYMMDDhhmm 形式で保持されます。"
        value={value}
        error={error}
        onChange={onChange}
      />
    </EditorSection>
  );
}
