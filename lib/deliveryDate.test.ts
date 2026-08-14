import {
  formatDeliveryDate,
  isValidCompactDateTime,
  toCompactDateTime,
  toDatetimeLocalValue,
  toFileNameDateTime,
} from '@/lib/deliveryDate';

describe('isValidCompactDateTime', () => {
  it('12桁の実在する日時を受け付ける', () => {
    expect(isValidCompactDateTime('202608031000')).toBe(true);
  });

  it('うるう年の2月29日を受け付ける', () => {
    expect(isValidCompactDateTime('202402290000')).toBe(true);
  });

  it.each([
    ['存在しない日付（2月30日）', '202602301000'],
    ['存在しない月', '202613011000'],
    ['存在しない時刻', '202608032500'],
    ['うるう年でない年の2月29日', '202502290000'],
  ])('%s を弾く（Date の繰り上げに騙されない）', (_label, value) => {
    expect(isValidCompactDateTime(value)).toBe(false);
  });

  it.each(['', '2026080310', '2026080310000', '2026-08-03T10:00', 'abcdefghijkl'])(
    '桁数や形式が違う %s を弾く',
    (value) => {
      expect(isValidCompactDateTime(value)).toBe(false);
    },
  );
});

describe('toCompactDateTime', () => {
  it('datetime-local の値を12桁に詰める', () => {
    expect(toCompactDateTime('2026-08-03T10:00')).toBe('202608031000');
  });

  it('秒つきの値でも12桁で切る', () => {
    expect(toCompactDateTime('2026-08-03T10:00:30')).toBe('202608031000');
  });

  it('入力途中など不正な値は空文字を返す', () => {
    expect(toCompactDateTime('2026-08')).toBe('');
    expect(toCompactDateTime('')).toBe('');
  });
});

describe('toDatetimeLocalValue', () => {
  it('12桁を datetime-local の形式に戻す', () => {
    expect(toDatetimeLocalValue('202608031000')).toBe('2026-08-03T10:00');
  });

  it('不正な値は空文字を返す（input の value に渡すため）', () => {
    expect(toDatetimeLocalValue('202602301000')).toBe('');
    expect(toDatetimeLocalValue('')).toBe('');
  });

  it('toCompactDateTime と往復しても値が変わらない', () => {
    const compact = '202612312359';
    expect(toCompactDateTime(toDatetimeLocalValue(compact))).toBe(compact);
  });
});

describe('toFileNameDateTime', () => {
  it('日付と時刻をアンダースコアで区切る', () => {
    expect(toFileNameDateTime('202608031000')).toBe('20260803_1000');
  });

  it('不正な値は null を返す（ファイル名を作れないため）', () => {
    expect(toFileNameDateTime('')).toBeNull();
    expect(toFileNameDateTime('202602301000')).toBeNull();
  });
});

describe('formatDeliveryDate', () => {
  it('曜日つきの日本語表記にする', () => {
    expect(formatDeliveryDate('202608031000')).toBe('2026年8月3日(月) 10:00');
  });

  it('時刻は0埋めし、月日は0埋めしない', () => {
    expect(formatDeliveryDate('202601310905')).toBe('2026年1月31日(土) 09:05');
  });

  it('不正な値は空文字を返す', () => {
    expect(formatDeliveryDate('202602301000')).toBe('');
    expect(formatDeliveryDate('')).toBe('');
  });
});
