'use client';

import { useCallback, useState } from 'react';

import { TestDeliveryDialog } from '@/components/preview/TestDeliveryDialog';
import type { TestDeliveryResult } from '@/lib/testDelivery';

type TestDeliveryProps = {
  subject: string;
  onSend: (to: string) => Promise<TestDeliveryResult>;
};

/**
 * テスト配信の起動ボタンとモーダルをまとめた殻。
 *
 * 宛先をここで持つのは、モーダルが開いているあいだしかマウントされないため。
 * 別のアドレスへ続けて送る流れが多いので、閉じても入力は残す。
 * ここで扱うのは画面の状態だけで、MailData には触れない（下書きにも保存されない）。
 */
export function TestDelivery({ subject, onSend }: TestDeliveryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="border-rule bg-canvas text-fg hover:border-accent hover:text-accent focus-visible:outline-accent shrink-0 rounded-xl border px-4 py-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        テスト配信
      </button>

      {isOpen ? (
        <TestDeliveryDialog
          subject={subject}
          email={email}
          onEmailChange={setEmail}
          onClose={close}
          onSend={onSend}
        />
      ) : null}
    </>
  );
}
