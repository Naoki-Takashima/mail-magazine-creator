import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect, useState } from 'react';
import { fn } from 'storybook/test';

import { TextField } from '@/components/editor/fields/TextField';

/**
 * テキスト1行の入力欄。
 * 実際の値は親（MailEditor）が持つ制御コンポーネントなので、
 * ストーリー側でも state を持たせて打てるようにしている。
 */
const meta = {
  title: 'editor/fields/TextField',
  component: TextField,
  args: {
    fieldId: 'subject',
    label: '件名',
    value: '',
    placeholder: '8月号のお知らせ',
    onChange: fn(),
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    // Controls から value を変えたときにも追従させる
    useEffect(() => setValue(args.value), [args.value]);

    return (
      <TextField
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange(next);
        }}
      />
    );
  },
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  name: '未入力',
};

export const Filled: Story = {
  name: '入力済み',
  args: {
    value: '8月号のお知らせ',
  },
};

export const WithError: Story = {
  name: 'エラーあり',
  args: {
    error: '件名を入力してください',
  },
};

export const WithMaxLength: Story = {
  name: '文字数制限つき（3カラムの太字テキスト）',
  args: {
    fieldId: 'bold-text',
    label: '太字テキスト',
    value: '新商品のご案内',
    placeholder: '10文字まで',
    maxLength: 10,
  },
};
