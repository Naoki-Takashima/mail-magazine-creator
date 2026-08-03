import { formatDeliveryDate } from '@/lib/deliveryDate';

type PreviewMetaProps = {
  /** 'YYYYMMDDhhmm' */
  deliveryDate: string;
  subject: string;
};

const UNSET_LABEL = '未設定';

type MetaRowProps = {
  label: string;
  value: string;
  isUnset: boolean;
};

function MetaRow({ label, value, isUnset }: MetaRowProps) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <dt className="text-ink-faint w-20 shrink-0 font-mono text-[10px] tracking-[0.2em] uppercase">
        {label}
      </dt>
      <dd
        className={`font-display min-w-0 flex-1 text-[15px] break-words ${
          isUnset ? 'text-ink-faint italic' : 'text-ink'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * 配信日・件名はメール本文には含めないため、iframe の外に受信ヘッダ風のメタ欄として出す。
 */
export function PreviewMeta({ deliveryDate, subject }: PreviewMetaProps) {
  const formattedDate = formatDeliveryDate(deliveryDate);
  const trimmedSubject = subject.trim();

  return (
    <dl className="border-rule bg-paper/70 space-y-2 border px-5 py-4">
      <MetaRow
        label="配信日時"
        value={formattedDate || UNSET_LABEL}
        isUnset={formattedDate === ''}
      />
      <MetaRow label="件名" value={trimmedSubject || UNSET_LABEL} isUnset={trimmedSubject === ''} />
    </dl>
  );
}
