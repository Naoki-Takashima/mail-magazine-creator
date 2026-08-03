/** バナー共通の「画像 + 遷移先」 */
export type BannerLink = {
  url: string;
  imageUrl: string;
};

/** 帯バナー。最大1件なのでオブジェクト1つで持つ */
export type StripBanner = BannerLink;

export type LargeBanner = BannerLink & {
  /** React の key と更新対象の特定に使う */
  id: string;
  /** 空ならバナー本体の url をボタンにも流用する */
  buttonUrl: string;
  buttonText: string;
  /** '#rrggbb' 形式。既定は DEFAULT_BUTTON_TEXT_COLOR */
  buttonTextColor: string;
  /** '#rrggbb' 形式。既定は DEFAULT_BUTTON_BG_COLOR */
  buttonBgColor: string;
};

/**
 * 3カラム / 2カラムの区別。
 * 構造は同じで、列数・文字数上限・ノーマルテキストの有無だけが違う。
 */
export type ColumnVariant = 'three' | 'two';

export type ColumnItem = {
  id: string;
  url: string;
  imageUrl: string;
  /** 任意。メイン画像の直下に隙間なく繋げる */
  logoUrl: string;
  boldText: string;
  /** 2カラムのみ使用（3カラムでは入力欄も出さず、HTMLにも出さない） */
  normalText: string;
  /** 太字・ノーマル両方に適用する。既定は DEFAULT_TEXT_COLOR */
  textColor: string;
};

/**
 * ボタンの中身。
 * 複数持つカラムセット（id あり）と、1つだけ持つトピックス（id なし）で共用する。
 */
export type ButtonContent = {
  url: string;
  text: string;
  /** 既定は DEFAULT_BUTTON_TEXT_COLOR */
  textColor: string;
  /** 既定は DEFAULT_BUTTON_BG_COLOR */
  bgColor: string;
};

/** カラムセットの末尾に縦積みされるボタン */
export type ColumnButton = ButtonContent & { id: string };

/** タイトル + カラムアイテム + 末尾ボタン の一式 */
export type ColumnSet = {
  id: string;
  title: string;
  titleColor: string;
  /** 最大 MAX_COLUMN_ITEMS 件 */
  items: ColumnItem[];
  /** 最大 MAX_COLUMN_BUTTONS 件 */
  buttons: ColumnButton[];
};

/** 下部大バナー。バナー1件の形は 04 大バナーと同一なので LargeBanner を使い回す */
export type BottomBannerBlock = {
  title: string;
  titleColor: string;
  /** 最大 MAX_BOTTOM_BANNERS 件 */
  banners: LargeBanner[];
};

export type TopicItem = {
  id: string;
  url: string;
  imageUrl: string;
  boldText: string;
  normalText: string;
  /** 太字・ノーマル両方に適用する。既定は DEFAULT_TEXT_COLOR */
  textColor: string;
};

export type TopicsBlock = {
  title: string;
  titleColor: string;
  /** 最大 MAX_TOPIC_ITEMS 件 */
  items: TopicItem[];
  /** 1件だけなので配列にしない */
  button: ButtonContent;
};

/** フッターに並ぶリンク */
export type InfoLink = {
  id: string;
  url: string;
  text: string;
};

/**
 * メルマガ1通ぶんのコンテンツ。
 * 入力途中の不正値もそのまま保持するため、値はすべて string で持つ。
 * （検証は lib/validation.ts、表示可否の判断は lib/buildMailHtml.ts で行う）
 */
export type MailData = {
  /** 'YYYYMMDDhhmm'。必須。メール本文には出さない */
  deliveryDate: string;
  /** 必須。メール本文には出さない */
  subject: string;
  stripBanner: StripBanner;
  /** 最大 MAX_LARGE_BANNERS 件 */
  largeBanners: LargeBanner[];
  /** 最大 MAX_COLUMN_SETS 件 */
  threeColumnSets: ColumnSet[];
  /** 最大 MAX_COLUMN_SETS 件 */
  twoColumnSets: ColumnSet[];
  bottomBannerBlock: BottomBannerBlock;
  topicsBlock: TopicsBlock;
  /** 最大 MAX_INFO_LINKS 件 */
  infoLinks: InfoLink[];
};

