import { EditorSection } from '@/components/editor/EditorSection';
import { TextField } from '@/components/editor/fields/TextField';

type SubjectSectionProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function SubjectSection({ value, error, onChange }: SubjectSectionProps) {
  return (
    <EditorSection
      index="02"
      title="件名"
      description="受信トレイに並ぶ件名です。メール本文には差し込まれず、右のプレビュー上部に表示されます。"
      required
    >
      <TextField
        fieldId="subject"
        label="件名"
        value={value}
        error={error}
        onChange={onChange}
        placeholder="【8月号】今月のおすすめ"
      />
    </EditorSection>
  );
}
