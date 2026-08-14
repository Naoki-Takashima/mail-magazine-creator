import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TextField } from '@/components/editor/fields/TextField';
import { UrlField } from '@/components/editor/fields/UrlField';

describe('TextField', () => {
  it('入力すると onChange に値だけを渡す（イベントは渡さない）', async () => {
    const onChange = jest.fn();
    render(<TextField fieldId="subject" label="件名" value="" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('件名'), 'あ');

    expect(onChange).toHaveBeenCalledWith('あ');
  });

  it('maxLength をそのまま input に渡す', () => {
    render(
      <TextField
        fieldId="bold"
        label="太字テキスト"
        value=""
        onChange={jest.fn()}
        maxLength={10}
      />,
    );

    expect(screen.getByLabelText('太字テキスト')).toHaveAttribute('maxlength', '10');
  });

  it('エラーが無ければ aria-invalid も aria-describedby も付かない', () => {
    render(<TextField fieldId="subject" label="件名" value="" onChange={jest.fn()} />);

    const input = screen.getByLabelText('件名');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('エラーがあれば aria-invalid とエラー文の結線が付く', () => {
    render(
      <TextField fieldId="subject" label="件名" value="" onChange={jest.fn()} error="必須です" />,
    );

    const input = screen.getByLabelText('件名');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('必須です');
  });
});

describe('UrlField', () => {
  it('URL用の入力タイプで出す', () => {
    render(<UrlField fieldId="banner-url" label="URL" value="" onChange={jest.fn()} />);

    const input = screen.getByLabelText('URL');
    expect(input).toHaveAttribute('type', 'url');
    expect(input).toHaveAttribute('inputmode', 'url');
  });

  it('不正なURLのエラーを読み上げに結ぶ', () => {
    render(
      <UrlField
        fieldId="banner-url"
        label="URL"
        value="not-a-url"
        onChange={jest.fn()}
        error="http:// または https:// で始まるURLを入力してください"
      />,
    );

    expect(screen.getByLabelText('URL')).toHaveAccessibleDescription(
      'http:// または https:// で始まるURLを入力してください',
    );
  });
});
