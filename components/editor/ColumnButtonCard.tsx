import { ColorField } from '@/components/editor/fields/ColorField';
import { TextField } from '@/components/editor/fields/TextField';
import { UrlField } from '@/components/editor/fields/UrlField';
import {
  DEFAULT_BUTTON_BG_COLOR,
  DEFAULT_BUTTON_TEXT_COLOR,
  type ColumnButton,
  type ColumnButtonErrors,
  type EditableColumnButtonField,
} from '@/types/mail';

type ColumnButtonCardProps = {
  button: ColumnButton;
  /** 入力欄の id を一意にするための接頭辞 */
  idPrefix: string;
  /** 表示用の連番（0始まり） */
  position: number;
  errors?: ColumnButtonErrors;
  onFieldChange: (buttonId: string, field: EditableColumnButtonField, value: string) => void;
  onRemove: (buttonId: string) => void;
};

/** セット末尾に縦積みされるボタン1件ぶんの入力 */
export function ColumnButtonCard({
  button,
  idPrefix,
  position,
  errors,
  onFieldChange,
  onRemove,
}: ColumnButtonCardProps) {
  const idFor = (suffix: string) => `${idPrefix}-${suffix}`;
  const change = (field: EditableColumnButtonField) => (value: string) =>
    onFieldChange(button.id, field, value);

  return (
    <div className="bg-paper border-rule border p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-ink-faint font-mono text-[10px] tracking-[0.24em] uppercase">
          Button {String(position + 1).padStart(2, '0')}
        </span>
        <button
          type="button"
          onClick={() => onRemove(button.id)}
          className="text-ink-soft hover:text-vermilion focus-visible:outline-vermilion font-mono text-[11px] tracking-[0.16em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          削除
        </button>
      </div>

      <div className="mt-4 space-y-5">
        <TextField
          fieldId={idFor('text')}
          label="ボタンテキスト"
          value={button.text}
          onChange={change('text')}
          placeholder="詳しく見る"
        />
        <UrlField
          fieldId={idFor('url')}
          label="ボタンURL"
          value={button.url}
          error={errors?.url}
          onChange={change('url')}
          placeholder="https://example.com/list"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <ColorField
            fieldId={idFor('text-color')}
            label="文字色"
            value={button.textColor}
            onChange={change('textColor')}
            fallbackColor={DEFAULT_BUTTON_TEXT_COLOR}
          />
          <ColorField
            fieldId={idFor('bg-color')}
            label="背景色"
            value={button.bgColor}
            onChange={change('bgColor')}
            fallbackColor={DEFAULT_BUTTON_BG_COLOR}
          />
        </div>
      </div>
    </div>
  );
}
