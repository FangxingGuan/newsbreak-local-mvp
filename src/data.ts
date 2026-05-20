// Mock data for the demo: the local feed + a lightweight plan generator.
// No network, no API keys — everything here is deterministic fake content.
// Localized for a user in Palo Alto, CA: real neighborhoods & landmarks,
// plausible (fictional) venue names.

import type { FeedItem, Plan, PlanStop, Vertical } from './types'

/** The user's current location, shown in the feed app bar. */
export const USER_LOCATION = 'Palo Alto, CA'

export const VERTICALS: { id: Vertical; label: string; emoji: string }[] = [
  { id: 'dining', label: '约会聚餐', emoji: '🍷' },
  { id: 'weekend', label: '周末活动', emoji: '🎟️' },
  { id: 'family', label: '家庭活动', emoji: '🧸' },
]

export const FEED: FeedItem[] = [
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

export function getItem(id: string): FeedItem | undefined {
  return FEED.find((i) => i.id === id)
}

// ---- Lightweight plan generator -------------------------------------------
// Given a feed item, slot it into a small vertical-specific itinerary.
// Supporting stops reference real Palo Alto spots.

const PLAN_TEMPLATE: Record<
  Vertical,
  { title: (i: FeedItem) => string; when: string; before: PlanStop[]; after: PlanStop[]; anchorTime: string }
> = {
  dining: {
    title: (i) => `${i.neighborhood} 约会夜`,
    when: '本周五 18:00',
    anchorTime: '19:00',
    before: [
      {
        time: '18:00',
        emoji: '🌇',
        title: 'University Ave 散步集合',
        desc: '沿 University Ave 逛逛橱窗、看看落日,慢慢热场。',
      },
    ],
    after: [
      {
        time: '21:00',
        emoji: '🍨',
        title: '餐后甜点',
        desc: '走到 University Ave 上的意式冰淇淋店,边走边聊。',
      },
    ],
  },
  weekend: {
    title: (i) => `周末 · ${i.title}`,
    when: '本周六 09:30',
    anchorTime: '10:30',
    before: [
      {
        time: '09:30',
        emoji: '☕️',
        title: '晨间咖啡',
        desc: 'Philz Coffee · 先来一杯本地人最爱的手冲,顺路取上装备。',
      },
    ],
    after: [
      {
        time: '12:30',
        emoji: '🥗',
        title: '收尾午餐',
        desc: 'California Ave · 找家有户外座位的馆子收尾。',
      },
    ],
  },
  family: {
    title: (i) => `家庭日 · ${i.title}`,
    when: '本周六 10:00',
    anchorTime: '10:00',
    before: [],
    after: [
      {
        time: '12:00',
        emoji: '🥞',
        title: '家庭午餐',
        desc: 'Town & Country Village · 有儿童餐和高脚椅,孩子友好。',
      },
      {
        time: '14:00',
        emoji: '🛝',
        title: '公园放电',
        desc: 'Mitchell Park · 饭后去 Magical Bridge 游乐场跑一跑。',
      },
    ],
  },
}

export function generatePlan(item: FeedItem): Plan {
  const t = PLAN_TEMPLATE[item.vertical]
  const anchor: PlanStop = {
    time: t.anchorTime,
    emoji: item.emoji,
    title: item.title,
    desc: item.blurb,
    anchor: true,
  }
  return {
    id: `plan-${item.id}-${Date.now()}`,
    vertical: item.vertical,
    title: t.title(item),
    when: t.when,
    basedOnId: item.id,
    basedOnTitle: item.title,
    stops: [...t.before, anchor, ...t.after],
    createdAt: Date.now(),
  }
}
