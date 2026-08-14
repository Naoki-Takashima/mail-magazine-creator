import { isHexColor, toColorPickerValue, toSafeHexColor } from '@/lib/color';

const FALLBACK = '#000000';

describe('isHexColor', () => {
  it.each(['#fff', '#FFF', '#ffffff', '#FFFFFF', '#2383e2'])('%s を色コードと認める', (value) => {
    expect(isHexColor(value)).toBe(true);
  });

  it('前後の空白は無視する', () => {
    expect(isHexColor('  #fff  ')).toBe(true);
  });

  it.each(['', 'fff', '#ff', '#ffff', '#fffffff', 'red', '#ggg', '#fff #000'])(
    '%s は色コードとして認めない',
    (value) => {
      expect(isHexColor(value)).toBe(false);
    },
  );
});

describe('toSafeHexColor', () => {
  it('正しい色コードは小文字に揃えて返す', () => {
    expect(toSafeHexColor('#AABBCC', FALLBACK)).toBe('#aabbcc');
  });

  it('前後の空白を落として返す', () => {
    expect(toSafeHexColor(' #fff ', FALLBACK)).toBe('#fff');
  });

  it('色コード以外は fallback に倒す', () => {
    expect(toSafeHexColor('red', FALLBACK)).toBe(FALLBACK);
    expect(toSafeHexColor('', FALLBACK)).toBe(FALLBACK);
  });

  it('style 属性に別の宣言を差し込もうとする値を fallback に倒す', () => {
    // escapeHtml では防げない経路なので、ここで塞げているかが要
    const injection = 'red;background:url(https://evil.example.com/x.png)';
    expect(toSafeHexColor(injection, FALLBACK)).toBe(FALLBACK);
  });
});

describe('toColorPickerValue', () => {
  it('3桁の色コードを6桁に展開する', () => {
    expect(toColorPickerValue('#abc', FALLBACK)).toBe('#aabbcc');
  });

  it('6桁の色コードはそのまま（小文字化のみ）返す', () => {
    expect(toColorPickerValue('#AABBCC', FALLBACK)).toBe('#aabbcc');
  });

  it('不正な値は fallback を返す', () => {
    expect(toColorPickerValue('red', FALLBACK)).toBe(FALLBACK);
  });

  it('fallback が3桁でも6桁に展開して返す', () => {
    // <input type="color"> は6桁しか受け付けないため
    expect(toColorPickerValue('red', '#fff')).toBe('#ffffff');
  });
});
