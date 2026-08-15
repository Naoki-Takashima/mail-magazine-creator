import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { TestDelivery } from '@/components/preview/TestDelivery';
import type { TestDeliveryResult } from '@/lib/testDelivery';

/**
 * プレビュー列のメタ欄の右に置く起動ボタン。押すとモーダルが開く。
 * 主要アクションは「HTMLを出力」なので、ここは枠線だけのボタンにしてある。
 */
const meta = {
  title: 'preview/TestDelivery',
  component: TestDelivery,
  args: {
    subject: '8月号のお知らせ',
    onSend: fn(async (): Promise<TestDeliveryResult> => ({ ok: true })),
  },
} satisfies Meta<typeof TestDelivery>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 本文にエラーが残っている状態。送信を押すとモーダルに理由が出る */
export const Blocked: Story = {
  args: {
    subject: '',
    onSend: fn(async (): Promise<TestDeliveryResult> => ({
      ok: false,
      message: '配信日と件名を入力してください',
    })),
  },
};
