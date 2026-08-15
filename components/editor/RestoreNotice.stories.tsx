import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { RestoreNotice } from '@/components/editor/RestoreNotice';

/**
 * 保存済みの下書きを復元した直後にだけ出る帯。
 */
const meta = {
  title: 'editor/RestoreNotice',
  component: RestoreNotice,
  args: {
    onDiscard: fn(),
  },
} satisfies Meta<typeof RestoreNotice>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
