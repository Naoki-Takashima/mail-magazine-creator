import { render, screen } from '@testing-library/react';

import { EditorSection } from '@/components/editor/EditorSection';

describe('EditorSection', () => {
  it('見出しと中身を出す', () => {
    render(
      <EditorSection title="帯バナー">
        <p>中身</p>
      </EditorSection>,
    );

    expect(screen.getByRole('heading', { name: '帯バナー' })).toBeInTheDocument();
    expect(screen.getByText('中身')).toBeInTheDocument();
  });

  it('required のときだけ必須マークを出す', () => {
    const { rerender } = render(<EditorSection title="件名">{null}</EditorSection>);
    expect(screen.queryByLabelText('必須')).not.toBeInTheDocument();

    rerender(
      <EditorSection title="件名" required>
        {null}
      </EditorSection>,
    );
    expect(screen.getByLabelText('必須')).toBeInTheDocument();
  });

  it('meta を渡したときだけ補助表示を出す', () => {
    const { rerender } = render(<EditorSection title="大バナー">{null}</EditorSection>);
    expect(screen.queryByText('最大3件')).not.toBeInTheDocument();

    rerender(
      <EditorSection title="大バナー" meta="最大3件">
        {null}
      </EditorSection>,
    );
    expect(screen.getByText('最大3件')).toBeInTheDocument();
  });
});
