import { EditorSection } from '@/components/editor/EditorSection';
import { DateTimeField } from '@/components/editor/fields/DateTimeField';

type DeliveryDateSectionProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function DeliveryDateSection({ value, error, onChange }: DeliveryDateSectionProps) {
  return (
    <EditorSection title="配信日" required>
      <DateTimeField
        fieldId="delivery-date"
        label="配信日時"
        value={value}
        error={error}
        onChange={onChange}
      />
    </EditorSection>
  );
}
