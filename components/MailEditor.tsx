'use client';

import { useCallback, useMemo, useReducer, useState } from 'react';

import { AppHeader } from '@/components/AppHeader';
import type { BottomBannerHandlers } from '@/components/editor/BottomBannerSection';
import { EditorPanel, type ColumnSectionHandlers } from '@/components/editor/EditorPanel';
import type { InfoLinksHandlers } from '@/components/editor/InfoLinksSection';
import type { TopicsHandlers } from '@/components/editor/TopicsSection';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { buildMailHtml } from '@/lib/buildMailHtml';
import { toFileNameDateTime } from '@/lib/deliveryDate';
import { downloadHtml } from '@/lib/downloadHtml';
import { mailReducer, type MailAction } from '@/lib/mailReducer';
import { hasValidationErrors, validateMailData } from '@/lib/validation';
import {
  INITIAL_MAIL_DATA,
  type ColumnVariant,
  type EditableLargeBannerField,
  type SimpleMailField,
  type StripBanner,
} from '@/types/mail';

const PREVIEW_PANEL_ID = 'mail-preview-panel';

/** iframe の srcDoc 差し替えは再読み込みを伴うため、プレビュー側だけ遅らせる */
const PREVIEW_DEBOUNCE_MS = 200;

/**
 * カラムボックス1ブロックぶんの操作をまとめる。
 * 3カラム / 2カラムでアクションは共通なので、variant を束ねるだけで両方に対応できる。
 * id の採番は副作用なので、純関数であるリデューサではなくここで行う。
 */
function createColumnHandlers(
  dispatch: React.Dispatch<MailAction>,
  variant: ColumnVariant,
): ColumnSectionHandlers {
  return {
    onAddSet: () => dispatch({ type: 'addColumnSet', variant, id: crypto.randomUUID() }),
    onRemoveSet: (setId) => dispatch({ type: 'removeColumnSet', variant, setId }),
    onSetFieldChange: (setId, field, value) =>
      dispatch({ type: 'setColumnSetField', variant, setId, field, value }),
    onAddItem: (setId) =>
      dispatch({ type: 'addColumnItem', variant, setId, id: crypto.randomUUID() }),
    onRemoveItem: (setId, itemId) => dispatch({ type: 'removeColumnItem', variant, setId, itemId }),
    onItemFieldChange: (setId, itemId, field, value) =>
      dispatch({ type: 'setColumnItemField', variant, setId, itemId, field, value }),
    onAddButton: (setId) =>
      dispatch({ type: 'addColumnButton', variant, setId, id: crypto.randomUUID() }),
    onRemoveButton: (setId, buttonId) =>
      dispatch({ type: 'removeColumnButton', variant, setId, buttonId }),
    onButtonFieldChange: (setId, buttonId, field, value) =>
      dispatch({ type: 'setColumnButtonField', variant, setId, buttonId, field, value }),
  };
}

function createBottomBannerHandlers(dispatch: React.Dispatch<MailAction>): BottomBannerHandlers {
  return {
    onBlockFieldChange: (field, value) =>
      dispatch({ type: 'setBottomBannerBlockField', field, value }),
    onAdd: () => dispatch({ type: 'addBottomBanner', id: crypto.randomUUID() }),
    onRemove: (id) => dispatch({ type: 'removeBottomBanner', id }),
    onFieldChange: (id, field, value) =>
      dispatch({ type: 'setBottomBannerField', id, field, value }),
  };
}

function createTopicsHandlers(dispatch: React.Dispatch<MailAction>): TopicsHandlers {
  return {
    onBlockFieldChange: (field, value) => dispatch({ type: 'setTopicsBlockField', field, value }),
    onAddItem: () => dispatch({ type: 'addTopicItem', id: crypto.randomUUID() }),
    onRemoveItem: (itemId) => dispatch({ type: 'removeTopicItem', id: itemId }),
    onItemFieldChange: (itemId, field, value) =>
      dispatch({ type: 'setTopicItemField', id: itemId, field, value }),
    onButtonFieldChange: (field, value) => dispatch({ type: 'setTopicsButtonField', field, value }),
  };
}

function createInfoLinksHandlers(dispatch: React.Dispatch<MailAction>): InfoLinksHandlers {
  return {
    onAdd: () => dispatch({ type: 'addInfoLink', id: crypto.randomUUID() }),
    onRemove: (id) => dispatch({ type: 'removeInfoLink', id }),
    onFieldChange: (id, field, value) => dispatch({ type: 'setInfoLinkField', id, field, value }),
  };
}

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

  // dispatch は再生成されないので、ハンドラ一式も一度作れば使い回せる
  const threeColumnHandlers = useMemo(() => createColumnHandlers(dispatch, 'three'), []);
  const twoColumnHandlers = useMemo(() => createColumnHandlers(dispatch, 'two'), []);
  const bottomBannerHandlers = useMemo(() => createBottomBannerHandlers(dispatch), []);
  const topicsHandlers = useMemo(() => createTopicsHandlers(dispatch), []);
  const infoLinksHandlers = useMemo(() => createInfoLinksHandlers(dispatch), []);

  const togglePreview = useCallback(() => {
    setIsPreviewOpen((previous) => !previous);
  }, []);

  // エラー表示は入力に即追従させる（デバウンスしない）
  const errors = useMemo(() => validateMailData(mailData), [mailData]);

  const debouncedMailData = useDebouncedValue(mailData, PREVIEW_DEBOUNCE_MS);
  const mailHtml = useMemo(
    () => buildMailHtml(debouncedMailData, { forPreview: true }),
    [debouncedMailData],
  );

  // 出力できない理由。必須の欠けを先に出し、それが埋まったらURLのエラーを出す
  const exportBlockedReason = useMemo(() => {
    if (errors.deliveryDate || errors.subject) return '配信日と件名を入力してください';
    if (hasValidationErrors(errors)) return 'URLのエラーを直してください';
    return null;
  }, [errors]);

  const exportFileName = useMemo(() => {
    const stamp = toFileNameDateTime(mailData.deliveryDate);
    return stamp === null ? null : `${stamp}.html`;
  }, [mailData.deliveryDate]);

  // プレビューは200ms遅れるが、出力は押した瞬間の内容にしたいのでデバウンス前を使う
  const exportHtml = useCallback(() => {
    if (exportFileName === null) return;
    downloadHtml(exportFileName, buildMailHtml(mailData));
  }, [exportFileName, mailData]);

  return (
    <>
      <AppHeader
        isPreviewOpen={isPreviewOpen}
        previewPanelId={PREVIEW_PANEL_ID}
        onTogglePreview={togglePreview}
      />

      {/* lg 以上は min-h-0 が必須。落とすとエディタの中身が main を押し広げ、
          プレビューがビューポートからはみ出す */}
      <main
        className={`grid flex-1 grid-cols-1 transition-[grid-template-columns] duration-500 ease-out lg:min-h-0 ${
          isPreviewOpen ? 'lg:grid-cols-[minmax(380px,6fr)_4fr]' : 'lg:grid-cols-[minmax(0,1fr)]'
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
          threeColumnHandlers={threeColumnHandlers}
          twoColumnHandlers={twoColumnHandlers}
          bottomBannerHandlers={bottomBannerHandlers}
          topicsHandlers={topicsHandlers}
          infoLinksHandlers={infoLinksHandlers}
          exportFileName={exportFileName}
          exportBlockedReason={exportBlockedReason}
          onExport={exportHtml}
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
