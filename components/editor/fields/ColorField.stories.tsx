import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect, useState } from 'react';
import { fn } from 'storybook/test';

import { ColorField } from '@/components/editor/fields/ColorField';
import { DEFAULT_TEXT_COLOR } from '@/types/mail';

/**
 * カラーピッカーと色コードのテキスト欄を並べた入力。
 * どちらから編集しても同じ値を更新する。
 */
const meta = {
  title: 'editor/fields/ColorField',
  component: ColorField,
  args: {
    fieldId: 'title-color',
    label: 'タイトル文字色',
    value: DEFAULT_TEXT_COLOR,
    fallbackColor: DEFAULT_TEXT_COLOR,
    onChange: fn(),
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    useEffect(() => setValue(args.value), [args.value]);

    return (
      <ColorField
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange(next);
        }}
      />
    );
  },
} satisfies Meta<typeof ColorField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ShortHex: Story = {
  name: '3桁の色コード（ピッカーには6桁で渡る）',
  args: {
    value: '#fff',
  },
};

export const Accent: Story = {
  name: '任意の色',
  args: {
    value: '#2383e2',
  },
};

export const InvalidValue: Story = {
  name: '不正な値（ピッカーは fallback を表示）',
  args: {
    value: 'red',
  },
};
