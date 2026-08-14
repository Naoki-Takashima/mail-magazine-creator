import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { ColumnSetCard } from '@/components/editor/ColumnSetCard';
import {
  COLUMN_VARIANT_CONFIG,
  createColumnButton,
  createColumnItem,
  createColumnSet,
  MAX_COLUMN_ITEMS,
  type ColumnItem,
  type ColumnSet,
} from '@/types/mail';

function itemWith(id: string, values: Partial<ColumnItem>): ColumnItem {
  return { ...createColumnItem(id), ...values };
}

const FILLED_SET: ColumnSet = {
  ...createColumnSet('set-1'),
  title: '今月のおすすめ',
  titleColor: '#2383e2',
  items: [
    itemWith('item-1', {
      url: 'https://example.com/a',
      imageUrl: 'https://example.com/a.png',
      boldText: '新商品',
      normalText: '今月入荷したばかりの新商品です',
    }),
    itemWith('item-2', { boldText: '定番', normalText: '長く売れている定番の商品' }),
  ],
  buttons: [
    { ...createColumnButton('button-1'), text: '一覧を見る', url: 'https://example.com/list' },
  ],
};

/**
 * 「タイトル + アイテム + 末尾ボタン」の1セット。
 * 3カラム / 2カラムは同一実装で、差は COLUMN_VARIANT_CONFIG（列数・文字数上限）だけ。
 *
 * 追加・削除の各操作はここではスパイ（fn）なので、押しても件数は変わらない。
 */
const meta = {
  title: 'editor/ColumnSetCard',
  component: ColumnSetCard,
  args: {
    set: FILLED_SET,
    config: COLUMN_VARIANT_CONFIG.three,
    idPrefix: 'three-set-0',
    position: 0,
    onSetFieldChange: fn(),
    onRemoveSet: fn(),
    onAddItem: fn(),
    onRemoveItem: fn(),
    onItemFieldChange: fn(),
    onAddButton: fn(),
    onRemoveButton: fn(),
    onButtonFieldChange: fn(),
  },
} satisfies Meta<typeof ColumnSetCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ThreeColumn: Story = {
  name: '3カラム（太字10文字まで・ノーマルテキストなし）',
};

export const TwoColumn: Story = {
  name: '2カラム（太字15文字まで・ノーマルテキストあり）',
  args: {
    config: COLUMN_VARIANT_CONFIG.two,
    idPrefix: 'two-set-0',
  },
};

export const EmptySet: Story = {
  name: '追加直後（アイテム0件）',
  args: {
    set: createColumnSet('set-empty'),
  },
};

export const WithErrors: Story = {
  name: 'URLエラーあり',
  args: {
    set: {
      ...FILLED_SET,
      items: [itemWith('item-1', { url: 'example.com', boldText: '新商品' })],
    },
    errors: {
      items: {
        'item-1': { url: 'http:// または https:// で始まるURLを入力してください' },
      },
    },
  },
};

export const ItemsFull: Story = {
  name: 'アイテムが上限に達したとき',
  args: {
    set: {
      ...createColumnSet('set-full'),
      items: Array.from({ length: MAX_COLUMN_ITEMS }, (_, index) =>
        itemWith(`item-${index}`, { boldText: `アイテム${index + 1}` }),
      ),
    },
  },
};
