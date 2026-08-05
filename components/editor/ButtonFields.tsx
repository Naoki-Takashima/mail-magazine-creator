import { ColorField } from '@/components/editor/fields/ColorField';
import { TextField } from '@/components/editor/fields/TextField';
import { UrlField } from '@/components/editor/fields/UrlField';
import {
  DEFAULT_BUTTON_BG_COLOR,
  DEFAULT_BUTTON_TEXT_COLOR,
  type ButtonContent,
  type ColumnButtonErrors,
} from '@/types/mail';

type ButtonFieldsProps = {
  /** 入力欄の id を一意にするための接頭辞 */
  idPrefix: string;
  button: ButtonContent;
  errors?: ColumnButtonErrors;
  onChange: (field: keyof ButtonContent, value: string) => void;
};

/**
 * ボタンの4入力（テキスト / URL / 文字色 / 背景色）。
 * カラムボックスのボタンとトピックスのボタンで共用する。
 */
export function ButtonFields({ idPrefix, button, errors, onChange }: ButtonFieldsProps) {
  return (
    <div className="space-y-5">
      <TextField
        fieldId={`${idPrefix}-text`}
        label="ボタンテキスト"
        value={button.text}
        onChange={(value) => onChange('text', value)}
        placeholder="詳しく見る"
      />
      <UrlField
        fieldId={`${idPrefix}-url`}
        label="ボタンURL"
        value={button.url}
        error={errors?.url}
        onChange={(value) => onChange('url', value)}
        placeholder="https://example.com/list"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <ColorField
          fieldId={`${idPrefix}-text-color`}
          label="文字色"
          value={button.textColor}
          onChange={(value) => onChange('textColor', value)}
          fallbackColor={DEFAULT_BUTTON_TEXT_COLOR}
        />
        <ColorField
          fieldId={`${idPrefix}-bg-color`}
          label="背景色"
          value={button.bgColor}
          onChange={(value) => onChange('bgColor', value)}
          fallbackColor={DEFAULT_BUTTON_BG_COLOR}
        />
      </div>
    </div>
  );
}