/** MailData のうち ColumnSet[] を持つキー */
export type ColumnSetsKey = 'threeColumnSets' | 'twoColumnSets';

export const MAX_LARGE_BANNERS = 3;
export const MAX_COLUMN_SETS = 3;
export const MAX_COLUMN_ITEMS = 18;
export const MAX_COLUMN_BUTTONS = 3;
export const MAX_BOTTOM_BANNERS = 5;
export const MAX_TOPIC_ITEMS = 8;
export const MAX_INFO_LINKS = 3;
export const DEFAULT_BUTTON_TEXT_COLOR = '#ffffff';
export const DEFAULT_BUTTON_BG_COLOR = '#000000';
export const DEFAULT_TEXT_COLOR = '#000000';

/**
 * メール本体（カード）の幅。HTML生成とプレビューの縮小率の両方がこの値を基準にするため、
 * ここを唯一の出どころにする。
 */
export const MAIL_WIDTH = 600;

/** メール本文のコンテンツ幅（MAIL_WIDTH から左右の余白 24px を引いた値） */
export const MAIL_CONTENT_WIDTH = 552;

/**
 * メール本体の外側（body）の余白。配信用HTMLでのみ使う。
 * プレビューはカードを端末画面の端まで広げるため、この余白を持たせない。
 */
export const MAIL_BODY_PADDING_Y = 24;
export const MAIL_BODY_PADDING_X = 12;

/** トピックスの横並びレイアウト（合計 MAIL_CONTENT_WIDTH） */
export const TOPIC_IMAGE_WIDTH = 160;
export const TOPIC_GAP_WIDTH = 16;
export const TOPIC_TEXT_WIDTH = 376;

/** フッターリンクの固定色 */
export const INFO_LINK_COLOR = '#2563eb';

export type ColumnVariantConfig = {
  stateKey: ColumnSetsKey;
  /** 入力エリアでのブロック番号 */
  sectionIndex: string;
  title: string;
  columns: number;
  boldMaxLength: number;
  /** null ならノーマルテキストを持たない */
  normalMaxLength: number | null;
  /** カラム1つぶんの幅(px)。columns * cellWidth + (columns - 1) * gapWidth = MAIL_CONTENT_WIDTH */
  cellWidth: number;
  gapWidth: number;
};

/**
 * バリアントごとの差分を1か所に集約する。
 * UI・バリデーション・HTML生成のすべてがここを参照するため、
 * 列数や文字数上限を変えるときに触る場所が1か所で済む。
 */
export const COLUMN_VARIANT_CONFIG = {
  three: {
    stateKey: 'threeColumnSets',
    sectionIndex: '05',
    title: '3カラムボックス',
    columns: 3,
    boldMaxLength: 10,
    normalMaxLength: null,
    cellWidth: 176,
    gapWidth: 12,
  },
  two: {
    stateKey: 'twoColumnSets',
    sectionIndex: '06',
    title: '2カラムボックス',
    columns: 2,
    boldMaxLength: 15,
    normalMaxLength: 26,
    cellWidth: 268,
    gapWidth: 16,
  },
} as const satisfies Record<ColumnVariant, ColumnVariantConfig>;

/** 単独で更新できる MailData のトップレベル項目 */
export type SimpleMailField = 'deliveryDate' | 'subject';

/** LargeBanner のうちユーザーが編集できる項目（id を除く） */
export type EditableLargeBannerField = Exclude<keyof LargeBanner, 'id'>;

/** ColumnItem のうちユーザーが編集できる項目（id を除く） */
export type EditableColumnItemField = Exclude<keyof ColumnItem, 'id'>;

/** ColumnButton のうちユーザーが編集できる項目（id を除く） */
export type EditableColumnButtonField = Exclude<keyof ColumnButton, 'id'>;

/** ColumnSet のうちセット単位で編集する項目 */
export type EditableColumnSetField = 'title' | 'titleColor';

