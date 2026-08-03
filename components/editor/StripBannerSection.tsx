import { EditorSection } from '@/components/editor/EditorSection';
import { UrlField } from '@/components/editor/fields/UrlField';
import type { BannerErrors, StripBanner } from '@/types/mail';

type StripBannerSectionProps = {
  banner: StripBanner;
  errors?: BannerErrors;
  onFieldChange: (field: keyof StripBanner, value: string) => void;
};

export function StripBannerSection({ banner, errors, onFieldChange }: StripBannerSectionProps) {
  return (
    <EditorSection title="帯バナー" meta="最大1件">
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
    </EditorSection>
  );
}
