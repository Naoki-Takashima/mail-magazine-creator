import { render, screen } from '@testing-library/react';

import { describedBy, errorId, FormField } from '@/components/editor/FormField';

describe('FormField', () => {
  it('ラベルと children の入力欄を id で結線する', () => {
    render(
      <FormField label="件名" fieldId="subject">
        <input id="subject" />
      </FormField>,
    );

    expect(screen.getByLabelText('件名')).toBeInTheDocument();
  });

  it('エラーがあれば role="alert" で読み上げさせる', () => {
    render(
      <FormField label="件名" fieldId="subject" error="件名を入力してください">
        <input id="subject" />
      </FormField>,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('件名を入力してください');
    expect(alert).toHaveAttribute('id', 'subject-error');
  });

  it('エラーが無ければ alert を出さない', () => {
    render(
      <FormField label="件名" fieldId="subject">
        <input id="subject" />
      </FormField>,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('errorId / describedBy', () => {
  it('errorId は fieldId から一意なエラーidを作る', () => {
    expect(errorId('subject')).toBe('subject-error');
  });

  it('describedBy はエラーがあるときだけ id を返す', () => {
    expect(describedBy('subject', true)).toBe('subject-error');
    expect(describedBy('subject', false)).toBeUndefined();
  });
});
