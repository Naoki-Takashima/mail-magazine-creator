'use client';

import type { CSSProperties } from 'react';

import { useElementSize } from '@/hooks/useElementSize';
import { MAIL_WIDTH } from '@/types/mail';

/** iPhone 16 の画面（論理解像度 393 x 852pt）の縦横比 */
const SCREEN_ASPECT = 393 / 852;

/**
 * ベゼルの厚み。上下が左右より厚いのは実機と同じ。
 * 上は padding 10px + スピーカースリット 4px + 余白 6px = 20px で、下の padding 20px と揃う。
 */
const BEZEL_X = 10;
const BEZEL_Y = 20;

/** 画面幅の上限。iPhone 16 の論理幅（393pt）相当で、これ以上は拡大しない */
const MAX_SCREEN_WIDTH = 393;

/** 計測前や極端に狭いときに縮小率が 0 に潰れないための下限 */
const MIN_SCREEN_WIDTH = 120;

type PhoneMockProps = {
  /**
   * 画面の上部に固定する帯。縮小せず端末の等倍で描くため、
   * ここに置いたものは中身と一緒にスクロールしない。
   */
  header?: React.ReactNode;
  /** 端末の画面に収める中身。縮小率は CSS 変数 --phone-scale で渡す */
  children: React.ReactNode;
};

type FrameStyle = CSSProperties & Record<'--phone-scale', number>;

/**
 * プレビューを載せるスマートフォンの枠。
 *
 * 実機そっくりのガラス表現やステータスバーはミニマルなテーマとぶつかるため入れていない。
 * ベゼル・角丸・落ち影1枚に絞った簡素な枠。
 *
 * 画面は iPhone 16 の縦横比（393:852）で固定し、**使える高さから逆算**して大きさを決める。
 * 高さに合わせて幅が変わり、幅が変わると中身の縮小率も変わる。
 * 長さ同士の比（＝無次元の縮小率）は CSS では作れないので、実寸を測って計算している。
 */
export function PhoneMock({ header, children }: PhoneMockProps) {
  const [areaRef, area] = useElementSize<HTMLDivElement>();

  const isMeasured = area.width > 0 && area.height > 0;
  // 計測前は上限いっぱいで描く。SSR と初回描画の値が一致するのでズレは起きない
  const widthLimit = isMeasured
    ? Math.min(area.width - BEZEL_X * 2, MAX_SCREEN_WIDTH)
    : MAX_SCREEN_WIDTH;
  const heightLimit = isMeasured ? (area.height - BEZEL_Y * 2) * SCREEN_ASPECT : MAX_SCREEN_WIDTH;

  // 端数を持ち回すと style 属性に長い小数が出るので、幅を丸めてから高さを引き直す
  const screenWidth = Math.round(Math.max(Math.min(widthLimit, heightLimit), MIN_SCREEN_WIDTH));
  const screenHeight = Math.round(screenWidth / SCREEN_ASPECT);

  // プレビュー用HTMLは body の余白を持たないので、カード幅がそのまま基準になる
  const scale = screenWidth / MAIL_WIDTH;

  const frameStyle: FrameStyle = {
    width: `${screenWidth + BEZEL_X * 2}px`,
    height: `${screenHeight + BEZEL_Y * 2}px`,
    '--phone-scale': Math.round(scale * 1e4) / 1e4,
  };

  return (
    // 計測が済むまでは見せない。SSR の HTML には「上限いっぱいの端末枠」が入るので、
    // そのまま出すと JS の読み込みが終わるまで実物より大きい枠が居座ってしまう
    <div
      className={`flex h-full min-h-0 flex-col items-center transition-opacity duration-200 ${
        isMeasured ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* 計測対象は「端末に使える領域」そのもの。キャプションは外に出しておく */}
      <div ref={areaRef} className="flex min-h-0 w-full flex-1 items-center justify-center">
        <div
          className="bg-fg flex flex-col rounded-[2.25rem] px-2.5 pt-2.5 pb-5 shadow-[0_18px_40px_-24px_rgba(55,53,47,0.45)] ring-1 ring-white/10 ring-inset"
          style={frameStyle}
        >
          <div aria-hidden className="mx-auto mb-1.5 h-1 w-10 shrink-0 rounded-full bg-white/25" />
          {/* 角丸はベゼルの厚み分だけ内側で小さくして、外周と同心にする */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.625rem] bg-white">
            {header}
            {/* 中身の高さの基準になる箱。relative を外すと iframe の height:% が解決できない */}
            <div className="relative min-h-0 flex-1">{children}</div>
          </div>
        </div>
      </div>

      <p className="text-fg-faint mt-3 shrink-0 text-[12px]">プレビュー</p>
    </div>
  );
}
