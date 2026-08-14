import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect, useState } from 'react';
import { fn } from 'storybook/test';

import { TopicItemCard } from '@/components/editor/TopicItemCard';
import { createTopicItem } from '@/types/mail';

/**
 * トピックス1件ぶんの入力。最大8件並ぶため <details> の折りたたみにしてある。
 * 先頭（position: 0）だけが開いた状態で表示される。
 */
const meta = {
  title: 'editor/TopicItemCard',
  component: TopicItemCard,
  args: {
    item: createTopicItem('topic-1'),
    idPrefix: 'topic-0',
    position: 0,
    onFieldChange: fn(),
    onRemove: fn(),
  },
  render: function Render(args) {
    const [item, setItem] = useState(args.item);
    useEffect(() => setItem(args.item), [args.item]);

    return (
      <TopicItemCard
        {...args}
        item={item}
        onFieldChange={(itemId, field, value) => {
          setItem((previous) => ({ ...previous, [field]: value }));
          args.onFieldChange(itemId, field, value);
        }}
      />
    );
  },
} satisfies Meta<typeof TopicItemCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  name: '未入力（見出しは「（未入力）」）',
};

export const Filled: Story = {
  name: '入力済み',
  args: {
    item: {
      ...createTopicItem('topic-1'),
      url: 'https://example.com/news',
      imageUrl: 'https://example.com/topic.png',
      boldText: 'サービス統合のお知らせ',
      normalText: '9月1日より新しいプランに統合されます',
      textColor: '#2383e2',
    },
  },
};

export const Collapsed: Story = {
  name: '2件目以降（閉じた状態）',
  args: {
    position: 1,
    idPrefix: 'topic-1',
    item: { ...createTopicItem('topic-2'), boldText: '夏季休業のお知らせ' },
  },
};

export const WithError: Story = {
  name: 'エラーあり（閉じていても「要確認」が出る）',
  args: {
    position: 1,
    idPrefix: 'topic-1',
    item: { ...createTopicItem('topic-2'), url: 'example.com', boldText: '夏季休業のお知らせ' },
    errors: { url: 'http:// または https:// で始まるURLを入力してください' },
  },
};
