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
    <EditorSection
      index="04"
      title="大バナー"
      description="1カラムで縦に積まれるバナーです。画像だけでも表示され、ボタンを付けることもできます。"
      meta={
        <span className="text-ink-faint font-mono text-[10px] tracking-[0.16em]">
          {banners.length} / {MAX_LARGE_BANNERS}
        </span>
      }
    >
      {banners.length > 0 ? (
        <div className="space-y-5">
          {banners.map((banner, position) => (
            <LargeBannerCard
              key={banner.id}
              banner={banner}
              position={position}
              errors={errors?.[banner.id]}
              onFieldChange={onFieldChange}
              onRemove={onRemove}
            />
          ))}
        </div>
      ) : (
        <p className="border-rule text-ink-faint border border-dashed px-5 py-6 text-center text-[13px]">
          まだ大バナーはありません
        </p>
      )}

      <button
        type="button"
        onClick={onAdd}
        disabled={isFull}
        className="border-rule text-ink hover:border-vermilion hover:text-vermilion focus-visible:outline-vermilion disabled:hover:border-rule disabled:hover:text-ink w-full border border-dashed py-3 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isFull ? `上限 ${MAX_LARGE_BANNERS} 件` : '+ 大バナーを追加'}
      </button>
    </EditorSection>
  );
}
