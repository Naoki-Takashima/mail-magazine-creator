import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import storybook from 'eslint-plugin-storybook';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // ストーリーの書き方（CSF）の検査。npm run lint は引数なしで全体を見るため、ここに足しておく
  ...storybook.configs['flat/recommended'],
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // 生成物。中身はビルド済みのJSなので検査対象にしない
    'coverage/**',
    'storybook-static/**',
  ]),
]);

export default eslintConfig;
