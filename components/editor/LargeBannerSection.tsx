import { AddItemButton } from '@/components/editor/AddItemButton';
import { EditorSection } from '@/components/editor/EditorSection';
import { LargeBannerCard } from '@/components/editor/LargeBannerCard';
import {
  MAX_LARGE_BANNERS,
  type BannerErrors,
  type EditableLargeBannerField,
  type LargeBanner,
} from '@/types/mail';

type LargeBannerSectionProps = {
  banners: LargeBanner[];
  errors?: Record<string, BannerErrors>;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onFieldChange: (id: string, field: EditableLargeBannerField, value: string) => void;
};

export function LargeBannerSection({
  banners,
  errors,
  onAdd,
  onRemove,
  onFieldChange,
}: LargeBannerSectionProps) {
  const isFull = banners.length >= MAX_LARGE_BANNERS;

  return (
    <EditorSection title="大バナー" meta={`${banners.length} / ${MAX_LARGE_BANNERS}`}>
      {/* 0件のときは何も置かない。追加ボタンだけで用は足りる */}
      {banners.length > 0 ? (
        <div className="space-y-5">
          {banners.map((banner, position) => (
            <LargeBannerCard
              key={banner.id}
              banner={banner}
              idPrefix={`large-banner-${position}`}
              position={position}
              errors={errors?.[banner.id]}
              onFieldChange={onFieldChange}
              onRemove={onRemove}
            />
          ))}
        </div>
      ) : null}

      <AddItemButton
        label="+ 大バナーを追加"
        fullLabel={`上限 ${MAX_LARGE_BANNERS} 件`}
        disabled={isFull}
        onClick={onAdd}
      />
    </EditorSection>
  );
}
