import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect, useState } from 'react';
import { fn } from 'storybook/test';

import { UrlField } from '@/components/editor/fields/UrlField';

/**
 * URL入力欄。http / https 以外はバリデーションで弾かれ、エラー文が出る。
 */
const meta = {
  title: 'editor/fields/UrlField',
  component: UrlField,
  args: {
    fieldId: 'banner-url',
    label: 'URL',
    value: '',
    placeholder: 'https://example.com/campaign',
    onChange: fn(),
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    useEffect(() => setValue(args.value), [args.value]);

    return (
      <UrlField
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange(next);
        }}
      />
    );
  },
} satisfies Meta<typeof UrlField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  name: '未入力',
};

export const Valid: Story = {
  name: '正しいURL',
  args: {
    value: 'https://example.com/campaign',
  },
};

export const Invalid: Story = {
  name: '不正なURL',
  args: {
    value: 'javascript:alert(1)',
    error: 'http:// または https:// で始まるURLを入力してください',
  },
};
