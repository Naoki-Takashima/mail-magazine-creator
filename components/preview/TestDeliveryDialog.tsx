'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { describedBy, fieldClassName, FormField } from '@/components/editor/FormField';
import type { TestDeliveryResult } from '@/lib/testDelivery';
import { isValidEmail } from '@/lib/validation';

export type TestDeliveryDialogProps = {
  /** 送るメールの件名。何を送ろうとしているかをこの場で確かめられるように出す */
  subject: string;
  email: string;
  onEmailChange: (value: string) => void;
  onClose: () => void;
  /** 宛先を受け取って送る。本文のエラーによる中止も戻り値の message で返る */
  onSend: (to: string) => Promise<TestDeliveryResult>;
};

const FIELD_ID = 'test-delivery-email';
const TITLE_ID = 'test-delivery-title';

/** 成功を読んでから閉じるまでの時間。短すぎると気づけず、長いと操作を止める */
const CLOSE_DELAY_MS = 1200;

const EMPTY_EMAIL_MESSAGE = 'メールアドレスを入力してください';
const INVALID_EMAIL_MESSAGE = 'メールアドレスの形式で入力してください';
const SENT_MESSAGE = '送信しました';

type Status = 'idle' | 'sending' | 'sent' | 'failed';

/**
 * テスト配信の宛先を入力するモーダル。
 *
 * ネイティブの <dialog> + showModal() を使う。Esc で閉じる・背景の操作を止める・
 * フォーカスを閉じ込める、をブラウザが持っているので、追加ライブラリなしで済む。
 *
 * このコンポーネントは開いているあいだだけマウントされる。送信の状態を
 * 開き直すたびに畳み直す必要がなくなり、リセット用の effect を持たずに済む。
 * 宛先だけは閉じても残したいので、値は親（TestDelivery）が持つ。
 */
export function TestDeliveryDialog({
  subject,
  email,
  onEmailChange,
  onClose,
  onSend,
}: TestDeliveryDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 打鍵の途中で赤字が出ないよう、離れるか送信を試みるまでエラーは伏せる
  const [isBlurred, setIsBlurred] = useState(false);
  const [hasTriedSend, setHasTriedSend] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [failureMessage, setFailureMessage] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;

    dialog.showModal();

    // Esc とバックドロップ由来の閉じるは React を通らないので、ここで親に伝える
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, [onClose]);

  // 成功後の自動クローズが、閉じたあとに走らないようにする
  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const trimmedEmail = email.trim();
  const emailError =
    trimmedEmail === ''
      ? EMPTY_EMAIL_MESSAGE
      : isValidEmail(trimmedEmail)
        ? undefined
        : INVALID_EMAIL_MESSAGE;
  const visibleEmailError = isBlurred || hasTriedSend ? emailError : undefined;

  const isSending = status === 'sending';

  const handleSend = useCallback(async () => {
    setHasTriedSend(true);
    if (emailError !== undefined) return;

    setFailureMessage(null);
    setStatus('sending');

    const result = await onSend(trimmedEmail);
    if (result.ok) {
      setStatus('sent');
      closeTimerRef.current = setTimeout(onClose, CLOSE_DELAY_MS);
      return;
    }

    // 宛先を直してそのまま送り直せるよう、失敗はモーダルに残す
    setStatus('failed');
    setFailureMessage(result.message);
  }, [emailError, onClose, onSend, trimmedEmail]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={TITLE_ID}
      className="bg-canvas text-fg m-auto w-[min(28rem,calc(100%-2rem))] rounded-xl p-0 backdrop:bg-black/25"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id={TITLE_ID} className="text-[15px] font-medium">
          テスト配信
        </h2>

        <dl className="border-rule bg-canvas-sunk flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-lg border px-3 py-2.5">
          <dt className="text-fg-soft w-8 shrink-0 text-[12px] font-medium">件名</dt>
          <dd
            className={`min-w-0 flex-1 text-[13px] break-words ${
              subject.trim() === '' ? 'text-fg-faint' : 'text-fg'
            }`}
          >
            {subject.trim() === '' ? '未入力' : subject}
          </dd>
        </dl>

        <FormField label="送信先メールアドレス" fieldId={FIELD_ID} error={visibleEmailError}>
          <input
            id={FIELD_ID}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="test@example.com"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            onBlur={() => setIsBlurred(true)}
            aria-invalid={visibleEmailError !== undefined}
            aria-describedby={describedBy(FIELD_ID, visibleEmailError !== undefined)}
            className={fieldClassName}
          />
        </FormField>

        {failureMessage !== null ? (
          <p role="alert" className="text-danger text-[12px]">
            {failureMessage}
          </p>
        ) : null}

        {status === 'sent' ? (
          <p role="status" className="text-fg-soft text-[12px]">
            {SENT_MESSAGE}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-fg-soft hover:text-fg focus-visible:outline-accent rounded-lg px-4 py-2 text-[14px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            キャンセル
          </button>

          {/*
            送信中だけは disabled にする。「HTML出力ボタンは disabled にしない」のは
            押せない理由を返せないからで、ここは二重送信の防止なので事情が違う
          */}
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending}
            className="bg-accent focus-visible:outline-accent rounded-lg px-4 py-2 text-[14px] font-medium text-white transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
          >
            {isSending ? '送信中…' : '送信'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
