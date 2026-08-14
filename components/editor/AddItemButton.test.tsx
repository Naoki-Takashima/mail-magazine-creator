import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AddItemButton } from '@/components/editor/AddItemButton';

describe('AddItemButton', () => {
  it('押せるときは label を出し、クリックで onClick を呼ぶ', async () => {
    const onClick = jest.fn();
    render(
      <AddItemButton
        label="+ バナーを追加"
        fullLabel="上限に達しました"
        disabled={false}
        onClick={onClick}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '+ バナーを追加' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('上限に達したときは fullLabel を出し、クリックしても呼ばれない', async () => {
    const onClick = jest.fn();
    render(
      <AddItemButton
        label="+ バナーを追加"
        fullLabel="上限に達しました"
        disabled
        onClick={onClick}
      />,
    );

    const button = screen.getByRole('button', { name: '上限に達しました' });
    expect(button).toBeDisabled();

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('フォーム内に置いても送信ボタンにならない', () => {
    render(<AddItemButton label="追加" fullLabel="上限" disabled={false} onClick={jest.fn()} />);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});
