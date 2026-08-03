type SubjectBarProps = {
  subject: string;
};

const PLACEHOLDER = '（件名未入力）';

/**
 * スマホ画面の上部に固定する件名バー。
 *
 * 件名は HTML メールの中身ではなくヘッダ情報なので、iframe の中（= 生成HTML）には入れず、
 * 実際のメーラーと同じく「本文の上に固定された欄」として親側で描く。
 * 本文はこのバーの下をスクロールする。
 *
 * 色は端末画面の中の世界なので、アプリのテーマ色ではなくメーラー相当の素の色を使う。
 */
export function SubjectBar({ subject }: SubjectBarProps) {
  const trimmedSubject = subject.trim();

  return (
    <div className="shrink-0 bg-white pt-[25px]">
      <p
        // 長い件名で画面を埋めないよう2行で打ち切る
        className={`line-clamp-2 border-y border-[#e5e7eb] px-4 py-3 text-[14px] leading-[1.5] ${
          trimmedSubject ? 'text-black' : 'text-[#9ca3af]'
        }`}
      >
        {trimmedSubject || PLACEHOLDER}
      </p>
    </div>
  );
}
