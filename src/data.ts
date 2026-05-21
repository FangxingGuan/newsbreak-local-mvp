// Mock data for the demo: the local feed + a lightweight plan generator.
// No network, no API keys — everything here is deterministic fake content.
// Localized for a user in Palo Alto, CA: real neighborhoods & landmarks,
// plausible (fictional) venue names.

import type { FeedEntry, FeedItem, NewsItem, Plan, PlanStop, Vertical } from './types'
import snapshot from './feed.generated.json'

/** The user's current location, shown in the feed app bar. */
export const USER_LOCATION = 'Palo Alto, CA'

export const VERTICALS: { id: Vertical; label: string; emoji: string }[] = [
  { id: 'dining', label: '约会聚餐', emoji: '🍷' },
  { id: 'weekend', label: '周末活动', emoji: '🎟️' },
  { id: 'family', label: '家庭活动', emoji: '🧸' },
]

// Built-in sample data — used as a fallback when no real snapshot exists.
const FALLBACK_FEED: FeedItem[] = [
  // ---- Date / Social Dining ----
  {
    id: 'd1',
    vertical: 'dining',
    kind: '地点',
    title: 'Bella Vista',
    category: '意大利菜 · 庭院餐厅',
    emoji: '🍝',
    cover: 'linear-gradient(135deg,#ff7a59,#ef2d56)',
    neighborhood: 'Downtown',
    distance: '0.4 mi',
    rating: 4.6,
    price: '$$',
    blurb: '烛光庭院、现做手工意面,University Ave 上评价里最常出现的约会餐厅。',
    tags: ['意式', '浪漫', '户外座位'],
    intentLabel: '策划一次约会',
  },
  {
    id: 'd2',
    vertical: 'dining',
    kind: '地点',
    title: 'Koji Ramen Bar',
    category: '日式拉面 · 深夜小馆',
    emoji: '🍜',
    cover: 'linear-gradient(135deg,#f9a826,#e8112d)',
    neighborhood: 'California Ave',
    distance: '1.1 mi',
    rating: 4.5,
    price: '$',
    blurb: '12 个吧台座的小馆,营业到深夜,适合看完电影顺道来一碗。',
    tags: ['日料', '深夜食堂', '小众'],
    intentLabel: '安排一次聚餐',
  },
  {
    id: 'd3',
    vertical: 'dining',
    kind: '本地资讯',
    title: 'The Hidden Fig 本周上新自然酒单',
    category: '红酒吧 · 小食',
    emoji: '🍷',
    cover: 'linear-gradient(135deg,#b06ab3,#4568dc)',
    neighborhood: 'Midtown',
    distance: '1.6 mi',
    rating: 4.7,
    price: '$$$',
    blurb: '低照度、自然酒与小食,Midtown 里气氛最安静的微醺去处。',
    tags: ['红酒', '微醺', '安静'],
    intentLabel: '收进约会清单',
  },
  // ---- Weekend Activities ----
  {
    id: 'w1',
    vertical: 'weekend',
    kind: '活动',
    title: '加州大道周日农夫市集',
    category: '户外市集 · 每周日上午',
    emoji: '🧺',
    cover: 'linear-gradient(135deg,#56ab2f,#a8e063)',
    neighborhood: 'California Ave',
    distance: '1.0 mi',
    rating: 4.8,
    price: '免费',
    blurb: '60+ 本地摊位,现摘果蔬与现场乐队,适合慢悠悠逛一上午。',
    tags: ['市集', '户外', '清晨'],
    intentLabel: '规划这个周末',
  },
  {
    id: 'w2',
    vertical: 'weekend',
    kind: '活动',
    title: 'Shoreline Lake 日落皮划艇',
    category: '户外运动 · 周六傍晚',
    emoji: '🛶',
    cover: 'linear-gradient(135deg,#2193b0,#6dd5ed)',
    neighborhood: 'Shoreline',
    distance: '4.5 mi',
    rating: 4.7,
    price: '$$',
    blurb: '2 小时教练带队,装备全含,从水面上看湾区日落。',
    tags: ['户外', '运动', '水上'],
    intentLabel: '规划这个周末',
  },
  {
    id: 'w3',
    vertical: 'weekend',
    kind: '活动',
    title: '斯坦福草坪露天电影夜',
    category: '文化活动 · 周五晚',
    emoji: '🎬',
    cover: 'linear-gradient(135deg,#3a1c71,#d76d77)',
    neighborhood: 'Stanford',
    distance: '1.8 mi',
    rating: 4.5,
    price: '$',
    blurb: '校园草坪上的露天放映,带上毯子就能去。',
    tags: ['电影', '文艺', '夜晚'],
    intentLabel: '加入周末计划',
  },
  // ---- Family Activities ----
  {
    id: 'f1',
    vertical: 'family',
    kind: '地点',
    title: '少儿博物馆与动物园',
    category: '亲子科普 · 半室内',
    emoji: '🦉',
    cover: 'linear-gradient(135deg,#f7971e,#ffd200)',
    neighborhood: 'Rinconada',
    distance: '0.9 mi',
    rating: 4.8,
    price: '$',
    blurb: '可动手的互动展区加小型动物园,设有低龄幼儿专区,下雨天也合适。',
    tags: ['亲子', '科普', '动物'],
    intentLabel: '安排家庭日',
  },
  {
    id: 'f2',
    vertical: 'family',
    kind: '活动',
    title: 'Webb Ranch 采莓季开园',
    category: '农场体验 · 周末',
    emoji: '🍓',
    cover: 'linear-gradient(135deg,#ee0979,#ff6a00)',
    neighborhood: 'Portola Valley',
    distance: '5.2 mi',
    rating: 4.7,
    price: '$',
    blurb: '自助采摘刚开园,离斯坦福很近,适合带孩子认识食物从哪儿来。',
    tags: ['亲子', '农场', '户外'],
    intentLabel: '安排家庭日',
  },
  {
    id: 'f3',
    vertical: 'family',
    kind: '活动',
    title: 'Mitchell Park 图书馆故事会',
    category: '亲子阅读 · 每周六',
    emoji: '📚',
    cover: 'linear-gradient(135deg,#11998e,#38ef7d)',
    neighborhood: 'Mitchell Park',
    distance: '2.0 mi',
    rating: 4.5,
    price: '免费',
    blurb: '面向 3–7 岁的每周阅读加手工,名额有限。',
    tags: ['亲子', '阅读', '室内'],
    intentLabel: '加入家庭计划',
  },
]

