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
      {/* 余白と罫線は外側で持つ。line-clamp の overflow:hidden は padding box で
          切るため、<p> に padding を付けると打ち切った次の行が余白に覗いてしまう */}
      <div className="border-y border-[#e5e7eb] px-4 py-3">
        <p
          // 行数ぶんだけ高さが伸び、4行を超えたら3点リーダーで打ち切る。
          // break-words が無いと、空白を含まない長いURLなどが横にはみ出す
          className={`line-clamp-4 text-[14px] leading-[1.5] font-bold break-words ${
            trimmedSubject ? 'text-black' : 'text-[#9ca3af]'
          }`}
        >
          {trimmedSubject || PLACEHOLDER}
        </p>
      </div>
    </div>
  );
}
