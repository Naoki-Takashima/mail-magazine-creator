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

const DESCRIPTIONS: Record<ColumnVariant, string> = {
  three: '3カラムで左寄せに並びます。画像だけでも表示され、ロゴを付けると画像の直下に繋がります。',
  two: '2カラムで左寄せに並びます。太字テキストの下にノーマルテキストを置けます。',
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
    <EditorSection
      index={config.sectionIndex}
      title={config.title}
      description={DESCRIPTIONS[variant]}
      meta={
        <span className="text-ink-faint font-mono text-[10px] tracking-[0.16em]">
          {sets.length} / {MAX_COLUMN_SETS}
        </span>
      }
    >
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
      ) : (
        <p className="border-rule text-ink-faint border border-dashed px-5 py-6 text-center text-[13px]">
          まだセットはありません
        </p>
      )}

      <AddItemButton
        label={`+ ${config.title}を追加`}
        fullLabel={`上限 ${MAX_COLUMN_SETS} セット`}
        disabled={isFull}
        onClick={onAddSet}
      />
    </EditorSection>
  );
}
