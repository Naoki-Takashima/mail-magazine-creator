import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect, useState } from 'react';
import { fn } from 'storybook/test';

import { TitleFields } from '@/components/editor/TitleFields';
import { DEFAULT_TEXT_COLOR, type EditableBlockTitleField } from '@/types/mail';

/**
 * 「タイトル + タイトル文字色」の組。
 * カラムボックス・下部大バナー・トピックスで共用する。
 */
const meta = {
  title: 'editor/TitleFields',
  component: TitleFields,
  args: {
    idPrefix: 'topics',
    title: '',
    titleColor: DEFAULT_TEXT_COLOR,
    onChange: fn(),
  },
  render: function Render(args) {
    const [values, setValues] = useState({ title: args.title, titleColor: args.titleColor });
    useEffect(
      () => setValues({ title: args.title, titleColor: args.titleColor }),
      [args.title, args.titleColor],
    );

    const handleChange = (field: EditableBlockTitleField, value: string) => {
      setValues((previous) => ({ ...previous, [field]: value }));
      args.onChange(field, value);
    };

    return <TitleFields {...args} {...values} onChange={handleChange} />;
  },
} satisfies Meta<typeof TitleFields>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  name: '入力済み',
  args: {
    title: '今月のおすすめ',
    titleColor: '#2383e2',
  },
};

export const CustomPlaceholder: Story = {
  name: 'placeholder 差し替え',
  args: {
    idPrefix: 'bottom-banner',
    placeholder: 'ピックアップ',
  },
};
