'use client';

import { useCallback, useMemo, useReducer, useState } from 'react';

import { AppHeader } from '@/components/AppHeader';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { buildMailHtml } from '@/lib/buildMailHtml';
import { mailReducer } from '@/lib/mailReducer';
import { validateMailData } from '@/lib/validation';
import {
  INITIAL_MAIL_DATA,
  type EditableLargeBannerField,
  type SimpleMailField,
  type StripBanner,
} from '@/types/mail';

const PREVIEW_PANEL_ID = 'mail-preview-panel';

/** iframe の srcDoc 差し替えは再読み込みを伴うため、プレビュー側だけ遅らせる */
const PREVIEW_DEBOUNCE_MS = 200;

/**
 * このアプリで唯一状態を持つコンポーネント。
 *
 * 入力がネスト + 可変長配列になったため、更新ロジックは純関数の mailReducer に
 * 切り出し、ここでは useReducer で束ねるだけにしている。
 * 値を読むのは EditorPanel と PreviewPanel の2つだけなので、Context や
 * 状態管理ライブラリは引き続き不要。
 */
export function MailEditor() {
  const [mailData, dispatch] = useReducer(mailReducer, INITIAL_MAIL_DATA);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);

  const setField = useCallback((field: SimpleMailField, value: string) => {
    dispatch({ type: 'setField', field, value });
  }, []);

  const setStripBannerField = useCallback((field: keyof StripBanner, value: string) => {
    dispatch({ type: 'setStripBannerField', field, value });
  }, []);

  // id の採番は副作用なので、純関数であるリデューサではなくここで行う
  const addLargeBanner = useCallback(() => {
    dispatch({ type: 'addLargeBanner', id: crypto.randomUUID() });
  }, []);

  const removeLargeBanner = useCallback((id: string) => {
    dispatch({ type: 'removeLargeBanner', id });
  }, []);

  const setLargeBannerField = useCallback(
    (id: string, field: EditableLargeBannerField, value: string) => {
      dispatch({ type: 'setLargeBannerField', id, field, value });
    },
    [],
  );

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
        <EditorPanel
          data={mailData}
          errors={errors}
          onFieldChange={setField}
          onStripBannerChange={setStripBannerField}
          onAddLargeBanner={addLargeBanner}
          onRemoveLargeBanner={removeLargeBanner}
          onLargeBannerChange={setLargeBannerField}
        />
        {isPreviewOpen ? (
          <PreviewPanel
            html={mailHtml}
            // メタ欄は iframe の外なので、デバウンスせず即時反映する
            deliveryDate={mailData.deliveryDate}
            subject={mailData.subject}
            panelId={PREVIEW_PANEL_ID}
          />
        ) : null}
      </main>
    </>
  );
}
