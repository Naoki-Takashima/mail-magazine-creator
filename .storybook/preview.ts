import type { Preview } from '@storybook/nextjs-vite';

// アプリのテーマトークン（--color-canvas / --color-fg など）と本文フォントの読み込み。
// これが無いとコンポーネントが素の見た目になる。
import '../app/globals.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: {
      matchers: {
        // 色は hex 文字列で持っているので、カラーピッカーで触れるようにする
        color: /(Color|bgColor)$/,
      },
    },
  },
};

export default preview;
