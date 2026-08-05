import { ColorField } from '@/components/editor/fields/ColorField';
import { TextField } from '@/components/editor/fields/TextField';
import { DEFAULT_TEXT_COLOR, type EditableBlockTitleField } from '@/types/mail';

type TitleFieldsProps = {
  /** 入力欄の id を一意にするための接頭辞 */
  idPrefix: string;
  title: string;
  titleColor: string;
  onChange: (field: EditableBlockTitleField, value: string) => void;
  placeholder?: string;
};

/**
 * 「タイトル + タイトル文字色」の組。
 * カラムボックス・下部大バナー・トピックスで同じ入力なので共通化している。
 */
export function TitleFields({
  idPrefix,
  title,
  titleColor,
  onChange,
  placeholder = '今月のおすすめ',
}: TitleFieldsProps) {
  return (
    <div className="space-y-5">
      <TextField
        fieldId={`${idPrefix}-title`}
        label="タイトル"
        value={title}
        onChange={(value) => onChange('title', value)}
        placeholder={placeholder}
      />
      <ColorField
        fieldId={`${idPrefix}-title-color`}
        label="タイトル文字色"
        value={titleColor}
        onChange={(value) => onChange('titleColor', value)}
        fallbackColor={DEFAULT_TEXT_COLOR}
      />
    </div>
  );
}
