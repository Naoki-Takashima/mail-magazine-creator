import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ButtonFields } from '@/components/editor/ButtonFields';
import {
  DEFAULT_BUTTON_BG_COLOR,
  DEFAULT_BUTTON_TEXT_COLOR,
  type ButtonContent,
} from '@/types/mail';

const EMPTY_BUTTON: ButtonContent = {
  url: '',
  text: '',
  textColor: DEFAULT_BUTTON_TEXT_COLOR,
  bgColor: DEFAULT_BUTTON_BG_COLOR,
};

describe('ButtonFields', () => {
  it('ボタンの4項目を出す', () => {
    render(<ButtonFields idPrefix="topics-button" button={EMPTY_BUTTON} onChange={jest.fn()} />);

    expect(screen.getByLabelText('ボタンテキスト')).toBeInTheDocument();
    expect(screen.getByLabelText('ボタンURL')).toBeInTheDocument();
    expect(screen.getByLabelText('文字色')).toBeInTheDocument();
    expect(screen.getByLabelText('背景色')).toBeInTheDocument();
  });

  it('テキストの変更を text として通知する', async () => {
    const onChange = jest.fn();
    render(<ButtonFields idPrefix="topics-button" button={EMPTY_BUTTON} onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('ボタンテキスト'), 'あ');

    expect(onChange).toHaveBeenCalledWith('text', 'あ');
  });

  it('URLの変更を url として通知する', async () => {
    const onChange = jest.fn();
    render(<ButtonFields idPrefix="topics-button" button={EMPTY_BUTTON} onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('ボタンURL'), 'h');

    expect(onChange).toHaveBeenCalledWith('url', 'h');
  });

  it('URLのエラーだけをURL欄に結ぶ', () => {
    render(
      <ButtonFields
        idPrefix="topics-button"
        button={{ ...EMPTY_BUTTON, url: 'not-a-url' }}
        errors={{ url: 'http:// または https:// で始まるURLを入力してください' }}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('ボタンURL')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('ボタンテキスト')).toHaveAttribute('aria-invalid', 'false');
  });

  it('文字色と背景色は既定色を fallback にする', () => {
    render(<ButtonFields idPrefix="topics-button" button={EMPTY_BUTTON} onChange={jest.fn()} />);

    expect(screen.getByLabelText('文字色をカラーピッカーで選ぶ')).toHaveValue(
      DEFAULT_BUTTON_TEXT_COLOR,
    );
    expect(screen.getByLabelText('背景色をカラーピッカーで選ぶ')).toHaveValue(
      DEFAULT_BUTTON_BG_COLOR,
    );
  });
});
