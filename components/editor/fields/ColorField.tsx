import { describedBy, fieldClassName, FormField } from '@/components/editor/FormField';
import type { FieldProps } from '@/components/editor/fields/BaseInputField';
import { toColorPickerValue } from '@/lib/color';

type ColorFieldProps = FieldProps & {
  /** 色コードが不正なときにカラーピッカーへ渡す色（そのフィールドの既定色） */
  fallbackColor: string;
};

/**
 * カラーピッカーと色コードのテキスト欄を並べ、どちらからでも編集できるようにする。
 * ブランド色を貼り付ける運用と、感覚で選ぶ運用の両方に対応するため。
 */
export function ColorField({
  fieldId,
  label,
  description,
  value,
  error,
  onChange,
  fallbackColor,
}: ColorFieldProps) {
  const pickerId = `${fieldId}-picker`;

  return (
    <FormField label={label} fieldId={fieldId} description={description} error={error}>
      <div className="flex items-end gap-3">
        <input
          id={pickerId}
          type="color"
          // ピッカーは '#rrggbb' 以外を受け付けないため、展開・フォールバックしてから渡す
          value={toColorPickerValue(value, fallbackColor)}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label}をカラーピッカーで選ぶ`}
          className="border-rule size-9 shrink-0 cursor-pointer border bg-transparent p-1"
        />
        <input
          id={fieldId}
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={fallbackColor}
          aria-invalid={error !== undefined}
          aria-describedby={describedBy(fieldId, {
            hasDescription: description !== undefined,
            hasError: error !== undefined,
          })}
          className={`${fieldClassName} font-mono`}
        />
      </div>
    </FormField>
  );
}
