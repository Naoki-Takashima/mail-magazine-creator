import { AddItemButton } from '@/components/editor/AddItemButton';
import { ButtonFields } from '@/components/editor/ButtonFields';
import { EditorSection } from '@/components/editor/EditorSection';
import { TitleFields } from '@/components/editor/TitleFields';
import { TopicItemCard } from '@/components/editor/TopicItemCard';
import {
  MAX_TOPIC_ITEMS,
  type ButtonContent,
  type ColumnButtonErrors,
  type EditableBlockTitleField,
  type EditableTopicItemField,
  type TopicItemErrors,
  type TopicsBlock,
} from '@/types/mail';

export type TopicsHandlers = {
  onBlockFieldChange: (field: EditableBlockTitleField, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (itemId: string) => void;
  onItemFieldChange: (itemId: string, field: EditableTopicItemField, value: string) => void;
  onButtonFieldChange: (field: keyof ButtonContent, value: string) => void;
};

type TopicsSectionProps = TopicsHandlers & {
  block: TopicsBlock;
  itemErrors?: Record<string, TopicItemErrors>;
  buttonErrors?: ColumnButtonErrors;
};

/** 08 トピックスエリア。画像とテキストの横並びを縦に積み、末尾にボタンを1件置く */
export function TopicsSection({
  block,
  itemErrors,
  buttonErrors,
  onBlockFieldChange,
  onAddItem,
  onRemoveItem,
  onItemFieldChange,
  onButtonFieldChange,
}: TopicsSectionProps) {
  const isFull = block.items.length >= MAX_TOPIC_ITEMS;

  return (
    <EditorSection title="トピックスエリア" meta={`${block.items.length} / ${MAX_TOPIC_ITEMS}`}>
      <TitleFields
        idPrefix="topics"
        title={block.title}
        titleColor={block.titleColor}
        onChange={onBlockFieldChange}
        placeholder="トピックス"
      />

      <div>
        {block.items.length > 0 ? (
          <div className="space-y-3">
            {block.items.map((item, position) => (
              <TopicItemCard
                key={item.id}
                item={item}
                idPrefix={`topic-${position}`}
                position={position}
                errors={itemErrors?.[item.id]}
                onFieldChange={onItemFieldChange}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
        ) : (
          <p className="border-rule text-fg-faint rounded-lg border border-dashed px-5 py-6 text-center text-[13px]">
            まだトピックはありません
          </p>
        )}

        <div className="mt-3">
          <AddItemButton
            label="+ トピックを追加"
            fullLabel={`上限 ${MAX_TOPIC_ITEMS} 件`}
            disabled={isFull}
            onClick={onAddItem}
          />
        </div>
      </div>

      <div className="border-rule border-t pt-5">
        <p className="text-fg-soft mb-4 text-[12px] font-medium">ボタン</p>
        <ButtonFields
          idPrefix="topics-button"
          button={block.button}
          errors={buttonErrors}
          onChange={onButtonFieldChange}
        />
      </div>
    </EditorSection>
  );
}
