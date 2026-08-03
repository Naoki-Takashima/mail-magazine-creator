import type { Metadata } from 'next';
import { IBM_Plex_Mono, Zen_Old_Mincho } from 'next/font/google';
import './globals.css';

/** 見出し・ワードマーク用。明朝の骨格で「印刷物」の雰囲気を出す */
const displaySerif = Zen_Old_Mincho({
  variable: '--font-display-serif',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

/** ラベル・注記用。校正指示のような等幅の小文字組み */
const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

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
    <html lang="ja" className={`${displaySerif.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
