import { formatDeliveryDate } from '@/lib/deliveryDate';

type PreviewMetaProps = {
  /** 'YYYYMMDDhhmm' */
  deliveryDate: string;
};

const UNSET_LABEL = '未設定';

/**
 * 配信日時はメール本文にも端末画面にも出ないため、iframe の外にメタ欄として置く。
 * 件名は端末画面の上部（SubjectBar）に移したので、ここには出さない。
 */
export function PreviewMeta({ deliveryDate }: PreviewMetaProps) {
  const formattedDate = formatDeliveryDate(deliveryDate);
  const isUnset = formattedDate === '';

  return (
    <dl className="border-rule bg-paper/70 flex flex-wrap items-baseline gap-x-4 gap-y-1 border px-5 py-4">
      <dt className="text-ink-faint w-20 shrink-0 font-mono text-[10px] tracking-[0.2em] uppercase">
        配信日時
      </dt>
      <dd
        className={`font-display min-w-0 flex-1 text-[15px] break-words ${
          isUnset ? 'text-ink-faint italic' : 'text-ink'
        }`}
      >
        {formattedDate || UNSET_LABEL}
      </dd>
    </dl>
  );
}
