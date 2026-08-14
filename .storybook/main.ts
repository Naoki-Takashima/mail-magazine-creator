import type { StorybookConfig } from '@storybook/nextjs-vite';

/*
 * ストーリーは対象コンポーネントの隣に置く（テストと同じコロケーション）。
 * ビルダーは Vite。Tailwind は postcss.config.mjs を Vite が自動で拾うため、
 * ここに追加の設定は要らない（トークンの読み込みは preview.ts の globals.css）。
 */
const config: StorybookConfig = {
  stories: ['../components/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  // AppHeader が next/image で /mmc_icon.png を読むため
  staticDirs: ['../public'],
};

export default config;
