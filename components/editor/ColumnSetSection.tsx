import { AddItemButton } from '@/components/editor/AddItemButton';
import { ColumnSetCard, type ColumnSetHandlers } from '@/components/editor/ColumnSetCard';
import { EditorSection } from '@/components/editor/EditorSection';
import {
  COLUMN_VARIANT_CONFIG,
  MAX_COLUMN_SETS,
  type ColumnSet,
  type ColumnSetErrors,
  type ColumnVariant,
} from '@/types/mail';

type ColumnSetSectionProps = ColumnSetHandlers & {
  variant: ColumnVariant;
  sets: ColumnSet[];
  errors?: Record<string, ColumnSetErrors>;
  onAddSet: () => void;
};

/**
 * 3カラム / 2カラムのブロック本体。
 * 構造が同型なので variant を渡すだけで 05 / 06 のどちらにもなる。
 */
export function ColumnSetSection({
  variant,
  sets,
  errors,
  onAddSet,
  ...setHandlers
}: ColumnSetSectionProps) {
  const config = COLUMN_VARIANT_CONFIG[variant];
  const isFull = sets.length >= MAX_COLUMN_SETS;
  const idPrefix = `${variant}-column`;

  return (
    <EditorSection title={config.title} meta={`${sets.length} / ${MAX_COLUMN_SETS}`}>
      {/* 0件のときは何も置かない。追加ボタンだけで用は足りる */}
      {sets.length > 0 ? (
        <div className="space-y-5">
          {sets.map((set, position) => (
            <ColumnSetCard
              key={set.id}
              set={set}
              config={config}
              idPrefix={`${idPrefix}-set-${position}`}
              position={position}
              errors={errors?.[set.id]}
              {...setHandlers}
            />
          ))}
        </div>
      ) : null}

      <AddItemButton
        label={`+ ${config.title}を追加`}
        fullLabel={`上限 ${MAX_COLUMN_SETS} セット`}
        disabled={isFull}
        onClick={onAddSet}
      />
    </EditorSection>
  );
}
