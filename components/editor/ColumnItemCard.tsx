import { ColorField } from '@/components/editor/fields/ColorField';
import { TextField } from '@/components/editor/fields/TextField';
import { UrlField } from '@/components/editor/fields/UrlField';
import {
  DEFAULT_TEXT_COLOR,
  type ColumnItem,
  type ColumnItemErrors,
  type ColumnVariantConfig,
  type EditableColumnItemField,
} from '@/types/mail';

type ColumnItemCardProps = {
  item: ColumnItem;
  config: ColumnVariantConfig;
  /** 入力欄の id を一意にするための接頭辞 */
  idPrefix: string;
  /** 表示用の連番（0始まり） */
  position: number;
  errors?: ColumnItemErrors;
  onFieldChange: (itemId: string, field: EditableColumnItemField, value: string) => void;
  onRemove: (itemId: string) => void;
};

/**
 * カラムアイテム1件ぶんの入力。
 * 最大18件並ぶため <details> の折りたたみにし、閉じていても
 * 通し番号と太字テキストの先頭で中身が分かるようにしている。
 */
export function ColumnItemCard({
  item,
  config,
  idPrefix,
  position,
  errors,
  onFieldChange,
  onRemove,
}: ColumnItemCardProps) {
  const idFor = (suffix: string) => `${idPrefix}-${suffix}`;
  const change = (field: EditableColumnItemField) => (value: string) =>
    onFieldChange(item.id, field, value);

  const hasError = errors !== undefined;
  const summaryText = item.boldText.trim() || '（未入力）';

  return (
    <details className="bg-canvas border-rule group rounded-lg border" open={position === 0}>
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
        <span
          aria-hidden
          className="text-fg-faint text-[10px] transition-transform group-open:rotate-90"
        >
          ▶
        </span>
        <span className="text-fg-faint text-[12px] tabular-nums">{position + 1}</span>
        <span className="text-fg min-w-0 flex-1 truncate text-[13px]">{summaryText}</span>
        {hasError ? <span className="text-danger text-[11px] font-medium">要確認</span> : null}
      </summary>

      <div className="border-rule space-y-5 border-t p-4">
        <UrlField
          fieldId={idFor('image-url')}
          label="画像パス"
          value={item.imageUrl}
          error={errors?.imageUrl}
          onChange={change('imageUrl')}
          placeholder="https://example.com/item.png"
        />
        <UrlField
          fieldId={idFor('logo-url')}
          label="ロゴ"
          value={item.logoUrl}
          error={errors?.logoUrl}
          onChange={change('logoUrl')}
          placeholder="https://example.com/logo.png"
        />
        <UrlField
          fieldId={idFor('url')}
          label="URL"
          value={item.url}
          error={errors?.url}
          onChange={change('url')}
          placeholder="https://example.com/product"
        />
        <TextField
          fieldId={idFor('bold-text')}
          label={`太字テキスト（最大${config.boldMaxLength}文字）`}
          value={item.boldText}
          onChange={change('boldText')}
          maxLength={config.boldMaxLength}
          placeholder="商品名"
        />
        {config.normalMaxLength !== null ? (
          <TextField
            fieldId={idFor('normal-text')}
            label={`ノーマルテキスト（最大${config.normalMaxLength}文字）`}
            value={item.normalText}
            onChange={change('normalText')}
            maxLength={config.normalMaxLength}
            placeholder="補足の説明文"
          />
        ) : null}
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
            className="text-fg-faint hover:text-danger focus-visible:outline-accent rounded-md text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            このアイテムを削除
          </button>
        </div>
      </div>
    </details>
  );
}
