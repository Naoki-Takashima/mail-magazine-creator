import { ButtonFields } from '@/components/editor/ButtonFields';
import type { ColumnButton, ColumnButtonErrors, EditableColumnButtonField } from '@/types/mail';

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
  return (
    <div className="bg-canvas border-rule rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-fg-soft text-[12px] font-medium">ボタン {position + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(button.id)}
          className="text-fg-faint hover:text-danger focus-visible:outline-accent rounded-md text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          削除
        </button>
      </div>

      <div className="mt-4">
        <ButtonFields
          idPrefix={idPrefix}
          button={button}
          errors={errors}
          onChange={(field, value) => onFieldChange(button.id, field, value)}
        />
      </div>
    </div>
  );
}
