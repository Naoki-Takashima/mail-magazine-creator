import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { TestDeliveryDialog } from '@/components/preview/TestDeliveryDialog';
import type { TestDeliveryResult } from '@/lib/testDelivery';

type SetupOptions = {
  subject?: string;
  initialEmail?: string;
  onClose?: () => void;
  onSend?: (to: string) => Promise<TestDeliveryResult>;
};

/** 宛先は親が持つ作りなので、テストでも同じように包んで入力できるようにする */
function Harness({
  subject = '8月号のお知らせ',
  initialEmail = '',
  onClose,
  onSend,
}: SetupOptions) {
  const [email, setEmail] = useState(initialEmail);

  return (
    <TestDeliveryDialog
      subject={subject}
      email={email}
      onEmailChange={setEmail}
      onClose={onClose ?? jest.fn()}
      onSend={onSend ?? jest.fn().mockResolvedValue({ ok: true })}
    />
  );
}

const emailField = () => screen.getByLabelText('送信先メールアドレス');
const sendButton = () => screen.getByRole('button', { name: '送信' });

describe('TestDeliveryDialog', () => {
  // 自動クローズを見るテストが偽のタイマーを使うので、必ず本物に戻す
  afterEach(() => {
    jest.useRealTimers();
  });

  it('送るメールの件名を表示する', () => {
    render(<Harness subject="8月号のお知らせ" />);

    expect(screen.getByText('8月号のお知らせ')).toBeInTheDocument();
  });

  it('件名が未入力なら未入力と出す', () => {
    render(<Harness subject="   " />);

    expect(screen.getByText('未入力')).toBeInTheDocument();
  });

  it('打鍵している間はエラーを出さない', async () => {
    render(<Harness />);

    await userEvent.type(emailField(), 'test');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('フォーカスが外れた時点で形式エラーを出す', async () => {
    render(<Harness />);

    await userEvent.type(emailField(), 'test');
    await userEvent.tab();

    expect(screen.getByText('メールアドレスの形式で入力してください')).toBeInTheDocument();
    expect(emailField()).toHaveAttribute('aria-invalid', 'true');
  });

  it('未入力のまま送信すると理由を出し、送信しない', async () => {
    const onSend = jest.fn();
    render(<Harness onSend={onSend} />);

    await userEvent.click(sendButton());

    expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument();
    expect(onSend).not.toHaveBeenCalled();
  });

  it('形式が不正なまま送信しても送信しない', async () => {
    const onSend = jest.fn();
    render(<Harness initialEmail="test@example" onSend={onSend} />);

    await userEvent.click(sendButton());

    expect(screen.getByText('メールアドレスの形式で入力してください')).toBeInTheDocument();
    expect(onSend).not.toHaveBeenCalled();
  });

  it('正しい宛先なら前後の空白を落として1回だけ送る', async () => {
    const onSend = jest.fn().mockResolvedValue({ ok: true });
    render(<Harness initialEmail="  test@example.com  " onSend={onSend} />);

    await userEvent.click(sendButton());

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith('test@example.com');
  });

  it('送信中はボタンを押せなくする（二重送信の防止）', async () => {
    // 解決を握っておき、送信中の状態で止める
    let resolveSend: (result: TestDeliveryResult) => void = () => {};
    const onSend = jest.fn(
      () =>
        new Promise<TestDeliveryResult>((resolve) => {
          resolveSend = resolve;
        }),
    );
    render(<Harness initialEmail="test@example.com" onSend={onSend} />);

    await userEvent.click(sendButton());

    const sending = screen.getByRole('button', { name: '送信中…' });
    expect(sending).toBeDisabled();

    resolveSend({ ok: true });
    await waitFor(() => expect(screen.getByText('送信しました')).toBeInTheDocument());
  });

  it('成功したら送信しましたを出し、少し置いてから閉じる', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onClose = jest.fn();

    render(<Harness initialEmail="test@example.com" onClose={onClose} />);
    await user.click(sendButton());
    // onSend の解決は次のマイクロタスクなので、反映を待ってから見る
    await waitFor(() => expect(screen.getByText('送信しました')).toBeInTheDocument());

    // まだ閉じない（成功を読む時間を置く）
    expect(onClose).not.toHaveBeenCalled();

    act(() => jest.runAllTimers());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('失敗したらモーダルに理由を残し、閉じない', async () => {
    const onClose = jest.fn();
    const onSend = jest
      .fn()
      .mockResolvedValue({ ok: false, message: '配信日と件名を入力してください' });
    render(<Harness initialEmail="test@example.com" onClose={onClose} onSend={onSend} />);

    await userEvent.click(sendButton());

    expect(await screen.findByText('配信日と件名を入力してください')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    // 直してそのまま送り直せる
    expect(screen.getByRole('button', { name: '送信' })).toBeEnabled();
  });

  it('キャンセルを押すと閉じる', async () => {
    const onClose = jest.fn();
    render(<Harness onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: 'キャンセル' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
