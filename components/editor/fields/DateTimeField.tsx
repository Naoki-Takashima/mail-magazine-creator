'use client';

import { useState } from 'react';

import { BaseInputField, type FieldProps } from '@/components/editor/fields/BaseInputField';
import { toCompactDateTime, toDatetimeLocalValue } from '@/lib/deliveryDate';

/**
 * 外部とは 'YYYYMMDDhhmm' でやり取りし、input には datetime-local 形式を渡す。
 *
 * 入力途中（年を打っている最中など）は変換結果が空になるため、
 * 表示用の生の値はこのコンポーネント内で保持する。
 * そうしないと入力中に value が '' に戻され、打ち直しになる。
 */
export function DateTimeField({ value, onChange, ...fieldProps }: FieldProps) {
  const [rawValue, setRawValue] = useState(() => toDatetimeLocalValue(value));

  /*
   * 下書きの復元やクリアで value が外から差し替わったときは、表示にも反映する。
   * 打鍵由来の変化は handleChange 側で同期済みとして記録しておくので、
   * 入力途中に変換結果が '' になってもここでは触らない（打ち直しにならない）。
   */
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    setRawValue(toDatetimeLocalValue(value));
  }

  const handleChange = (nextRawValue: string) => {
    const nextValue = toCompactDateTime(nextRawValue);

    setRawValue(nextRawValue);
    setSyncedValue(nextValue);
    onChange(nextValue);
  };

  return (
    <BaseInputField
      {...fieldProps}
      value={rawValue}
      onChange={handleChange}
      inputProps={{ type: 'datetime-local' }}
    />
  );
}
