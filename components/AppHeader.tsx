import Image from 'next/image';

import mmcIcon from '@/public/mmc_icon.png';

type AppHeaderProps = {
  isPreviewOpen: boolean;
  /** 開閉対象パネルの id（aria-controls 用） */
  previewPanelId: string;
  onTogglePreview: () => void;
};

/**
 * ロゴ画像（1600x480）には書き出し時の余白が入っており、
 * 実際に描かれているのは x:90-1168 / y:147-346（1079x200）の範囲。
 * そのまま置くと右に 27% の空白が残って重心がずれるため、
 * 枠で切り抜いて余白を落としている。
 *
 * 枠の幅に対する比率で指定しているので、高さを変えても崩れない。
 */
const LOGO = {
  /** 描画範囲の縦横比。枠の形をこれに合わせる */
  aspect: '1079 / 200',
  /** 画像を枠幅の何倍に広げるか（1600 / 1079） */
  width: '148.286%',
  /** 描画範囲の左端を枠の左端に合わせる（-90 / 1079） */
  left: '-8.341%',
  /** 描画範囲の上端を枠の上端に合わせる（-147 / 200） */
  top: '-73.5%',
} as const;

export function AppHeader({ isPreviewOpen, previewPanelId, onTogglePreview }: AppHeaderProps) {
  return (
    <header className="border-rule bg-paper/85 sticky top-0 z-10 shrink-0 border-b backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <span
          className="relative block h-5 shrink-0 overflow-hidden sm:h-6"
          style={{ aspectRatio: LOGO.aspect }}
        >
          <Image
            src={mmcIcon}
            alt="MMC メルマガ作成ツール"
            priority
            // 実表示は約130px。指定しないと元画像の1600px幅がそのまま配信される
            sizes="256px"
            className="absolute h-auto max-w-none"
            style={{ width: LOGO.width, left: LOGO.left, top: LOGO.top }}
          />
        </span>

        <button
          type="button"
          onClick={onTogglePreview}
          aria-expanded={isPreviewOpen}
          aria-controls={previewPanelId}
          className="border-rule text-ink hover:border-vermilion hover:text-vermilion focus-visible:outline-vermilion group inline-flex items-center gap-2.5 border px-3.5 py-2 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span
            aria-hidden
            className={`size-2 border transition-colors ${
              isPreviewOpen ? 'border-vermilion bg-vermilion' : 'border-ink-faint bg-transparent'
            }`}
          />
          {isPreviewOpen ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>
    </header>
  );
}
