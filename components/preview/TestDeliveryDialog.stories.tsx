import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { TestDeliveryDialog } from '@/components/preview/TestDeliveryDialog';
import type { TestDeliveryResult } from '@/lib/testDelivery';

/**
 * テスト配信の宛先を入力するモーダル。
 *
 * 宛先の値は親（TestDelivery）が持つので、Story 側でも state を用意して繋ぐ。
 * 送信中・成功・失敗はコンポーネントの中に閉じているため、
 * onSend の返し方を変えることで見せ分ける。
 */
const meta = {
  title: 'preview/TestDeliveryDialog',
  component: TestDeliveryDialog,
  parameters: { layout: 'fullscreen' },
  args: {
    subject: '8月号のお知らせ',
    email: '',
    onEmailChange: fn(),
    onClose: fn(),
    onSend: fn(async (): Promise<TestDeliveryResult> => ({ ok: true })),
  },
  render: function Render(args) {
    const [email, setEmail] = useState(args.email);

    return <TestDeliveryDialog {...args} email={email} onEmailChange={setEmail} />;
  },
} satisfies Meta<typeof TestDeliveryDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 件名を入れていない状態。何を送るのか分かるよう「未入力」と出す */
export const SubjectUnset: Story = {
  args: { subject: '' },
};

/** 送信が終わらない状態。ボタンは「送信中…」で押せなくなる */
export const Sending: Story = {
  args: {
    email: 'test@example.com',
    onSend: fn(() => new Promise<TestDeliveryResult>(() => {})),
  },
};

/** 送信に失敗した状態。理由はモーダルに残り、直してそのまま送り直せる */
export const Failed: Story = {
  args: {
    email: 'test@example.com',
    onSend: fn(async (): Promise<TestDeliveryResult> => ({
      ok: false,
      message: '送信に失敗しました。しばらくしてから再度お試しください',
    })),
  },
};
