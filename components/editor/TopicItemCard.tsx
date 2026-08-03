import { ColorField } from '@/components/editor/fields/ColorField';
import { TextField } from '@/components/editor/fields/TextField';
import { UrlField } from '@/components/editor/fields/UrlField';
import {
  DEFAULT_TEXT_COLOR,
  type EditableTopicItemField,
  type TopicItem,
  type TopicItemErrors,
} from '@/types/mail';

type TopicItemCardProps = {
  item: TopicItem;
  /** 入力欄の id を一意にするための接頭辞 */
  idPrefix: string;
  /** 表示用の連番（0始まり） */
  position: number;
  errors?: TopicItemErrors;
  onFieldChange: (itemId: string, field: EditableTopicItemField, value: string) => void;
  onRemove: (itemId: string) => void;
};

/**
 * トピックス1件ぶんの入力。
 * 最大8件並ぶため <details> の折りたたみにし、閉じていても
 * 通し番号と太字テキストの先頭で中身が分かるようにしている。
 */
export function TopicItemCard({
  item,
  idPrefix,
  position,
  errors,
  onFieldChange,
  onRemove,
}: TopicItemCardProps) {
  const idFor = (suffix: string) => `${idPrefix}-${suffix}`;
  const change = (field: EditableTopicItemField) => (value: string) =>
    onFieldChange(item.id, field, value);

  const hasError = errors !== undefined;
  const summaryText = item.boldText.trim() || '（未入力）';

  return (
    <details className="bg-paper border-rule group border" open={position === 0}>
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
        <span
          aria-hidden
          className="text-ink-faint font-mono text-[10px] tracking-[0.24em] transition-transform group-open:rotate-90"
        >
          ▶
        </span>
        <span className="text-ink-faint font-mono text-[10px] tracking-[0.24em]">
          {String(position + 1).padStart(2, '0')}
        </span>
        <span className="text-ink min-w-0 flex-1 truncate text-[13px]">{summaryText}</span>
        {hasError ? (
          <span className="text-vermilion font-mono text-[10px] tracking-[0.16em] uppercase">
            要確認
          </span>
        ) : null}
      </summary>

      <div className="border-rule space-y-5 border-t p-4">
        <UrlField
          fieldId={idFor('image-url')}
          label="画像パス"
          description="テキストの左に並びます（160px幅）。"
          value={item.imageUrl}
          error={errors?.imageUrl}
          onChange={change('imageUrl')}
          placeholder="https://example.com/topic.png"
        />
        <UrlField
          fieldId={idFor('url')}
          label="URL"
          description="画像のリンク先です。"
          value={item.url}
          error={errors?.url}
          onChange={change('url')}
          placeholder="https://example.com/news"
        />
        <TextField
          fieldId={idFor('bold-text')}
          label="太字テキスト"
          value={item.boldText}
          onChange={change('boldText')}
          placeholder="お知らせの見出し"
        />
        <TextField
          fieldId={idFor('normal-text')}
          label="ノーマルテキスト"
          value={item.normalText}
          onChange={change('normalText')}
          placeholder="補足の説明文"
        />
        <ColorField
          fieldId={idFor('text-color')}
          label="テキストカラー"
          value={item.textColor}
          onChange={change('textColor')}
          fallbackColor={DEFAULT_TEXT_COLOR}
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="text-ink-soft hover:text-vermilion focus-visible:outline-vermilion font-mono text-[11px] tracking-[0.16em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            このトピックを削除
          </button>
        </div>
      </div>
    </details>
  );
}
