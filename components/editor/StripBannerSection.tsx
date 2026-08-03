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
    <EditorSection
      index="03"
      title="帯バナー"
      description="メール最上部に幅いっぱいで配置される帯です。画像だけでも表示され、URLを入れると画像全体がリンクになります。"
      meta={<span className="text-ink-faint font-mono text-[10px] tracking-[0.16em]">MAX 1</span>}
    >
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
