import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AddItemButton } from '@/components/editor/AddItemButton';

/**
 * 「+ 追加」の破線ボタン。上限に達すると文言が入れ替わり、押せなくなる。
 */
const meta = {
  title: 'editor/AddItemButton',
  component: AddItemButton,
  args: {
    label: '+ バナーを追加',
    fullLabel: '上限 3 件',
    disabled: false,
    onClick: fn(),
  },
} satisfies Meta<typeof AddItemButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Full: Story = {
  name: '上限に達したとき',
  args: {
    disabled: true,
  },
};
