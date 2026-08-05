import { MailFrame } from '@/components/preview/MailFrame';
import { PhoneMock } from '@/components/preview/PhoneMock';
import { PreviewMeta } from '@/components/preview/PreviewMeta';
import { SubjectBar } from '@/components/preview/SubjectBar';

type PreviewPanelProps = {
  html: string;
  /** 'YYYYMMDDhhmm'。メール本文には含めず、メタ欄に表示する */
  deliveryDate: string;
  subject: string;
  /** 開閉トグルの aria-controls と対応させる id */
  panelId: string;
};

/**
 * プレビューの「額縁」。メール本文の描画は PhoneMock + MailFrame に委譲する。
 * 用紙を沈めた色 + 方眼テクスチャの上にスマートフォンを1台置いた見え方。
 *
 * lg 以上ではこの列がビューポート高に固定される。縦の取り合いは
 * メタ欄が shrink-0、端末枠が残り全部（flex-1 + min-h-0）。
 * min-h-0 を落とすと中身の高さが列を押し広げて固定が壊れるので消さないこと。
 */
export function PreviewPanel({ html, deliveryDate, subject, panelId }: PreviewPanelProps) {
  return (
    <section
      id={panelId}
      aria-label="プレビュー"
      className="bg-canvas-sunk border-rule relative flex min-w-0 flex-col border-t lg:h-full lg:min-h-0 lg:border-t-0 lg:border-l"
    >
      {/* 見出しは置かない。浮いた高さはそのまま端末枠の高さに回す */}
      <div className="shrink-0 px-4 pt-6 pb-4 sm:px-10">
        <PreviewMeta deliveryDate={deliveryDate} />
      </div>

      {/*
        lg 未満は縦積みなので、列の高さが中身で決まらない。
        端末枠に高さを与えないと潰れるため 70vh を直接指定する
        （1画面に2つのスクロール領域を作らないよう、100vh にはしない）。
      */}
      <div className="h-[70vh] min-h-0 grow basis-auto px-4 pb-8 sm:px-10 lg:h-auto lg:basis-0">
        {/* 件名はデバウンスせず即時反映する（iframe の外なので再読み込みが起きない） */}
        <PhoneMock header={<SubjectBar subject={subject} />}>
          <MailFrame html={html} />
        </PhoneMock>
      </div>
    </section>
  );
}
