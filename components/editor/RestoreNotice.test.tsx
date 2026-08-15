import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RestoreNotice } from '@/components/editor/RestoreNotice';

describe('RestoreNotice', () => {
  it('復元したことを読み上げに届く形で伝える', () => {
    render(<RestoreNotice onDiscard={jest.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent('前回の入力を復元しました');
  });

  it('「破棄する」で onDiscard を呼ぶ', async () => {
    const onDiscard = jest.fn();
    render(<RestoreNotice onDiscard={onDiscard} />);

    await userEvent.click(screen.getByRole('button', { name: '破棄する' }));

    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('フォーム内に置いても送信ボタンにならない', () => {
    render(<RestoreNotice onDiscard={jest.fn()} />);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});
