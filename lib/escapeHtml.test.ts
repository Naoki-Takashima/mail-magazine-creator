import { escapeHtml, nl2br } from '@/lib/escapeHtml';

describe('escapeHtml', () => {
  it('HTMLの特殊文字5種をすべて実体参照に置き換える', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });

  it('タグとして解釈されうる入力を無害な文字列にする', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('& を先に置き換えるため、既存の実体参照は二重にエスケープされる', () => {
    // 入力は「&amp; という文字列そのもの」なので、これが正しい挙動
    expect(escapeHtml('&amp;')).toBe('&amp;amp;');
  });

  it('特殊文字を含まない文字列はそのまま返す', () => {
    expect(escapeHtml('今月のおすすめ')).toBe('今月のおすすめ');
  });
});

describe('nl2br', () => {
  it('CRLF / CR / LF のいずれも <br /> にする', () => {
    expect(nl2br('a\r\nb\rc\nd')).toBe('a<br />b<br />c<br />d');
  });

  it('改行が無ければそのまま返す', () => {
    expect(nl2br('改行なし')).toBe('改行なし');
  });
});
