import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { DateTimeField } from '@/components/editor/fields/DateTimeField';

function renderField(value: string, onChange = jest.fn()) {
  const utils = render(
    <DateTimeField fieldId="delivery-date" label="配信日時" value={value} onChange={onChange} />,
  );

  return { ...utils, onChange, input: screen.getByLabelText('配信日時') as HTMLInputElement };
}

/** MailEditor と同じく、受け取った値をそのまま state に戻す親 */
function ControlledHost({ onChange }: { onChange: (value: string) => void }) {
  const [value, setValue] = useState('');

  return (
    <DateTimeField
      fieldId="delivery-date"
      label="配信日時"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

describe('DateTimeField', () => {
  it('YYYYMMDDhhmm を datetime-local の形で表示する', () => {
    const { input } = renderField('202608051200');

    expect(input.value).toBe('2026-08-05T12:00');
  });

  it('入力すると YYYYMMDDhhmm に変換して渡す', async () => {
    const onChange = jest.fn();
    render(<ControlledHost onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('配信日時'), '2026-08-05T12:00');

    expect(onChange).toHaveBeenLastCalledWith('202608051200');
  });

  // 下書きの復元は「マウントしたあとに value が入る」ので、初期値だけ見ていると反映されない
  it('外から value が差し替わったら表示も追従する（下書きの復元）', () => {
    const { rerender, input } = renderField('');
    expect(input.value).toBe('');

    rerender(
      <DateTimeField
        fieldId="delivery-date"
        label="配信日時"
        value="202608051200"
        onChange={jest.fn()}
      />,
    );

    expect(input.value).toBe('2026-08-05T12:00');
  });

  it('外から空に戻されたら表示も空になる（クリア）', () => {
    const { rerender, input } = renderField('202608051200');

    rerender(
      <DateTimeField fieldId="delivery-date" label="配信日時" value="" onChange={jest.fn()} />,
    );

    expect(input.value).toBe('');
  });

  /*
   * 年を打っている途中は変換結果が '' になる。
   * そこで表示まで '' に巻き戻すと打ち直しになるので、打鍵中は触らない。
   */
  it('入力途中で変換できなくても打った内容が消えない', async () => {
    const onChange = jest.fn();
    render(<ControlledHost onChange={onChange} />);
    const input = screen.getByLabelText('配信日時') as HTMLInputElement;

    await userEvent.type(input, '2026-08-05T12:00');
    expect(input.value).toBe('2026-08-05T12:00');

    // 西暦4桁が埋まっていない間は変換結果が '' になるが、打った内容は残す
    await userEvent.clear(input);
    await userEvent.type(input, '0002-08-05T12:00');

    expect(onChange).toHaveBeenLastCalledWith('');
    expect(input.value).toBe('0002-08-05T12:00');
  });
});
