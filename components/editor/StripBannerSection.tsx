import { AddItemButton } from '@/components/editor/AddItemButton';
import { EditorSection } from '@/components/editor/EditorSection';
import { UrlField } from '@/components/editor/fields/UrlField';
import type { BannerErrors, StripBanner } from '@/types/mail';

export type StripBannerHandlers = {
  onAdd: () => void;
  onRemove: () => void;
  onFieldChange: (field: keyof StripBanner, value: string) => void;
};

type StripBannerSectionProps = StripBannerHandlers & {
  /** 未追加なら null */
  banner: StripBanner | null;
  errors?: BannerErrors;
};

/**
 * 03 帯バナー。1件しか置けないので配列ではなく null / オブジェクトで在り無しを持つが、
 * 「追加ボタン → 入力欄」という手順は他ブロックと揃えている。
 */
export function StripBannerSection({
  banner,
  errors,
  onAdd,
  onRemove,
  onFieldChange,
}: StripBannerSectionProps) {
  if (banner === null) {
    return (
      <EditorSection title="帯バナー" meta="最大1件">
        <AddItemButton
          label="+ 帯バナーを追加"
          fullLabel="上限 1 件"
          disabled={false}
          onClick={onAdd}
        />
      </EditorSection>
    );
  }

  return (
    <EditorSection title="帯バナー" meta="最大1件">
      {/* 削除できる単位であることを、他ブロックのカードと同じ箱で示す */}
      <div className="bg-canvas border-rule rounded-lg border p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-fg-soft text-[12px] font-medium">帯バナー</span>
          <button
            type="button"
            onClick={onRemove}
            className="text-fg-faint hover:text-danger focus-visible:outline-accent rounded-md text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            削除
          </button>
        </div>

        <div className="mt-4 space-y-5">
          <UrlField
            fieldId="strip-banner-image-url"
            label="画像パス"
            value={banner.imageUrl}
            error={errors?.imageUrl}
            onChange={(value) => onFieldChange('imageUrl', value)}
            placeholder="https://example.com/strip.png"
          />
          <UrlField
            fieldId="strip-banner-url"
            label="URL"
            value={banner.url}
            error={errors?.url}
            onChange={(value) => onFieldChange('url', value)}
            placeholder="https://example.com/campaign"
          />
        </div>
      </div>
    </EditorSection>
  );
}