/** タイトルを持つブロックで、タイトル部分として編集する項目 */
export type EditableBlockTitleField = 'title' | 'titleColor';

/** TopicItem のうちユーザーが編集できる項目（id を除く） */
export type EditableTopicItemField = Exclude<keyof TopicItem, 'id'>;

/** InfoLink のうちユーザーが編集できる項目（id を除く） */
export type EditableInfoLinkField = Exclude<keyof InfoLink, 'id'>;

/** バナー1件ぶんの検証エラー。キーが無い = そのフィールドはエラー無し */
export type BannerErrors = {
  url?: string;
  imageUrl?: string;
  buttonUrl?: string;
};

export type ColumnItemErrors = {
  url?: string;
  imageUrl?: string;
  logoUrl?: string;
};

export type ColumnButtonErrors = {
  url?: string;
};

export type TopicItemErrors = {
  url?: string;
  imageUrl?: string;
};

export type InfoLinkErrors = {
  url?: string;
};

export type ColumnSetErrors = {
  /** アイテムの id をキーにしたエラー */
  items?: Record<string, ColumnItemErrors>;
  /** ボタンの id をキーにしたエラー */
  buttons?: Record<string, ColumnButtonErrors>;
};

export type ValidationErrors = {
  deliveryDate?: string;
  subject?: string;
  stripBanner?: BannerErrors;
  /** バナーの id をキーにしたエラー */
  largeBanners?: Record<string, BannerErrors>;
  /** セットの id をキーにしたエラー */
  threeColumnSets?: Record<string, ColumnSetErrors>;
  /** セットの id をキーにしたエラー */
  twoColumnSets?: Record<string, ColumnSetErrors>;
  /** バナーの id をキーにしたエラー */
  bottomBanners?: Record<string, BannerErrors>;
  /** トピックの id をキーにしたエラー */
  topicItems?: Record<string, TopicItemErrors>;
  topicsButton?: ColumnButtonErrors;
  /** リンクの id をキーにしたエラー */
  infoLinks?: Record<string, InfoLinkErrors>;
};

export const INITIAL_MAIL_DATA: MailData = {
  deliveryDate: '',
  subject: '',
  stripBanner: { url: '', imageUrl: '' },
  largeBanners: [],
  threeColumnSets: [],
  twoColumnSets: [],
  bottomBannerBlock: { title: '', titleColor: DEFAULT_TEXT_COLOR, banners: [] },
  topicsBlock: {
    title: '',
    titleColor: DEFAULT_TEXT_COLOR,
    items: [],
    button: {
      url: '',
      text: '',
      textColor: DEFAULT_BUTTON_TEXT_COLOR,
      bgColor: DEFAULT_BUTTON_BG_COLOR,
    },
  },
  infoLinks: [],
};

export function createLargeBanner(id: string): LargeBanner {
  return {
    id,
    url: '',
    imageUrl: '',
    buttonUrl: '',
    buttonText: '',
    buttonTextColor: DEFAULT_BUTTON_TEXT_COLOR,
    buttonBgColor: DEFAULT_BUTTON_BG_COLOR,
  };
}

export function createColumnSet(id: string): ColumnSet {
  return {
    id,
    title: '',
    titleColor: DEFAULT_TEXT_COLOR,
    items: [],
    buttons: [],
  };
}

export function createColumnItem(id: string): ColumnItem {
  return {
    id,
    url: '',
    imageUrl: '',
    logoUrl: '',
    boldText: '',
    normalText: '',
    textColor: DEFAULT_TEXT_COLOR,
  };
}

export function createColumnButton(id: string): ColumnButton {
  return {
    id,
    url: '',
    text: '',
    textColor: DEFAULT_BUTTON_TEXT_COLOR,
    bgColor: DEFAULT_BUTTON_BG_COLOR,
  };
}

export function createTopicItem(id: string): TopicItem {
  return {
    id,
    url: '',
    imageUrl: '',
    boldText: '',
    normalText: '',
    textColor: DEFAULT_TEXT_COLOR,
  };
}

export function createInfoLink(id: string): InfoLink {
  return { id, url: '', text: '' };
}
