type MailFrameProps = {
  /** buildMailHtml が生成した完全なHTML文書 */
  html: string;
};

/**
 * プレビューを iframe の srcDoc で描画する。
 *
 * - 親ページの Tailwind（preflight を含む）がプレビューに漏れないため、
 *   実際のメールクライアントに近い素の見た目を確認できる
 * - sandbox から allow-scripts を外し、入力値がスクリプトとして走る余地を無くす
 *   （リンクを新しいタブで開くための allow-popups 系のみ許可）
 */
export function MailFrame({ html }: MailFrameProps) {
  return (
    <iframe
      title="メルマガのプレビュー"
      srcDoc={html}
      sandbox="allow-popups allow-popups-to-escape-sandbox"
      className="bg-card h-full min-h-[420px] w-full border-0"
    />
  );
}