/** Real data captured by scripts/snapshot.mjs — empty until the snapshot runs. */
const SNAPSHOT = snapshot.items as unknown as FeedItem[]

/**
 * Curated items sourced from articles / editorial picks rather than a category
 * search — e.g. a place extracted from a news article, then enriched via the
 * Yelp/Google APIs. Kept across snapshots since a re-run wouldn't rediscover it.
 */
const CURATED: FeedItem[] = [
  {
    id: 'curated-unclejohns',
    vertical: 'family',
    kind: '地点',
    title: "Uncle John's Pancake House",
    category: 'Breakfast & Brunch',
    emoji: '🥞',
    cover: 'linear-gradient(135deg,#f9a826,#e8112d)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/gUQahdfGW9ro93D-8ggdxw/o.jpg',
    neighborhood: 'San Jose',
    distance: '14.8 mi',
    rating: 4.4,
    reviews: 1022,
    price: '$$',
    blurb:
      'The Alameda 上的人气早餐馆 —— 蓬松煎饼、招牌炸鸡排和经典 brunch,分量足、上菜快,适合带娃来一顿热闹的周末早午餐。',
    tags: ['Breakfast & Brunch', '煎饼', '亲子早午餐'],
    intentLabel: '安排家庭日',
  },
]

/**
 * The live feed. Each vertical independently uses curated + real snapshot data
 * when available, and falls back to the built-in sample data otherwise.
 */
export const FEED: FeedItem[] = (['dining', 'weekend', 'family'] as Vertical[]).flatMap(
  (v) => {
    const real = [
      ...CURATED.filter((i) => i.vertical === v),
      ...SNAPSHOT.filter((i) => i.vertical === v),
    ]
    return real.length ? real : FALLBACK_FEED.filter((i) => i.vertical === v)
  },
)

