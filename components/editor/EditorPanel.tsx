import { ImageInput } from '@/components/editor/ImageInput';
import { TextInput } from '@/components/editor/TextInput';
import { UrlInput } from '@/components/editor/UrlInput';
import type { MailData, MailField, ValidationErrors } from '@/types/mail';

type EditorPanelProps = {
  data: MailData;
  errors: ValidationErrors;
  onFieldChange: (field: MailField, value: string) => void;
};

/**
 * 入力欄をまとめるだけの presentational コンポーネント。
 * 状態は持たず、値と更新関数を MailEditor から受け取る。
 */
export function EditorPanel({ data, errors, onFieldChange }: EditorPanelProps) {
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

      <div className="animate-rise" style={{ animationDelay: '80ms' }}>
        <UrlInput
          value={data.url}
          error={errors.url}
          onChange={(value) => onFieldChange('url', value)}
        />
      </div>

      <div className="animate-rise" style={{ animationDelay: '160ms' }}>
        <ImageInput
          value={data.imageUrl}
          error={errors.imageUrl}
          onChange={(value) => onFieldChange('imageUrl', value)}
        />
      </div>

      <div className="animate-rise" style={{ animationDelay: '240ms' }}>
        <TextInput value={data.text} onChange={(value) => onFieldChange('text', value)} />
      </div>

      <p className="border-rule text-ink-faint border-t px-6 py-6 text-[12px] leading-relaxed sm:px-8">
        入力内容はブラウザ上でのみ扱われ、どこにも保存・送信されません。
      </p>
    </section>
  );
}
