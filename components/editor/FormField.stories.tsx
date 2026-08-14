import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { describedBy, fieldClassName, FormField } from '@/components/editor/FormField';

/**
 * ラベル・エラーの見た目と a11y 結線を担う共通部品。
 * 入力欄そのものは children なので、ここでは素の <input> を差して見た目だけを確認する。
 */
const meta = {
  title: 'editor/FormField',
  component: FormField,
  args: {
    label: '件名',
    fieldId: 'subject',
    children: null,
  },
  render: (args) => (
    <FormField {...args}>
      <input
        id={args.fieldId}
        defaultValue=""
        placeholder="8月号のお知らせ"
        aria-invalid={args.error !== undefined}
        aria-describedby={describedBy(args.fieldId, args.error !== undefined)}
        className={fieldClassName}
      />
    </FormField>
  ),
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  name: 'エラーあり',
  args: {
    error: '件名を入力してください',
  },
};

export const LongLabel: Story = {
  name: '長いラベル',
  args: {
    label: 'ボタンの文字色（カラーピッカーまたは色コードで指定）',
  },
};
