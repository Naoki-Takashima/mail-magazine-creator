import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TitleFields } from '@/components/editor/TitleFields';
import { DEFAULT_TEXT_COLOR } from '@/types/mail';

describe('TitleFields', () => {
  it('変更をフィールド名つきで通知する', async () => {
    const onChange = jest.fn();
    render(
      <TitleFields
        idPrefix="topics"
        title=""
        titleColor={DEFAULT_TEXT_COLOR}
        onChange={onChange}
      />,
    );

    await userEvent.type(screen.getByLabelText('タイトル'), 'あ');

    expect(onChange).toHaveBeenCalledWith('title', 'あ');
  });

  it('idPrefix で入力欄の id を分けるので、同じ画面に複数置ける', () => {
    render(
      <>
        <TitleFields
          idPrefix="topics"
          title="トピックス"
          titleColor={DEFAULT_TEXT_COLOR}
          onChange={jest.fn()}
        />
        <TitleFields
          idPrefix="bottom-banner"
          title="ピックアップ"
          titleColor={DEFAULT_TEXT_COLOR}
          onChange={jest.fn()}
        />
      </>,
    );

    const [first, second] = screen.getAllByLabelText('タイトル');
    expect(first).toHaveAttribute('id', 'topics-title');
    expect(second).toHaveAttribute('id', 'bottom-banner-title');
    expect(first).toHaveValue('トピックス');
    expect(second).toHaveValue('ピックアップ');
  });

  it('placeholder を差し替えられる', () => {
    render(
      <TitleFields
        idPrefix="topics"
        title=""
        titleColor={DEFAULT_TEXT_COLOR}
        onChange={jest.fn()}
        placeholder="トピックス"
      />,
    );

    expect(screen.getByLabelText('タイトル')).toHaveAttribute('placeholder', 'トピックス');
  });
});
