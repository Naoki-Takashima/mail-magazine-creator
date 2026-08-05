import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'メルマガ作成ツール | リアルタイムプレビュー',
  description:
    'URL・画像・テキストを入力すると、HTMLメールの見た目をその場で確認できるメルマガ作成ツール。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      {/*
        lg 以上はビューポートを固定し、スクロールはエディタ列が内部で担当する
        （プレビューを常に 100vh 内に留めるため）。
        小画面では従来どおりページ全体がスクロールする。
      */}
      <body className="flex min-h-full flex-col lg:h-full lg:overflow-hidden">{children}</body>
    </html>
  );
}
