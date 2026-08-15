import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { ClearDraftButton } from '@/components/editor/ClearDraftButton';

/**
 * 入力を全部消すボタン。押すと同じ場所が確認の並びに変わる。
 * 確認の状態はコンポーネントの中に閉じているので、Story からは初期状態だけ出せる。
 */
const meta = {
  title: 'editor/ClearDraftButton',
  component: ClearDraftButton,
  args: {
    onClear: fn(),
  },
} satisfies Meta<typeof ClearDraftButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