/** Whether the feed is showing real API data, and when it was captured. */
export const USING_REAL_DATA = SNAPSHOT.length > 0
export const SNAPSHOT_AT: string | null = snapshot.generatedAt

export function getItem(id: string): FeedItem | undefined {
  return FEED.find((i) => i.id === id)
}

// ---- Local news --------------------------------------------------------------
// Simulated NewsBreak-style local news. (None of the available APIs is a news
// source, so this content is mock — see the note in CLAUDE.md.) News is woven
// into the feed: reading it is feed engagement, and a dwell surfaces an intent
// hook — exactly the PRD's "news feed → decision engine" thesis.

const NEWS_COVERS = [
  'linear-gradient(135deg,#3a6073,#16222a)',
  'linear-gradient(135deg,#5614b0,#dbd65c)',
  'linear-gradient(135deg,#1f4037,#99f2c8)',
  'linear-gradient(135deg,#ee9ca7,#ffdde1)',
  'linear-gradient(135deg,#42275a,#734b6d)',
]

export const NEWS: NewsItem[] = [
  // ---- dining ----
  {
    type: 'news',
    id: 'n-d1',
    vertical: 'dining',
    category: '本地 · 美食',
    headline: 'University Ave 新开一家手工意面馆,本周五起试营业',
    source: 'Palo Alto Local',
    publishedAgo: '2 小时前',
    emoji: '🍝',
    cover: NEWS_COVERS[0],
    summary: '主厨来自旧金山一家米其林餐厅,主打现做意面与自然酒,试营业期间甜点免费。',
    comments: 47,
    reactions: 213,
    hook: '这家就在你 0.4 mi 外 · 周末想去看看吗?',
    body: [
      '这家手工意面馆位于 University Ave 中段,本周五起对外试营业。主厨此前在旧金山一家米其林餐厅工作,菜单聚焦每日现做的意面与小份自然酒。',
      '店内只有约 30 个座位,庭院位会优先开放给晚市。试营业期间,所有甜点免费赠送,持续到本周日。',
      '店主表示,正式开业后会推出周中的双人套餐,目标是做成街区里轻松的约会餐厅。',
    ],
  },
  {
    type: 'news',
    id: 'n-d2',
    vertical: 'dining',
    category: '美食榜单',
    headline: '读者票选:Palo Alto 最适合约会的 10 家餐厅出炉',
    source: 'Peninsula Press',
    publishedAgo: '昨天',
    emoji: '🏆',
    cover: NEWS_COVERS[1],
    summary: '投票显示,庭院座位与现场音乐是最受欢迎的约会加分项,意餐与红酒吧上榜最多。',
    comments: 132,
    reactions: 540,
    hook: '榜单里有 3 家就在你 1 mi 内',
    body: [
      'Peninsula Press 面向读者发起的年度投票结果出炉,Palo Alto「最适合约会的 10 家餐厅」名单正式公布。',
      '投票数据显示,庭院座位、低照度环境和现场音乐是最常被提及的加分项。意餐与红酒吧在榜单中占比最高,其中三家集中在 University Ave 一带。',
      '编辑部建议,热门约会餐厅周五周六最好提前预约,庭院位通常最先订满。',
    ],
  },
  {
    type: 'news',
    id: 'n-d3',
    vertical: 'dining',
    category: '本地',
    headline: 'California Ave 周末美食市集本月延长至晚 9 点',
    source: 'The Daily Post',
    publishedAgo: '5 小时前',
    emoji: '🧆',
    cover: NEWS_COVERS[2],
    summary: '夏季限定,新增 12 家餐车与现场乐队,主办方建议错峰前往。',
    comments: 28,
    reactions: 96,
    hook: '周末顺路就能去逛一圈',
    body: [
      'California Ave 的周末美食市集宣布,本月起营业时间延长至晚 9 点。',
      '主办方表示,夏季客流明显增长,本次新增 12 家餐车和现场乐队表演。建议错峰前往,傍晚 6 点前停车相对容易。',
      '市集每周六、周日开放,入场免费,部分摊位仅收现金。',
    ],
  },
  // ---- weekend ----
  {
    type: 'news',
    id: 'n-w1',
    vertical: 'weekend',
    category: '天气',
    headline: '本周末湾区持续晴朗,气温 22°C,适合户外出行',
    source: 'Bay Area Now',
    publishedAgo: '1 小时前',
    emoji: '☀️',
    cover: NEWS_COVERS[3],
    summary: '气象部门预计周六周日连续晴天,紫外线偏强,户外活动注意防晒补水。',
    comments: 19,
    reactions: 88,
    hook: '天气这么好 · 要不要规划个户外周末?',
    body: [
      '湾区气象部门预计,本周六、周日将连续晴天,白天气温约 22°C,非常适合户外活动。',
      '需要注意的是,正午前后紫外线偏强,户外出行建议做好防晒并及时补水。',
      '沿海一带早晨可能有短时雾气,通常在上午十点前散去。',
    ],
  },
  {
    type: 'news',
    id: 'n-w2',
    vertical: 'weekend',
    category: '社区活动',
    headline: '斯坦福露天电影季公布片单,6 月每周五开场',
    source: 'Palo Alto Local',
    publishedAgo: '昨天',
    emoji: '🎬',
    cover: NEWS_COVERS[4],
    summary: '今年以经典老片为主,草坪免费入场,主办方建议自带毯子提前到场占位。',
    comments: 64,
    reactions: 274,
    hook: '本周五就有一场 · 离你 1.8 mi',
    body: [
      '斯坦福露天电影季公布 6 月片单,每周五晚在校园草坪放映,免费入场。',
      '今年片单以经典老片为主。主办方建议自带毯子或折叠椅,并提前到场占位,放映在日落后开始。',
      '现场设有小食摊位,雨天将顺延至下一个周五。',
    ],
  },
  {
    type: 'news',
    id: 'n-w3',
    vertical: 'weekend',
    category: '周末指南',
    headline: '湾区周末好去处:本地编辑整理的 6 月户外清单',
    source: 'Peninsula Press',
    publishedAgo: '6 小时前',
    emoji: '🗺️',
    cover: NEWS_COVERS[0],
    summary: '从皮划艇到农夫市集,20 个不踩雷的周末选择,大多在 30 分钟车程内。',
    comments: 41,
    reactions: 167,
    hook: '清单里好几个就在你附近',
    body: [
      'Peninsula Press 的本地编辑整理了一份 6 月户外清单,收录 20 个周末好去处。',
      '从 Shoreline 的皮划艇到加州大道的农夫市集,清单里的大多数地点都在 30 分钟车程以内,并标注了适合的人群与最佳前往时段。',
      '编辑提醒,水上项目和热门徒步路线周末名额紧张,最好提前预约。',
    ],
  },
  // ---- family ----
  {
    type: 'news',
    id: 'n-f4',
    vertical: 'family',
    category: '美食 · 推荐',
    headline: "San Jose 必吃煎饼店:The Alameda 上的 Uncle John's",
    source: 'GoTo Destinations',
    publishedAgo: '1 天前',
    emoji: '🥞',
    cover: NEWS_COVERS[4],
    summary:
      '本地美食栏目推荐:这家开在 The Alameda 的早餐馆主打蓬松煎饼与经典 brunch,出品扎实、上菜快、分量大方。',
    comments: 39,
    reactions: 156,
    hook: '这家就在 San Jose · 14.8 mi · 周末带娃去尝尝',
    body: [
      'San Jose 的早午餐去处不少,但本地人一次次回到 The Alameda 上的 Uncle John\'s Pancake House。原因很实在:上菜快、分量大,早餐做得朴实又熨帖。开放式厨房让人能一边喝咖啡聊天,一边看着自己的餐被做出来。',
      '这家街区小馆最大的特点是效率 —— 出餐通常在 10 到 15 分钟内,brunch 吃得从容而不赶。食客对店员的评价是友好、麻利、周到,咖啡随时续杯。',
      '菜单走经典美式路线:蓬松煎饼、班尼迪克蛋、扎实的早餐拼盘。招牌包括蓝莓面糊煎饼配丹麦风淋酱、酥脆炸鸡排配乡村肉汁,以及人气很高的古巴风班尼迪克蛋。分量很大方,吃完是「满足」而不是「一小时后又饿」。',
      '环境像一家现代社区餐馆,座位明亮、周末气氛热闹但不嘈杂。还有带顶棚的户外座位,天气好时可以边吃热腾腾的早餐边享受 San Jose 的好天气。',
      '地址:1205 The Alameda, San Jose, CA 95126 · 营业时间:每天 7:00–14:00 · 电话:(408) 899-4071',
    ],
    linkId: 'curated-unclejohns',
  },
  {
    type: 'news',
    id: 'n-f1',
    vertical: 'family',
    category: '本地',
    headline: '加州樱桃采摘季开始,本地农场迎来周末客流高峰',
    source: 'The Daily Post',
    publishedAgo: '4 小时前',
    emoji: '🍒',
    cover: NEWS_COVERS[1],
    summary: '今年雨水充足,果农预计樱桃个头更大、甜度更高,采摘大约持续到 6 月中旬。',
    comments: 53,
    reactions: 198,
    hook: 'Webb Ranch 就在 3.9 mi · 很适合带娃',
    body: [
      '随着加州樱桃进入采摘季,本地多家农场迎来周末客流高峰。',
      '果农表示,今年雨水充足,樱桃个头更大、甜度更高。采摘季预计持续到 6 月中旬,周末上午人流最多,建议尽早出发。',
      '部分农场提供桶装计重,园区建议穿深色衣物、带上遮阳帽。',
    ],
  },
  {
    type: 'news',
    id: 'n-f2',
    vertical: 'family',
    category: '社区',
    headline: 'Palo Alto 少儿博物馆与动物园完成翻新,本周重新开放',
    source: 'Palo Alto Local',
    publishedAgo: '昨天',
    emoji: '🦉',
    cover: NEWS_COVERS[2],
    summary: '新增互动科学展区与低龄幼儿专区,会员首周免费入场。',
    comments: 88,
    reactions: 421,
    hook: '离你 0.2 mi · 周末家庭日的首选',
    body: [
      'Palo Alto 少儿博物馆与动物园完成翻新,本周重新对公众开放。',
      '翻新后新增了互动科学展区和面向低龄幼儿的专属区域。会员在重开首周可免费入场,非会员建议线上预约时段。',
      '园区表示,周末上午时段最热门,下午相对宽松。',
    ],
  },
  {
    type: 'news',
    id: 'n-f3',
    vertical: 'family',
    category: '教育',
    headline: '新学年学区日历公布,暑期亲子活动报名同步开放',
    source: 'Peninsula Press',
    publishedAgo: '2 天前',
    emoji: '📅',
    cover: NEWS_COVERS[3],
    summary: '多个社区中心推出夏令营与亲子工作坊,热门班次名额有限,建议尽早报名。',
    comments: 76,
    reactions: 245,
    hook: '趁早把家庭活动排进日历',
    body: [
      '新学年学区日历已公布,暑期亲子活动报名同步开放。',
      '多个社区中心推出夏令营与亲子工作坊,涵盖科学、艺术与户外项目。热门班次名额有限,建议尽早报名。',
      '部分项目对学区居民优先开放,报名需提供地址证明。',
    ],
  },
]

