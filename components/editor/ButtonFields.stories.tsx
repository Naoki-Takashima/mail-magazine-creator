import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect, useState } from 'react';
import { fn } from 'storybook/test';

import { ButtonFields } from '@/components/editor/ButtonFields';
import {
  DEFAULT_BUTTON_BG_COLOR,
  DEFAULT_BUTTON_TEXT_COLOR,
  type ButtonContent,
} from '@/types/mail';

const EMPTY_BUTTON: ButtonContent = {
  url: '',
  text: '',
  textColor: DEFAULT_BUTTON_TEXT_COLOR,
  bgColor: DEFAULT_BUTTON_BG_COLOR,
};

/**
 * ボタンの4入力（テキスト / URL / 文字色 / 背景色）。
 * カラムボックスのボタンとトピックスのボタンで共用する。
 */
const meta = {
  title: 'editor/ButtonFields',
  component: ButtonFields,
  args: {
    idPrefix: 'topics-button',
    button: EMPTY_BUTTON,
    onChange: fn(),
  },
  render: function Render(args) {
    const [button, setButton] = useState(args.button);
    useEffect(() => setButton(args.button), [args.button]);

    return (
      <ButtonFields
        {...args}
        button={button}
        onChange={(field, value) => {
          setButton((previous) => ({ ...previous, [field]: value }));
          args.onChange(field, value);
        }}
      />
    );
  },
} satisfies Meta<typeof ButtonFields>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  name: '未入力',
};

export const Filled: Story = {
  name: '入力済み',
  args: {
    button: {
      url: 'https://example.com/list',
      text: '一覧を見る',
      textColor: '#ffffff',
      bgColor: '#2383e2',
    },
  },
};

export const WithUrlError: Story = {
  name: 'URLエラーあり',
  args: {
    button: { ...EMPTY_BUTTON, url: 'example.com' },
    errors: { url: 'http:// または https:// で始まるURLを入力してください' },
  },
};
