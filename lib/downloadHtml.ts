/**
 * 文字列を .html ファイルとしてダウンロードさせる。
 *
 * サーバーを介さずブラウザ内で完結させたいので、Blob と <a download> だけで組む。
 * BOM は付けない（HTML 側に <meta charset="utf-8"> があり、file:// で開いても化けない）。
 */
export function downloadHtml(fileName: string, html: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  // click 直後に解放するとダウンロードが始まらない環境があるため、次のタスクまで待つ
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
