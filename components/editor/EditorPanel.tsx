import {
  BottomBannerSection,
  type BottomBannerHandlers,
} from '@/components/editor/BottomBannerSection';
import type { ColumnSetHandlers } from '@/components/editor/ColumnSetCard';
import { ColumnSetSection } from '@/components/editor/ColumnSetSection';
import { DeliveryDateSection } from '@/components/editor/DeliveryDateSection';
import { ExportSection } from '@/components/editor/ExportSection';
import { InfoLinksSection, type InfoLinksHandlers } from '@/components/editor/InfoLinksSection';
import { LargeBannerSection } from '@/components/editor/LargeBannerSection';
import { StripBannerSection } from '@/components/editor/StripBannerSection';
import { SubjectSection } from '@/components/editor/SubjectSection';
import { TopicsSection, type TopicsHandlers } from '@/components/editor/TopicsSection';
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
  bottomBannerHandlers: BottomBannerHandlers;
  topicsHandlers: TopicsHandlers;
  infoLinksHandlers: InfoLinksHandlers;
  /** 出力されるファイル名。出力できない状態なら null */
  exportFileName: string | null;
  /** 出力できない理由。null なら出力できる */
  exportBlockedReason: string | null;
  onExport: () => void;
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
  bottomBannerHandlers,
  topicsHandlers,
  infoLinksHandlers,
  exportFileName,
  exportBlockedReason,
  onExport,
}: EditorPanelProps) {
  return (
    // lg 以上ではページ全体ではなくこの列がスクロールを担当する
    // （プレビューをビューポート内に固定するため）。
    // overscroll-contain で、末尾までスクロールしたときの慣性の抜けを止める。
    <section
      aria-labelledby="editor-heading"
      className="editor-scroll w-full min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain"
    >
      {/* プレビューを閉じて全幅になったときに行長が伸びすぎないよう、内側で幅を抑える */}
      <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-col">
        <header className="px-6 pt-8 pb-6 sm:px-8">
          <p className="text-ink-faint font-mono text-[11px] tracking-[0.28em] uppercase">
            Compose
          </p>
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

        <div className="animate-rise" style={{ animationDelay: '420ms' }}>
          <BottomBannerSection
            block={data.bottomBannerBlock}
            errors={errors.bottomBanners}
            {...bottomBannerHandlers}
          />
        </div>

        <div className="animate-rise" style={{ animationDelay: '480ms' }}>
          <TopicsSection
            block={data.topicsBlock}
            itemErrors={errors.topicItems}
            buttonErrors={errors.topicsButton}
            {...topicsHandlers}
          />
        </div>

        <div className="animate-rise" style={{ animationDelay: '540ms' }}>
          <InfoLinksSection
            links={data.infoLinks}
            errors={errors.infoLinks}
            {...infoLinksHandlers}
          />
        </div>

        <div className="animate-rise" style={{ animationDelay: '600ms' }}>
          <ExportSection
            fileName={exportFileName}
            blockedReason={exportBlockedReason}
            onExport={onExport}
          />
        </div>

        <p className="border-rule text-ink-faint border-t px-6 py-6 text-[12px] leading-relaxed sm:px-8">
          入力内容はブラウザ上でのみ扱われ、どこにも保存・送信されません。
        </p>
      </div>
    </section>
  );
}
