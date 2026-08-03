import { MAIL_WIDTH } from '@/types/mail';

type MailFrameProps = {
  /** buildMailHtml が生成した完全なHTML文書 */
  html: string;
};

/**
 * プレビューを iframe の srcDoc で描画する。縮小率は PhoneMock が
 * CSS 変数 --phone-scale で渡すため、単独では使えない。
 *
 * - 親ページの Tailwind（preflight を含む）がプレビューに漏れないため、
 *   実際のメールクライアントに近い素の見た目を確認できる
 * - sandbox から allow-scripts を外し、入力値がスクリプトとして走る余地を無くす
 *   （リンクを新しいタブで開くための allow-popups 系のみ許可）
 *
 * 描画は常にカード幅（MAIL_WIDTH）で行い、見た目だけ transform で縮小する。
 * プレビュー用のHTMLは body の余白を持たないので、この幅がそのままカードの幅になる。
 * iframe 自体を狭めると、カードが 600px まで伸びられず、
 * 3カラムの固定幅セルがはみ出して横スクロールになるため。
 * 縦のスクロールは iframe が自前で持つので、親側にスクロール領域は作らない。
 *
 * 親には position: relative と overflow: hidden が必要（PhoneMock の画面部分）。
 */
export function MailFrame({ html }: MailFrameProps) {
  return (
    <iframe
      title="メルマガのプレビュー"
      srcDoc={html}
      sandbox="allow-popups allow-popups-to-escape-sandbox"
      className="bg-card absolute top-0 left-0 origin-top-left border-0"
      style={{
        width: `${MAIL_WIDTH}px`,
        // 縮小前の高さ。倍率を掛けるとちょうど枠の高さに戻る
        height: 'calc(100% / var(--phone-scale))',
        transform: 'scale(var(--phone-scale))',
      }}
    />
  );
}
