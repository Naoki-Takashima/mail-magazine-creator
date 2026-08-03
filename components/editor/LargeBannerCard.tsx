import { ColorField } from '@/components/editor/fields/ColorField';
import { TextField } from '@/components/editor/fields/TextField';
import { UrlField } from '@/components/editor/fields/UrlField';
import {
  DEFAULT_BUTTON_BG_COLOR,
  DEFAULT_BUTTON_TEXT_COLOR,
  type BannerErrors,
  type EditableLargeBannerField,
  type LargeBanner,
} from '@/types/mail';

type LargeBannerCardProps = {
  banner: LargeBanner;
  /** 入力欄の id を一意にするための接頭辞。04 と 07 の両方で使うため外から渡す */
  idPrefix: string;
  /** 表示用の連番（0始まり） */
  position: number;
  errors?: BannerErrors;
  onFieldChange: (id: string, field: EditableLargeBannerField, value: string) => void;
  onRemove: (id: string) => void;
};

/**
 * 大バナー1件ぶんの入力カード。
 * バナー本体（画像・URL）とボタン設定を罫線で分け、どこまでが1枚かを分かりやすくする。
 * 04 大バナーと 07 下部大バナーは入力構成が同じなので、このカードを共用する。
 */
export function LargeBannerCard({
  banner,
  idPrefix,
  position,
  errors,
  onFieldChange,
  onRemove,
}: LargeBannerCardProps) {
  const label = String(position + 1).padStart(2, '0');
  const idFor = (suffix: string) => `${idPrefix}-${suffix}`;
  const change = (field: EditableLargeBannerField) => (value: string) =>
    onFieldChange(banner.id, field, value);

  return (
    <div className="bg-paper-sunk border-rule border p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="text-ink-faint font-mono text-[10px] tracking-[0.24em] uppercase">
          Banner {label}
        </span>
        <button
          type="button"
          onClick={() => onRemove(banner.id)}
          className="text-ink-soft hover:text-vermilion focus-visible:outline-vermilion font-mono text-[11px] tracking-[0.16em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          削除
        </button>
      </div>

      <div className="mt-5 space-y-5">
        <UrlField
          fieldId={idFor('image-url')}
          label="画像パス"
          value={banner.imageUrl}
          error={errors?.imageUrl}
          onChange={change('imageUrl')}
          placeholder="https://example.com/banner.png"
        />
        <UrlField
          fieldId={idFor('url')}
          label="URL"
          value={banner.url}
          error={errors?.url}
          onChange={change('url')}
          placeholder="https://example.com/product"
        />
      </div>

      <div className="border-rule mt-6 border-t pt-5">
        <p className="text-ink-faint font-mono text-[10px] tracking-[0.24em] uppercase">Button</p>
        <p className="text-ink-soft mt-1.5 text-[13px] leading-relaxed">
          ボタンテキストを入れると表示されます。ボタンURLが空のときは上のURLが使われます。
        </p>

        <div className="mt-5 space-y-5">
          <TextField
            fieldId={idFor('button-text')}
            label="ボタンテキスト"
            value={banner.buttonText}
            onChange={change('buttonText')}
            placeholder="詳しく見る"
          />
          <UrlField
            fieldId={idFor('button-url')}
            label="ボタンURL"
            value={banner.buttonUrl}
            error={errors?.buttonUrl}
            onChange={change('buttonUrl')}
            placeholder="空欄なら上のURLを使用"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <ColorField
              fieldId={idFor('button-text-color')}
              label="文字色"
              value={banner.buttonTextColor}
              onChange={change('buttonTextColor')}
              fallbackColor={DEFAULT_BUTTON_TEXT_COLOR}
            />
            <ColorField
              fieldId={idFor('button-bg-color')}
              label="背景色"
              value={banner.buttonBgColor}
              onChange={change('buttonBgColor')}
              fallbackColor={DEFAULT_BUTTON_BG_COLOR}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
