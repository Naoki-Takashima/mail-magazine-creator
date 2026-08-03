'use client';

import { useCallback, useMemo, useState } from 'react';

import { AppHeader } from '@/components/AppHeader';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { buildMailHtml } from '@/lib/buildMailHtml';
import { validateMailData } from '@/lib/validation';
import { INITIAL_MAIL_DATA, type MailData, type MailField } from '@/types/mail';

const PREVIEW_PANEL_ID = 'mail-preview-panel';

/** iframe の srcDoc 差し替えは再読み込みを伴うため、プレビュー側だけ遅らせる */
const PREVIEW_DEBOUNCE_MS = 200;

/**
 * このアプリで唯一状態を持つコンポーネント。
 *
 * 状態は入力3値 + プレビュー開閉フラグのみで、受け渡しも
 * MailEditor → EditorPanel → 各Input の2階層で収まるため、
 * Context や状態管理ライブラリは使わない。
 */
export function MailEditor() {
  const [mailData, setMailData] = useState<MailData>(INITIAL_MAIL_DATA);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);

  const updateField = useCallback((field: MailField, value: string) => {
    setMailData((previous) => ({ ...previous, [field]: value }));
  }, []);

  const togglePreview = useCallback(() => {
    setIsPreviewOpen((previous) => !previous);
  }, []);

  // エラー表示は入力に即追従させる（デバウンスしない）
  const errors = useMemo(() => validateMailData(mailData), [mailData]);

  const debouncedMailData = useDebouncedValue(mailData, PREVIEW_DEBOUNCE_MS);
  const mailHtml = useMemo(() => buildMailHtml(debouncedMailData), [debouncedMailData]);

  return (
    <>
      <AppHeader
        isPreviewOpen={isPreviewOpen}
        previewPanelId={PREVIEW_PANEL_ID}
        onTogglePreview={togglePreview}
      />

      <main
        className={`grid flex-1 grid-cols-1 transition-[grid-template-columns] duration-500 ease-out ${
          isPreviewOpen
            ? 'lg:grid-cols-[minmax(380px,0.85fr)_1.15fr]'
            : 'lg:grid-cols-[minmax(0,1fr)]'
        }`}
      >
        <EditorPanel data={mailData} errors={errors} onFieldChange={updateField} />
        {isPreviewOpen ? <PreviewPanel html={mailHtml} panelId={PREVIEW_PANEL_ID} /> : null}
      </main>
    </>
  );
}
