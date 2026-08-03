import type { ColumnSetHandlers } from '@/components/editor/ColumnSetCard';
import { ColumnSetSection } from '@/components/editor/ColumnSetSection';
import { DeliveryDateSection } from '@/components/editor/DeliveryDateSection';
import { LargeBannerSection } from '@/components/editor/LargeBannerSection';
import { StripBannerSection } from '@/components/editor/StripBannerSection';
import { SubjectSection } from '@/components/editor/SubjectSection';
import type {
  EditableLargeBannerField,
  MailData,
  SimpleMailField,
  StripBanner,
  ValidationErrors,
} from '@/types/mail';

/** カラムボックス1ブロックぶんの操作一式 */
export type ColumnSectionHandlers = ColumnSetHandlers & { onAddSet: () => void };

type EditorPanelProps = {
  data: MailData;
  errors: ValidationErrors;
  onFieldChange: (field: SimpleMailField, value: string) => void;
  onStripBannerChange: (field: keyof StripBanner, value: string) => void;
  onAddLargeBanner: () => void;
  onRemoveLargeBanner: (id: string) => void;
  onLargeBannerChange: (id: string, field: EditableLargeBannerField, value: string) => void;
  threeColumnHandlers: ColumnSectionHandlers;
  twoColumnHandlers: ColumnSectionHandlers;
};

/**
 * 入力ブロックを並べるだけの presentational コンポーネント。
 * 状態は持たず、値と更新関数を MailEditor から受け取る。
 */
export function EditorPanel({
  data,
  errors,
  onFieldChange,
  onStripBannerChange,
  onAddLargeBanner,
  onRemoveLargeBanner,
  onLargeBannerChange,
  threeColumnHandlers,
  twoColumnHandlers,
}: EditorPanelProps) {
  return (
    // プレビューを閉じて全幅になったときに行長が伸びすぎないよう、内側で幅を抑える
    <section
      aria-labelledby="editor-heading"
      className="mx-auto flex w-full max-w-2xl min-w-0 flex-col"
    >
      <header className="px-6 pt-8 pb-6 sm:px-8">
        <p className="text-ink-faint font-mono text-[11px] tracking-[0.28em] uppercase">Compose</p>
        <h2 id="editor-heading" className="font-display text-ink mt-2 text-2xl">
          入力
        </h2>
      </header>

      <div className="animate-rise" style={{ animationDelay: '60ms' }}>
        <DeliveryDateSection
          value={data.deliveryDate}
          error={errors.deliveryDate}
          onChange={(value) => onFieldChange('deliveryDate', value)}
        />
      </div>

      <div className="animate-rise" style={{ animationDelay: '120ms' }}>
        <SubjectSection
          value={data.subject}
          error={errors.subject}
          onChange={(value) => onFieldChange('subject', value)}
        />
      </div>

      <div className="animate-rise" style={{ animationDelay: '180ms' }}>
        <StripBannerSection
          banner={data.stripBanner}
          errors={errors.stripBanner}
          onFieldChange={onStripBannerChange}
        />
      </div>

      <div className="animate-rise" style={{ animationDelay: '240ms' }}>
        <LargeBannerSection
          banners={data.largeBanners}
          errors={errors.largeBanners}
          onAdd={onAddLargeBanner}
          onRemove={onRemoveLargeBanner}
          onFieldChange={onLargeBannerChange}
        />
      </div>

      <div className="animate-rise" style={{ animationDelay: '300ms' }}>
        <ColumnSetSection
          variant="three"
          sets={data.threeColumnSets}
          errors={errors.threeColumnSets}
          {...threeColumnHandlers}
        />
      </div>

      <div className="animate-rise" style={{ animationDelay: '360ms' }}>
        <ColumnSetSection
          variant="two"
          sets={data.twoColumnSets}
          errors={errors.twoColumnSets}
          {...twoColumnHandlers}
        />
      </div>

      <p className="border-rule text-ink-faint border-t px-6 py-6 text-[12px] leading-relaxed sm:px-8">
        入力内容はブラウザ上でのみ扱われ、どこにも保存・送信されません。
      </p>
    </section>
  );
}
