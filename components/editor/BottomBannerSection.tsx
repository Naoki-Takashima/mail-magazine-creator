import { AddItemButton } from '@/components/editor/AddItemButton';
import { EditorSection } from '@/components/editor/EditorSection';
import { LargeBannerCard } from '@/components/editor/LargeBannerCard';
import { TitleFields } from '@/components/editor/TitleFields';
import {
  MAX_BOTTOM_BANNERS,
  type BannerErrors,
  type BottomBannerBlock,
  type EditableBlockTitleField,
  type EditableLargeBannerField,
} from '@/types/mail';

export type BottomBannerHandlers = {
  onBlockFieldChange: (field: EditableBlockTitleField, value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onFieldChange: (id: string, field: EditableLargeBannerField, value: string) => void;
};

type BottomBannerSectionProps = BottomBannerHandlers & {
  block: BottomBannerBlock;
  errors?: Record<string, BannerErrors>;
};

/** 07 下部大バナー。バナー1件の入力は 04 と同じなので LargeBannerCard を使い回す */
export function BottomBannerSection({
  block,
  errors,
  onBlockFieldChange,
  onAdd,
  onRemove,
  onFieldChange,
}: BottomBannerSectionProps) {
  const isFull = block.banners.length >= MAX_BOTTOM_BANNERS;

  return (
    <EditorSection title="下部大バナー" meta={`${block.banners.length} / ${MAX_BOTTOM_BANNERS}`}>
      {/* 0件のときは追加ボタンだけにする。バナーが無いのにブロックのタイトルだけ
          入力できても使い道がないため。値は state に残るので、追加し直せば戻る */}
      {block.banners.length > 0 ? (
        <TitleFields
          idPrefix="bottom-banner"
          title={block.title}
          titleColor={block.titleColor}
          onChange={onBlockFieldChange}
          placeholder="あわせてチェック"
        />
      ) : null}

      {block.banners.length > 0 ? (
        <div className="space-y-5">
          {block.banners.map((banner, position) => (
            <LargeBannerCard
              key={banner.id}
              banner={banner}
              idPrefix={`bottom-banner-${position}`}
              position={position}
              errors={errors?.[banner.id]}
              onFieldChange={onFieldChange}
              onRemove={onRemove}
            />
          ))}
        </div>
      ) : null}

      <AddItemButton
        label="+ 下部大バナーを追加"
        fullLabel={`上限 ${MAX_BOTTOM_BANNERS} 件`}
        disabled={isFull}
        onClick={onAdd}
      />
    </EditorSection>
  );
}
