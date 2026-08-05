import { AddItemButton } from '@/components/editor/AddItemButton';
import { ColumnButtonCard } from '@/components/editor/ColumnButtonCard';
import { ColumnItemCard } from '@/components/editor/ColumnItemCard';
import { TitleFields } from '@/components/editor/TitleFields';
import {
  MAX_COLUMN_BUTTONS,
  MAX_COLUMN_ITEMS,
  type ColumnSet,
  type ColumnSetErrors,
  type ColumnVariantConfig,
  type EditableColumnButtonField,
  type EditableColumnItemField,
  type EditableColumnSetField,
} from '@/types/mail';

export type ColumnSetHandlers = {
  onSetFieldChange: (setId: string, field: EditableColumnSetField, value: string) => void;
  onRemoveSet: (setId: string) => void;
  onAddItem: (setId: string) => void;
  onRemoveItem: (setId: string, itemId: string) => void;
  onItemFieldChange: (
    setId: string,
    itemId: string,
    field: EditableColumnItemField,
    value: string,
  ) => void;
  onAddButton: (setId: string) => void;
  onRemoveButton: (setId: string, buttonId: string) => void;
  onButtonFieldChange: (
    setId: string,
    buttonId: string,
    field: EditableColumnButtonField,
    value: string,
  ) => void;
};

type ColumnSetCardProps = ColumnSetHandlers & {
  set: ColumnSet;
  config: ColumnVariantConfig;
  /** 入力欄の id を一意にするための接頭辞 */
  idPrefix: string;
  /** 表示用の連番（0始まり） */
  position: number;
  errors?: ColumnSetErrors;
};

/**
 * 「タイトル + カラムアイテム + 末尾ボタン」の1セット。
 * 入れ子が深くなるため、セットは沈めた面、アイテム / ボタンは用紙色の面にして階層を示す。
 */
export function ColumnSetCard({
  set,
  config,
  idPrefix,
  position,
  errors,
  onSetFieldChange,
  onRemoveSet,
  onAddItem,
  onRemoveItem,
  onItemFieldChange,
  onAddButton,
  onRemoveButton,
  onButtonFieldChange,
}: ColumnSetCardProps) {
  const idFor = (suffix: string) => `${idPrefix}-${suffix}`;
  const isItemsFull = set.items.length >= MAX_COLUMN_ITEMS;
  const isButtonsFull = set.buttons.length >= MAX_COLUMN_BUTTONS;

  return (
    <div className="bg-canvas-sunk border-rule rounded-xl border p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="text-fg-soft text-[12px] font-medium">セット {position + 1}</span>
        <button
          type="button"
          onClick={() => onRemoveSet(set.id)}
          className="text-fg-faint hover:text-danger focus-visible:outline-accent rounded-md text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          セットを削除
        </button>
      </div>

      <div className="mt-5">
        <TitleFields
          idPrefix={idPrefix}
          title={set.title}
          titleColor={set.titleColor}
          onChange={(field, value) => onSetFieldChange(set.id, field, value)}
        />
      </div>

      <div className="border-rule mt-6 border-t pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-fg-soft text-[12px] font-medium">アイテム</p>
          <span className="text-fg-faint text-[12px] tabular-nums">
            {set.items.length} / {MAX_COLUMN_ITEMS}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {set.items.map((item, itemPosition) => (
            <ColumnItemCard
              key={item.id}
              item={item}
              config={config}
              idPrefix={idFor(`item-${itemPosition}`)}
              position={itemPosition}
              errors={errors?.items?.[item.id]}
              onFieldChange={(itemId, field, value) =>
                onItemFieldChange(set.id, itemId, field, value)
              }
              onRemove={(itemId) => onRemoveItem(set.id, itemId)}
            />
          ))}

          <AddItemButton
            label="+ アイテムを追加"
            fullLabel={`上限 ${MAX_COLUMN_ITEMS} 件`}
            disabled={isItemsFull}
            onClick={() => onAddItem(set.id)}
          />
        </div>
      </div>

      <div className="border-rule mt-6 border-t pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-fg-soft text-[12px] font-medium">ボタン</p>
          <span className="text-fg-faint text-[12px] tabular-nums">
            {set.buttons.length} / {MAX_COLUMN_BUTTONS}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {set.buttons.map((button, buttonPosition) => (
            <ColumnButtonCard
              key={button.id}
              button={button}
              idPrefix={idFor(`button-${buttonPosition}`)}
              position={buttonPosition}
              errors={errors?.buttons?.[button.id]}
              onFieldChange={(buttonId, field, value) =>
                onButtonFieldChange(set.id, buttonId, field, value)
              }
              onRemove={(buttonId) => onRemoveButton(set.id, buttonId)}
            />
          ))}

          <AddItemButton
            label="+ ボタンを追加"
            fullLabel={`上限 ${MAX_COLUMN_BUTTONS} 件`}
            disabled={isButtonsFull}
            onClick={() => onAddButton(set.id)}
          />
        </div>
      </div>
    </div>
  );
}
