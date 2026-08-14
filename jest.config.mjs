import nextJest from 'next/jest.js';

/*
 * next/jest が SWC でのトランスパイル・CSS / 画像のモック・
 * tsconfig の paths 解決までまとめて面倒を見る（Babel 設定は不要）。
 *
 * 設定ファイルを .ts ではなく .mjs にしているのは、
 * TypeScript の設定ファイルを読ませるための追加の依存を増やさないため。
 */
const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // paths の解決は next/jest が SWC 側で行うが、jest の解決器にも同じ対応を教えておく
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/**/*.ts',
    'hooks/**/*.ts',
    'components/**/*.tsx',
    '!**/*.stories.tsx',
    '!**/*.test.{ts,tsx}',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/storybook-static/'],
};

export default createJestConfig(config);
