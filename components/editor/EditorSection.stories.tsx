import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { EditorSection } from '@/components/editor/EditorSection';

/**
 * 入力エリアをブロック単位で区切る枠。
 * 枠線で囲わず、余白と 1px の区切り線だけで境界を示している。
 */
const meta = {
  title: 'editor/EditorSection',
  component: EditorSection,
  args: {
    title: '03 帯バナー',
    children: <p className="text-fg-soft text-[13px]">ここに入力欄が並ぶ</p>,
  },
} satisfies Meta<typeof EditorSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
  name: '必須',
  args: {
    title: '02 件名',
    required: true,
  },
};

export const WithMeta: Story = {
  name: '件数の補助表示つき',
  args: {
    title: '04 大バナー',
    meta: '最大3件',
  },
};

export const Stacked: Story = {
  name: '連続して並べたとき',
  render: () => (
    <>
      <EditorSection title="01 配信日" required>
        <p className="text-fg-soft text-[13px]">1つ目のブロック</p>
      </EditorSection>
      <EditorSection title="02 件名" required>
        <p className="text-fg-soft text-[13px]">2つ目のブロック</p>
      </EditorSection>
      <EditorSection title="03 帯バナー" meta="最大1件">
        <p className="text-fg-soft text-[13px]">3つ目のブロック</p>
      </EditorSection>
    </>
  ),
};
