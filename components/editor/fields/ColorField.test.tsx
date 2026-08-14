import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ColorField } from '@/components/editor/fields/ColorField';
import { DEFAULT_TEXT_COLOR } from '@/types/mail';

function renderColorField(value: string, onChange = jest.fn()) {
  render(
    <ColorField
      fieldId="title-color"
      label="タイトル文字色"
      value={value}
      onChange={onChange}
      fallbackColor={DEFAULT_TEXT_COLOR}
    />,
  );

  return {
    onChange,
    textInput: screen.getByLabelText('タイトル文字色'),
    picker: screen.getByLabelText('タイトル文字色をカラーピッカーで選ぶ'),
  };
}

describe('ColorField', () => {
  it('テキスト欄とカラーピッカーの両方から編集できる', async () => {
    const { onChange, textInput, picker } = renderColorField('');

    await userEvent.type(textInput, '#');
    expect(onChange).toHaveBeenCalledWith('#');

    // <input type="color"> はキーボード入力ではなく値の変更で動く
    fireEvent.change(picker, { target: { value: '#2383e2' } });
    expect(onChange).toHaveBeenCalledWith('#2383e2');
  });

  it('3桁の色コードはピッカーに6桁で渡す', () => {
    const { picker } = renderColorField('#fff');

    expect(picker).toHaveValue('#ffffff');
  });

  it('不正な色コードでもピッカーは fallback を表示し、テキスト欄は入力値のまま', () => {
    const { picker, textInput } = renderColorField('red');

    expect(picker).toHaveValue(DEFAULT_TEXT_COLOR);
    expect(textInput).toHaveValue('red');
  });

  it('プレースホルダに fallback の色コードを出す', () => {
    const { textInput } = renderColorField('');

    expect(textInput).toHaveAttribute('placeholder', DEFAULT_TEXT_COLOR);
  });

  it('エラーはテキスト欄にだけ結ぶ（ピッカーは不正な値を持てないため）', () => {
    render(
      <ColorField
        fieldId="title-color"
        label="タイトル文字色"
        value="red"
        onChange={jest.fn()}
        fallbackColor={DEFAULT_TEXT_COLOR}
        error="色コードで入力してください"
      />,
    );

    expect(screen.getByLabelText('タイトル文字色')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('タイトル文字色をカラーピッカーで選ぶ')).not.toHaveAttribute(
      'aria-invalid',
    );
  });
});
