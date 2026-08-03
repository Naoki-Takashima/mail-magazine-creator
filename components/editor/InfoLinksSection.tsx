import { AddItemButton } from '@/components/editor/AddItemButton';
import { EditorSection } from '@/components/editor/EditorSection';
import { TextField } from '@/components/editor/fields/TextField';
import { UrlField } from '@/components/editor/fields/UrlField';
import {
  MAX_INFO_LINKS,
  type EditableInfoLinkField,
  type InfoLink,
  type InfoLinkErrors,
} from '@/types/mail';

export type InfoLinksHandlers = {
  onAdd: () => void;
  onRemove: (id: string) => void;
  onFieldChange: (id: string, field: EditableInfoLinkField, value: string) => void;
};

type InfoLinksSectionProps = InfoLinksHandlers & {
  links: InfoLink[];
  errors?: Record<string, InfoLinkErrors>;
};

/**
 * 09 インフォメーション（フッター）。
 * 入力が2つだけなので折りたたまず、常時展開の行として並べる。
 */
export function InfoLinksSection({
  links,
  errors,
  onAdd,
  onRemove,
  onFieldChange,
}: InfoLinksSectionProps) {
  const isFull = links.length >= MAX_INFO_LINKS;

  return (
    <EditorSection title="インフォメーション" meta={`${links.length} / ${MAX_INFO_LINKS}`}>
      {links.length > 0 ? (
        <div className="space-y-3">
          {links.map((link, position) => (
            <div key={link.id} className="bg-canvas border-rule rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-fg-soft text-[12px] font-medium">リンク {position + 1}</span>
                <button
                  type="button"
                  onClick={() => onRemove(link.id)}
                  className="text-fg-faint hover:text-danger focus-visible:outline-accent rounded-md text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  削除
                </button>
              </div>

              <div className="mt-4 space-y-5">
                <TextField
                  fieldId={`info-link-${position}-text`}
                  label="リンクテキスト"
                  value={link.text}
                  onChange={(value) => onFieldChange(link.id, 'text', value)}
                  placeholder="配信停止はこちら"
                />
                <UrlField
                  fieldId={`info-link-${position}-url`}
                  label="URL"
                  value={link.url}
                  error={errors?.[link.id]?.url}
                  onChange={(value) => onFieldChange(link.id, 'url', value)}
                  placeholder="https://example.com/unsubscribe"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="border-rule text-fg-faint rounded-lg border border-dashed px-5 py-6 text-center text-[13px]">
          まだリンクはありません
        </p>
      )}

      <AddItemButton
        label="+ リンクを追加"
        fullLabel={`上限 ${MAX_INFO_LINKS} 件`}
        disabled={isFull}
        onClick={onAdd}
      />
    </EditorSection>
  );
}
