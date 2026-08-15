import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ClearDraftButton } from '@/components/editor/ClearDraftButton';

describe('ClearDraftButton', () => {
  it('1度目のクリックでは消さず、確認を出す', async () => {
    const onClear = jest.fn();
    render(<ClearDraftButton onClear={onClear} />);

    await userEvent.click(screen.getByRole('button', { name: '入力をすべてクリア' }));

    expect(onClear).not.toHaveBeenCalled();
    expect(screen.getByText('入力をすべて消しますか？')).toBeInTheDocument();
  });

  it('確認して「消す」を押すと onClear を呼ぶ', async () => {
    const onClear = jest.fn();
    render(<ClearDraftButton onClear={onClear} />);

    await userEvent.click(screen.getByRole('button', { name: '入力をすべてクリア' }));
    await userEvent.click(screen.getByRole('button', { name: '消す' }));

    expect(onClear).toHaveBeenCalledTimes(1);
    // 消したあとは元のボタンに戻る
    expect(screen.getByRole('button', { name: '入力をすべてクリア' })).toBeInTheDocument();
  });

  it('「やめる」を押すと何もせず元に戻る', async () => {
    const onClear = jest.fn();
    render(<ClearDraftButton onClear={onClear} />);

    await userEvent.click(screen.getByRole('button', { name: '入力をすべてクリア' }));
    await userEvent.click(screen.getByRole('button', { name: 'やめる' }));

    expect(onClear).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '入力をすべてクリア' })).toBeInTheDocument();
  });

  it('フォーム内に置いても送信ボタンにならない', async () => {
    render(<ClearDraftButton onClear={jest.fn()} />);

    const trigger = screen.getByRole('button', { name: '入力をすべてクリア' });
    expect(trigger).toHaveAttribute('type', 'button');

    await userEvent.click(trigger);
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('type', 'button');
    }
  });
});