/** Type guard: distinguishes a news article from a decision card. */
export function isNews(entry: FeedEntry): entry is NewsItem {
  return 'headline' in entry
}

export function getNews(id: string): NewsItem | undefined {
  return NEWS.find((n) => n.id === id)
}

// ---- Lightweight plan generator -------------------------------------------
// Slots a feed item into a small vertical-specific itinerary. Each vertical
// has multiple "variants" (moods) so a plan can be re-rolled — see generatePlan.

interface PlanVariant {
  vibe: string
  before: PlanStop[]
  after: PlanStop[]
}

const PLAN_TEMPLATE: Record<
  Vertical,
  {
    title: (i: FeedItem) => string
    when: string
    anchorTime: string
    anchorTravel: string
    variants: PlanVariant[]
  }
> = {
  dining: {
    title: (i) => `${i.neighborhood} 约会夜`,
    when: '本周五 18:00',
    anchorTime: '19:00',
    anchorTravel: '🚶 6 分钟',
    variants: [
      {
        vibe: '🌇 浪漫慢节奏',
        before: [
          {
            time: '18:00',
            emoji: '🚶',
            title: 'University Ave 散步',
            desc: '沿街逛逛橱窗、看看落日,把约会的节奏慢下来。',
          },
        ],
        after: [
          {
            time: '21:00',
            emoji: '🍨',
            title: '餐后甜点',
            desc: '走几步去吃个意式冰淇淋,边走边聊。',
            travel: '🚶 5 分钟',
          },
        ],
      },
      {
        vibe: '🍸 微醺夜生活',
        before: [
          {
            time: '18:30',
            emoji: '🍸',
            title: '餐前小酌',
            desc: '先到附近的鸡尾酒吧喝一杯,热热场。',
          },
        ],
        after: [
          {
            time: '21:30',
            emoji: '🎶',
            title: '现场音乐',
            desc: '转场去 University Ave 的 live house 收尾。',
            travel: '🚶 8 分钟',
          },
        ],
      },
    ],
  },
  weekend: {
    title: (i) => `周末 · ${i.title}`,
    when: '本周六 09:30',
    anchorTime: '10:30',
    anchorTravel: '🚗 15 分钟',
    variants: [
      {
        vibe: '☀️ 户外松弛日',
        before: [
          {
            time: '09:30',
            emoji: '☕️',
            title: '晨间咖啡',
            desc: 'Philz Coffee 来一杯本地人最爱的手冲,慢慢醒神。',
          },
        ],
        after: [
          {
            time: '13:00',
            emoji: '🥗',
            title: '收尾午餐',
            desc: 'California Ave 找家有户外座位的馆子收尾。',
            travel: '🚗 12 分钟',
          },
        ],
      },
      {
        vibe: '🎟️ 文化探索日',
        before: [
          {
            time: '09:45',
            emoji: '🛍️',
            title: '逛逛市集',
            desc: '先去加州大道的周末市集淘点小东西。',
          },
        ],
        after: [
          {
            time: '13:00',
            emoji: '🍦',
            title: '甜点歇脚',
            desc: '活动结束顺路吃个冰淇淋,歇歇脚。',
            travel: '🚶 10 分钟',
          },
        ],
      },
    ],
  },
  family: {
    title: (i) => `家庭日 · ${i.title}`,
    when: '本周六 10:00',
    anchorTime: '10:00',
    anchorTravel: '',
    variants: [
      {
        vibe: '🧺 轻松遛娃日',
        before: [],
        after: [
          {
            time: '12:00',
            emoji: '🥞',
            title: '家庭午餐',
            desc: 'Town & Country Village,有儿童餐和高脚椅。',
            travel: '🚗 10 分钟',
          },
          {
            time: '14:00',
            emoji: '🛝',
            title: '公园放电',
            desc: '去 Magical Bridge 游乐场让孩子跑一跑。',
            travel: '🚗 8 分钟',
          },
        ],
      },
      {
        vibe: '🍓 田园体验日',
        before: [],
        after: [
          {
            time: '12:30',
            emoji: '🧺',
            title: '户外野餐',
            desc: '就近铺开野餐垫,吃顿轻松的户外午饭。',
            travel: '🚶 5 分钟',
          },
          {
            time: '14:30',
            emoji: '🍦',
            title: '冰淇淋时间',
            desc: '回程路上来个冰淇淋,给今天画上句号。',
            travel: '🚗 12 分钟',
          },
        ],
      },
    ],
  },
}

/** Number of distinct plan variants (moods) available for an item. */
export function planVariantCount(item: FeedItem): number {
  return PLAN_TEMPLATE[item.vertical].variants.length
}

export function generatePlan(item: FeedItem, variant = 0): Plan {
  const t = PLAN_TEMPLATE[item.vertical]
  const v = t.variants[((variant % t.variants.length) + t.variants.length) % t.variants.length]
  const anchor: PlanStop = {
    time: t.anchorTime,
    emoji: item.emoji,
    title: item.title,
    desc: item.blurb,
    travel: t.anchorTravel || undefined,
    image: item.image,
    anchor: true,
  }
  return {
    id: `plan-${item.id}-${Date.now()}`,
    vertical: item.vertical,
    title: t.title(item),
    when: t.when,
    vibe: v.vibe,
    basedOnId: item.id,
    basedOnTitle: item.title,
    stops: [...v.before, anchor, ...v.after],
    createdAt: Date.now(),
  }
}
