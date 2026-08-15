import { MAX_HTML_BYTES, parseTestDeliveryRequest } from '@/lib/testDelivery';

const VALID = {
  to: 'test@example.com',
  subject: '8月号のお知らせ',
  html: '<html><body>本文</body></html>',
};

describe('parseTestDeliveryRequest', () => {
  it('正しい入力はトリムして返す', () => {
    expect(parseTestDeliveryRequest({ ...VALID, to: '  test@example.com  ' })).toEqual(VALID);
  });

  it.each([
    ['null', null],
    ['配列でも文字列でもない値', 'to=test@example.com'],
    ['数値', 42],
  ])('%s は形式エラー', (_label, input) => {
    expect(parseTestDeliveryRequest(input)).toBe('リクエストの形式が不正です');
  });

  it.each([
    ['宛先が無い', { subject: VALID.subject, html: VALID.html }],
    ['件名が無い', { to: VALID.to, html: VALID.html }],
    ['HTMLが無い', { to: VALID.to, subject: VALID.subject }],
    ['宛先が文字列でない', { ...VALID, to: 123 }],
    ['HTMLが文字列でない', { ...VALID, html: { body: '本文' } }],
  ])('%s なら形式エラー', (_label, input) => {
    expect(parseTestDeliveryRequest(input)).toBe('リクエストの形式が不正です');
  });

  it.each(['', '   ', 'test', 'test@example', 'te st@example.com'])(
    '宛先 %s はアドレスのエラー',
    (to) => {
      expect(parseTestDeliveryRequest({ ...VALID, to })).toBe(
        'メールアドレスの形式で入力してください',
      );
    },
  );

  it('件名が空白だけならエラー', () => {
    expect(parseTestDeliveryRequest({ ...VALID, subject: '   ' })).toBe('件名を入力してください');
  });

  it('HTMLが空ならエラー', () => {
    expect(parseTestDeliveryRequest({ ...VALID, html: '' })).toBe('送信する内容がありません');
  });

  it('上限ちょうどのHTMLは通す', () => {
    const html = 'a'.repeat(MAX_HTML_BYTES);

    expect(parseTestDeliveryRequest({ ...VALID, html })).toEqual({ ...VALID, html });
  });

  it('上限を超えたHTMLはエラー', () => {
    const html = 'a'.repeat(MAX_HTML_BYTES + 1);

    expect(parseTestDeliveryRequest({ ...VALID, html })).toBe('内容が大きすぎるため送信できません');
  });

  it('サイズは文字数ではなくバイト数で見る', () => {
    // 日本語は UTF-8 で1文字3バイト。文字数だけ見ていると上限の3倍まで通ってしまう
    const html = 'あ'.repeat(Math.ceil(MAX_HTML_BYTES / 3));

    expect(html.length).toBeLessThanOrEqual(MAX_HTML_BYTES);
    expect(parseTestDeliveryRequest({ ...VALID, html })).toBe('内容が大きすぎるため送信できません');
  });
});
