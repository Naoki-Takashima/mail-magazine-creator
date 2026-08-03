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
    <dl className="border-rule bg-canvas flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border px-4 py-3">
      <dt className="text-fg-soft w-16 shrink-0 text-[12px] font-medium">配信日時</dt>
      <dd
        className={`min-w-0 flex-1 text-[14px] break-words ${
          isUnset ? 'text-fg-faint' : 'text-fg'
        }`}
      >
        {formattedDate || UNSET_LABEL}
      </dd>
    </dl>
  );
}
