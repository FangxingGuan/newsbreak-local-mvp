// Article-driven feed data.
//
// Each article is a real local-news report supplied to the demo. The POIs it
// mentions were extracted, then enriched with live data from Yelp Fusion /
// Google Places (ratings, review counts, photos, prices captured 2026-05).
// Article bodies are original Chinese summaries of the reporting — not copies.

import type {
  Article,
  CategoryClass,
  DiscoverCard,
  FeedEntry,
  FeedTheme,
  Plan,
  PlanKind,
  PlanSeed,
  PlanStop,
  RadiusStyle,
} from './types'
import assistantPicksRaw from './assistant-picks.json'

export const USER_LOCATION = 'Palo Alto, CA'

// ---- Editorial themes ------------------------------------------------------
// Top-of-feed lanes that bundle existing cards into curated stories — so a
// cold-start user sees "what's the engine surfacing right now?" in one glance
// (closing soon, summer outings, BTS food tour…) instead of a mixed scroll.
// Themes are curatorial; the same card can appear in more than one.

export const THEMES: FeedTheme[] = [
  {
    id: 't-closing',
    emoji: '⏳',
    title: '来不及就没了',
    subtitle: '本地老店告别窗口',
    cover: 'linear-gradient(135deg,#2c3e50,#7b8a99)',
    tagMatch: ['即将结业', '告别', '结业'],
    minEntries: 3,
  },
  {
    id: 't-thrift',
    emoji: '🛍️',
    title: '淘旧物 · 古着',
    subtitle: '二手 · 复古 · 本地小店',
    cover: 'linear-gradient(135deg,#3a6186,#89253e)',
    tagMatch: ['古着', '二手', '复古', '购物'],
    minEntries: 4,
  },
  {
    id: 't-summer',
    emoji: '🍒',
    title: '入夏正当时',
    subtitle: '采摘 · 夏夜 · 户外',
    cover: 'linear-gradient(135deg,#f6d365,#fda085)',
    tagMatch: ['自采农场', '采摘', '夏日活动', '夏日祭', '户外'],
    validUntil: '2026-09-22',
    minEntries: 4,
  },
  {
    id: 't-jp',
    emoji: '🇯🇵',
    title: '湾区日本风',
    subtitle: '日料 · 庭园 · 节庆 · 展览',
    cover: 'linear-gradient(135deg,#c31432,#240b36)',
    tagMatch: [
      '日本文化',
      '日料',
      '寿司',
      '拉面',
      'izakaya',
      'omakase',
      '日式庭园',
      '茶道',
      '夏日祭',
      '抹茶',
    ],
    pinned: ['d-fanime', 'd-asian-art'],
    minEntries: 4,
  },
  {
    id: 't-brunch',
    emoji: '☕',
    title: '慢早午餐 · 咖啡时光',
    subtitle: '懒洋洋的周末上午这样过',
    cover: 'linear-gradient(135deg,#d38312,#a83279)',
    tagMatch: ['早午餐', '咖啡', '烘焙', '面包', '咖啡馆', '甜'],
    minEntries: 4,
  },
  {
    id: 't-museum',
    emoji: '🏛️',
    title: '一日博物馆',
    subtitle: '美术馆 · 历史 · 特展',
    cover: 'linear-gradient(135deg,#283c86,#45a247)',
    tagMatch: ['博物馆', '美术馆', '展览'],
    minEntries: 3,
  },
  {
    id: 't-events',
    emoji: '🎫',
    title: '演出 · 球赛 · 现场',
    subtitle: '订票就能去的本地夜晚',
    cover: 'linear-gradient(135deg,#7f00ff,#e100ff)',
    tagMatch: ['演唱会', '音乐剧', '现场演出', '演出', '体育', '话剧', '音乐'],
    minEntries: 4,
  },
  {
    id: 't-family',
    emoji: '🧸',
    title: '带娃出门',
    subtitle: '亲子 · 科普 · 玩乐',
    cover: 'linear-gradient(135deg,#ff9966,#ff5e62)',
    tagMatch: ['亲子', '玩乐', '科普'],
    minEntries: 5,
  },
  {
    id: 't-new-shops',
    emoji: '🆕',
    title: '本月新店',
    subtitle: '刚开业 · 还没排起队',
    cover: 'linear-gradient(135deg,#16a085,#f4d03f)',
    tagMatch: ['新店'],
    minEntries: 4,
  },
  {
    id: 't-wine',
    emoji: '🍷',
    title: '小酌一杯',
    subtitle: '葡萄酒 · tasting room · 小酒馆',
    cover: 'linear-gradient(135deg,#7b1f1f,#c54658)',
    tagMatch: ['葡萄酒', '红酒'],
    minEntries: 4,
  },
  {
    id: 't-gardens',
    emoji: '🌿',
    title: '花园慢逛',
    subtitle: '植物园 · 玫瑰园 · 日式庭园',
    cover: 'linear-gradient(135deg,#134e5e,#71b280)',
    tagMatch: ['植物园', '花园', '庭园'],
    minEntries: 4,
  },
]

/**
 * Entries that belong to a theme: pinned ids first (editorial order), then
 * tag-matched entries from the rest, deduped. Sourced from the live feed
 * order so the natural newest-first sort applies inside the theme.
 */
export function themeEntries(theme: FeedTheme): FeedEntry[] {
  const all: FeedEntry[] = [...ARTICLES, ...DISCOVER]
  const byId = new Map(all.map((e) => [e.id, e]))
  const tagHit = (e: FeedEntry) =>
    !!theme.tagMatch &&
    e.tags.some((t) => theme.tagMatch!.some((n) => t.includes(n)))
  const seen = new Set<string>()
  const out: FeedEntry[] = []
  for (const id of theme.pinned ?? []) {
    const e = byId.get(id)
    if (e && !seen.has(e.id)) {
      out.push(e)
      seen.add(e.id)
    }
  }
  for (const e of all) {
    if (!seen.has(e.id) && tagHit(e)) {
      out.push(e)
      seen.add(e.id)
    }
  }
  return out
}

/** A theme is shown only if it has enough entries and hasn't expired. */
export function isThemeLive(theme: FeedTheme, now = new Date()): boolean {
  if (theme.validUntil && new Date(theme.validUntil) < now) return false
  return themeEntries(theme).length >= (theme.minEntries ?? 3)
}

/**
 * Humanised relative time for a card's pipeline-update timestamp. Shown on
 * each card so the user can see when this entry landed in the feed.
 */
export function relAdded(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 0) return '刚刚'
  const m = Math.round(ms / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m} 分钟前`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} 小时前`
  const d = Math.round(h / 24)
  if (d < 30) return `${d} 天前`
  return iso.slice(0, 10)
}

export const ARTICLES: Article[] = [
  {
    id: 'a-bts-vesta',
    source: 'San Francisco Chronicle',
    sourceUrl:
      'https://www.sfchronicle.com/entertainment/music/article/bts-pizza-pickleball-22264673.php',
    publishedAgo: '3 天前',
    topic: '名人 · 美食',
    headline: 'BTS 赛前低调探店,把湾区这家披萨小馆带火了',
    dek: '成员 V 在斯坦福演唱会上夸了一句披萨,粉丝顺藤摸瓜找到了它',
    emoji: '🍕',
    cover: 'linear-gradient(135deg,#f9a826,#e8112d)',
    comments: 318,
    reactions: 1240,
    intent: '去 Vesta 打卡 BTS 同款 Sausage & Honey 披萨',
    tags: ['披萨', '意餐', '约会'],
    body: [
      '韩国男团 BTS 五月在斯坦福体育场连开数场售罄演唱会,期间也在湾区四处走动。成员 V 在首场演出上提到当地一家披萨店很好吃,粉丝根据他的描述很快锁定了这家店。',
      '据报道,这家店是位于 Redwood City 的 Vesta。V 在台上说,下次再来斯坦福还要去吃那家披萨,并称「斯坦福这边的披萨最好吃」。',
      'BTS 一行点了好几张披萨,其中包括三份招牌的 Sausage & Honey(香肠蜂蜜)披萨,并在餐厅的私人后厅用餐,有安保陪同。',
      '消息传开后,这家本地小馆迅速走红,成了粉丝们的打卡目的地。',
    ],
    pois: [
      {
        id: 'vesta',
        name: 'Vesta',
        category: 'Pizza · Wine Bar',
        emoji: '🍕',
        status: 'open',
        blurb: 'BTS 同款 · 招牌 Sausage & Honey 披萨,Redwood City 老牌人气小馆。',
        neighborhood: 'Redwood City',
        distance: '5.5 mi',
        rating: 4.5,
        reviews: 2628,
        price: '$$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/8wNIwFvsQvBAuFFHmBuxQQ/o.jpg',
        cover: 'linear-gradient(135deg,#f9a826,#e8112d)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/vesta-redwood-city',
        googleUrl: 'https://www.google.com/maps?cid=7970927703422746725',
        quotes: [
          {
            source: 'Yelp',
            author: 'Emily C.',
            rating: 5,
            text: 'Who’s here after hearing that BTS visited right before their Stanford show?',
          },
          {
            source: 'Google',
            author: 'Alyanna P.',
            rating: 5,
            text: 'I’ve been looking for a legit pizza spot and I found the one!',
          },
        ],
      },
    ],
  },
  {
    id: 'a-kirana',
    source: 'The Mountain View Voice',
    sourceUrl:
      'https://www.mv-voice.com/menlo-park/2026/05/19/kirana-bakehouse-menlo-park-sourdough-bread/',
    publishedAgo: '1 天前',
    topic: '新店 · 烘焙',
    headline: '前软件工程师在 Menlo Park 家里开起微型面包房',
    dek: '一段去巴黎学烘焙的间隔年,变成了一门连接社区的生意',
    emoji: '🍞',
    cover: 'linear-gradient(135deg,#e0a96d,#8a5a2b)',
    comments: 56,
    reactions: 287,
    intent: '下单尝鲜本地手作酸种面包',
    tags: ['烘焙', '面包', '新店'],
    body: [
      '曾是软件工程师的 Vanya Weng 于 2026 年 3 月在 Menlo Park 的 The Willows 街区开了一家家庭式微型面包房 Kirana Bakehouse,主打按订单现做的酸种面包。',
      '此前她到法国休了一段间隔年,在当地学习艺术与烘焙,回来后决定把这份热情做成一门能连接社区的小生意。',
      '她的酸种引子取名 Albus,是在巴黎蓝带厨艺学校养出来的,如今是整个面包房的核心。',
      '面包口味从咸味的 everything 调味、车达-墨西哥辣椒,到甜口的草莓白巧克力都有,每个 12–16 美元,下单后 2–3 天内配送到 Palo Alto、Menlo Park 和 Atherton 的居民。',
    ],
    pois: [
      {
        id: 'kirana',
        name: 'Kirana Bakehouse',
        category: 'Bakery · 配送',
        emoji: '🍞',
        status: 'open',
        blurb: '家庭微型面包房 · 按单现做酸种 · 配送到 Palo Alto / Menlo Park / Atherton。',
        neighborhood: 'Menlo Park · The Willows',
        distance: '',
        rating: 5.0,
        reviews: 5,
        price: '$12–16 / 个',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/yWiUht_ytjU0i1x7_P27LA/o.jpg',
        cover: 'linear-gradient(135deg,#e0a96d,#8a5a2b)',
        via: 'Yelp',
        note: '2026 年 3 月新开 · 支持配送到家',
        yelpUrl: 'https://www.yelp.com/biz/kirana-bakehouse-palo-alto',
        quotes: [
          {
            source: 'Yelp',
            author: 'Naoko O.',
            rating: 5,
            text: 'Just tried this new small-batch sourdough company and I’m honestly blown away.',
          },
          {
            source: 'Yelp',
            author: 'Shruti M.',
            rating: 5,
            text: 'Tried the pesto, cheddar-jalapeño and olive sourdoughs — tasted amazing.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-haraz',
    source: 'The Mountain View Voice',
    sourceUrl:
      'https://www.mv-voice.com/mountain-view/2026/05/19/haraz-coffee-house-mountain-view-yemeni-coffee/',
    publishedAgo: '1 天前',
    topic: '新店 · 咖啡',
    headline: '也门咖啡馆 Haraz 落子 Mountain View,六月开业',
    dek: '硅谷的也门咖啡馆热潮又添一员',
    emoji: '☕️',
    cover: 'linear-gradient(135deg,#3a6073,#16222a)',
    comments: 41,
    reactions: 198,
    intent: '也门咖啡馆本月开业 · 加入期待清单',
    tags: ['咖啡', '也门咖啡', '新店'],
    body: [
      '源自美国密歇根州、2021 年创立的也门咖啡连锁 Haraz Coffee House 将进驻 Mountain View,预计 2026 年六月在 California 街的 Landsby 公寓楼下开业 —— 目前该品牌在全美已有 50 多家门店。',
      'Haraz 专做传统的也门咖啡与茶饮 —— 咖啡的起源,正与也门在全球咖啡贸易早期的中心地位有关。',
      '店主 Savi Singh 是 Fremont 居民,2024 年从公司职位离开转做餐饮。他把这家店定位成一个聚会空间:96 个座位、风格「沉静」,提供免费 Wi-Fi、桌游,还有一个播客录制角。',
      '报道指出,也门咖啡馆近年在硅谷快速增多,原因包括营业到深夜、提供不含酒精的社交场所,以及对多元人群的吸引力。',
    ],
    pois: [
      {
        id: 'haraz',
        name: 'Haraz Coffee House',
        category: 'Coffee · Yemeni',
        emoji: '☕️',
        status: 'opening',
        blurb: '也门咖啡连锁 · 96 座、桌游与播客角,预计六月在 California 街开业。',
        neighborhood: 'Mountain View',
        distance: '3.1 mi',
        cover: 'linear-gradient(135deg,#3a6073,#16222a)',
        note: '2026 年 6 月开业 · 暂无评价',
        yelpUrl: 'https://www.yelp.com/biz/haraz-coffee-house-mountain-view',
      },
      {
        id: 'arwa',
        name: 'Arwa Yemeni Coffee',
        category: 'Coffee · Yemeni',
        emoji: '🫖',
        status: 'open',
        blurb: '文章提到的同类也门咖啡馆 —— 在 Sunnyvale,现在就能去。',
        neighborhood: 'Sunnyvale',
        distance: '7.8 mi',
        rating: 4.5,
        reviews: 158,
        price: '$$',
        cover: 'linear-gradient(135deg,#c79081,#dfa579)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/arwa-yemeni-coffee-sunnyvale',
        googleUrl: 'https://www.google.com/maps?cid=4208013456278592175',
        quotes: [
          {
            source: 'Yelp',
            author: 'Mohamad A.',
            rating: 5,
            text: 'Been coming here since day one and it never misses.',
          },
          {
            source: 'Google',
            author: 'Shivangi K.',
            rating: 5,
            text: 'Beautiful cafe with great insight into Yemeni tea and coffee.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-als',
    source: 'Family Destinations Guide',
    sourceUrl: 'https://familydestinationsguide.com/california-famous-gigantic-cheeseburgers/',
    publishedAgo: '上周',
    topic: '美食 · 必吃',
    headline: '东湾这家小店,藏着一个「巨无霸」级别的芝士汉堡',
    dek: '没有花哨装修,只有大得惊人的汉堡和实在的价格',
    emoji: '🍔',
    cover: 'linear-gradient(135deg,#f7971e,#e8112d)',
    comments: 74,
    reactions: 402,
    intent: '安排一次东湾觅食 · 挑战巨型芝士堡',
    tags: ['汉堡', '美式', '必吃'],
    body: [
      '这篇本地美食栏目介绍了位于 Albany 的 Al\'s Big Burger —— 一家朴实无华的小馆,以分量大得离谱的芝士汉堡闻名,远超一般餐厅所谓的「巨型」尺寸。',
      '文章细数了它的菜单,从 1/3 磅起步,一路到分量惊人的大号汉堡,还有各式配菜。',
      '这里没有时髦的装修,主打的是无修饰的氛围和超高的性价比,是当地人觅食的实在之选。',
    ],
    pois: [
      {
        id: 'als-big-burger',
        name: "Al's Big Burger",
        category: 'Burgers',
        emoji: '🍔',
        status: 'open',
        blurb: '传奇巨型芝士汉堡 · 无修饰小馆 · 性价比惊人,东湾 Albany。',
        neighborhood: 'Albany · 东湾',
        distance: '32.6 mi',
        rating: 4.1,
        reviews: 527,
        price: '$$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/K5b9mSEa4gA8r1-U-7TrIw/o.jpg',
        cover: 'linear-gradient(135deg,#f7971e,#e8112d)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/als-big-burger-albany',
        googleUrl: 'https://www.google.com/maps?cid=15879132614567257032',
        quotes: [
          {
            source: 'Yelp',
            author: 'Gabita H.',
            rating: 5,
            text: 'That spot on San Pablo where you can smell the mesquite grill from the street.',
          },
          {
            source: 'Google',
            author: 'Nayoung L.',
            rating: 5,
            text: 'Albany’s best burger, for sure. Loved the smoky flavor on the patty.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-wagon-wheel',
    source: 'NewsBreak',
    sourceUrl: 'https://mp.newsbreakapp.com/post/161298100?sig=34253BEDA61626B0EFEE1854A0C56B98',
    publishedAgo: '4 天前',
    topic: '美食 · 必吃',
    headline: 'Mountain View 最值得专程一去的烟熏布里斯特午餐',
    dek: '加州橡木慢熏,早上 7 点就开门',
    emoji: '🍖',
    cover: 'linear-gradient(135deg,#cb2d3e,#8e2d4a)',
    comments: 62,
    reactions: 254,
    intent: '找一顿慢熏布里斯特午餐 · 安排去 Wagon Wheel',
    tags: ['烧烤', 'BBQ', '午餐'],
    body: [
      '这篇本地美食推荐介绍了 Mountain View 的 Wagon Wheel Barbecue —— 一家用加州橡木慢熏肉类的烧烤馆。',
      '招牌的布里斯特(牛胸肉)湿润、带着漂亮的烟圈,还会附赠蒜香法棍、腌菜等小食。',
      '店里早上 7 点就开门,先供应早餐塔可和三明治,正餐的烟熏肉类要等到 11 点才上。',
      '店内有带遮阳棚的后院,以及可容纳约 70 人的私人包间;人均消费约 20–30 美元,早餐则在 10 美元以内。',
    ],
    pois: [
      {
        id: 'wagon-wheel',
        name: 'Wagon Wheel Barbecue',
        category: 'BBQ · 烟熏烧烤',
        emoji: '🍖',
        status: 'open',
        blurb: '加州橡木慢熏 · 招牌布里斯特湿润带烟圈,早 7 点开门,人均约 $20–30。',
        neighborhood: 'Mountain View',
        distance: '5.0 mi',
        rating: 4.3,
        reviews: 543,
        price: '$$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/kGKSkvt-XzjoNaU6zQtTgg/o.jpg',
        cover: 'linear-gradient(135deg,#cb2d3e,#8e2d4a)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/wagon-wheel-bbq-mountain-view',
        googleUrl: 'https://www.google.com/maps?cid=16972434848355743265',
        quotes: [
          {
            source: 'Yelp',
            author: 'Morgan G.',
            rating: 5,
            text: 'Food is delicious, service is great — a favorite spot for weekday lunch.',
          },
          {
            source: 'Google',
            author: 'Edward W.',
            rating: 5,
            text: 'Really good BBQ meat — tasty, tender, great portion and priced reasonably.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-tt',
    source: 'San Francisco Chronicle',
    sourceUrl: 'https://www.sfchronicle.com/food/article/tt-supermarket-san-jose-22267469.php',
    publishedAgo: '1 天前',
    topic: '新店 · 开业',
    headline: '加拿大亚洲超市巨头 T&T 首店落地湾区 San Jose',
    dek: '6 月 18 日在 Westgate Center 开业,是 T&T 在加州的第一家店',
    emoji: '🛒',
    cover: 'linear-gradient(135deg,#159957,#155799)',
    comments: 187,
    reactions: 612,
    intent: 'T&T 亚洲超市 San Jose 开业 · 加入期待清单',
    tags: ['亚洲超市', '购物', '新店'],
    body: [
      '以备餐熟食、烘焙柜台和丰富亚洲食材著称的加拿大连锁超市 T&T,将在湾区开出它在加州的第一家门店。',
      '新店定于 6 月 18 日在 San Jose 的 Westgate Center(Saratoga 大道 1600 号)开业,当天上午 8 点开始开业活动,9 点正式对公众开放。',
      '这是 T&T 宣布的三家湾区门店中的第一家 —— 另外两家计划开在旧金山 Geary 大道的 City Center 和 Millbrae 的 Friendship Plaza,预计 2026 年冬季。',
      'San Jose 店将售卖涵盖中、日、韩、东南亚等地的数千种商品,自有品牌包括猪肉灌汤包、葱油饼、韩式烤肉酱和台式香肠;开业前 T&T 还将在 Santana Row 办试吃快闪。',
      'T&T 1993 年创立于加拿大温哥华,总部位于列治文,2024 年在华盛顿州 Bellevue 开出首家美国门店。',
    ],
    pois: [
      {
        id: 'tt-sj',
        name: 'T&T Supermarket — San Jose',
        category: 'Asian Grocery · 超市',
        emoji: '🛒',
        status: 'opening',
        blurb: 'T&T 加州首店 · Westgate Center · 数千种亚洲食材,自有品牌灌汤包、葱油饼等。',
        neighborhood: 'San Jose · Westgate Center',
        distance: '13.4 mi',
        cover: 'linear-gradient(135deg,#159957,#155799)',
        note: '2026 年 6 月 18 日开业 · 暂未营业',
        googleUrl: 'https://www.google.com/maps?cid=9971775399102079921',
      },
    ],
  },
  {
    id: 'a-hmart',
    source: 'San Francisco Chronicle',
    sourceUrl:
      'https://www.sfchronicle.com/eastbay/article/h-mart-asian-grocery-store-supermarket-22245358.php',
    publishedAgo: '今天',
    topic: '社区 · 趋势',
    headline: '亚洲超市在东湾扎堆开业,有人欢迎,也有人不满',
    dek: 'H Mart、Tokyo Central、Osaka Marketplace… 东湾正经历一场亚洲超市热',
    emoji: '🛒',
    cover: 'linear-gradient(135deg,#1d976c,#2c3e50)',
    comments: 274,
    reactions: 731,
    intent: '去 Dublin 的 H Mart 逛亚洲超市与美食广场',
    tags: ['亚洲超市', '韩式', '购物'],
    body: [
      '在东湾,大型亚洲超市正成为郊区购物中心新的「主力租户」。今年三月开业的 Dublin H Mart 就是个代表 —— 据零售商称,它已是这家韩国连锁全美表现最好的门店之一。',
      '到今年底,东湾至少会有三家大型亚洲超市开业,还有一家旗舰店即将动工。这既是经济利好,偶尔也成为文化摩擦点:有老居民抱怨停车拥挤,也有居民热烈欢迎这些新去处。',
      '热潮背后是东湾人口结构的快速变化 —— Dublin、Pleasanton、San Ramon 等城市的亚裔比例已相当高;城市官员则看重这些超市带来的客流与销售税收入。',
      '除了 H Mart,日式超市 Tokyo Central 已在 Emeryville 开业,Osaka Marketplace 将进驻 Pleasant Hill,H Mart 还计划在 Fremont 建全美最大门店。许多新店都配有美食广场,把「买菜」变成一种体验。',
    ],
    pois: [
      {
        id: 'hmart-dublin',
        name: 'H Mart — Dublin',
        category: 'Korean Grocery · 超市',
        emoji: '🛒',
        status: 'open',
        blurb: 'H Mart 三月新开 · 韩式食材与美食广场,据称已是全美表现最好的门店之一。',
        neighborhood: 'Dublin · 东湾',
        distance: '21.4 mi',
        rating: 3.6,
        reviews: 111,
        price: '$$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/sSmQj7r_J3CUEKKwl02IYA/o.jpg',
        cover: 'linear-gradient(135deg,#1d976c,#2c3e50)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/h-mart-dublin-2',
        googleUrl: 'https://www.google.com/maps?cid=239428105310963976',
        quotes: [
          {
            source: 'Yelp',
            author: 'Timothy N.',
            rating: 5,
            text: 'I visited the new H Mart in Dublin — days after the grand opening it was still really busy.',
          },
          {
            source: 'Yelp',
            author: 'Roy A.',
            rating: 5,
            text: 'The second you enter, the rich, sweet aroma hits you.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-minipot',
    source: 'SFGATE',
    sourceUrl: 'https://www.sfgate.com/food/article/mini-potstickers-sf-22259114.php',
    publishedAgo: '今天',
    topic: '美食 · 必吃',
    headline: 'Outer Sunset 的「迷你」饺子小馆,成了旧金山的生煎包明星',
    dek: '拇指大小的生煎包,还有旧金山少见的「中式卷饼」',
    emoji: '🥟',
    cover: 'linear-gradient(135deg,#e65c00,#f9d423)',
    comments: 96,
    reactions: 388,
    intent: '去 Outer Sunset 吃拇指大小的生煎包',
    tags: ['中餐', '饺子', '小馆'],
    body: [
      'Mini Potstickers 2023 年开在旧金山 Outer Sunset 的 Irving 街上,是一家只有约 300 平方英尺、十来张小桌的迷你餐馆。',
      '它的招牌其实是「拇指大小的生煎包」—— 比常见生煎小一半,皮薄底脆、咬开爆汁;店名里的「potstickers(锅贴)」只是为了让顾客更容易理解。',
      '今年三月,Top Chef 选手、旧金山人 Melissa King 发的一条探店视频几天内播放破 5 万,把这家本地人「私藏」的小店彻底带火,高峰期要等约 20 分钟才有位子。',
      '老板 Lili Liu 和 Hong Yao 分别来自北京和上海,合计有 40 年餐饮经验。除了生煎,菜单还有牛肉面、煎饼果子(被称作「中式卷饼」)、豆腐花和辣味馄饨,几乎全部手工现做,连辣椒油都自家熬制。',
      '一个周末,这家小店能做出约 3000 个迷你生煎和 2000 个辣馄饨。去年底一场变电站火灾让它停电两天、损失了备货,Melissa King 的视频来得正是时候。',
    ],
    pois: [
      {
        id: 'minipot',
        name: 'Mini Potstickers',
        category: 'Dumplings · 中餐',
        emoji: '🥟',
        status: 'open',
        blurb: '约 300 平尺的迷你小馆 · 招牌拇指生煎包,还有牛肉面、煎饼果子,几乎全手工。',
        neighborhood: 'San Francisco · Outer Sunset',
        distance: '28.9 mi',
        rating: 4.2,
        reviews: 286,
        price: '$$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/sOjWBkh1EwKUaVQ_HtMGTw/o.jpg',
        cover: 'linear-gradient(135deg,#e65c00,#f9d423)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/mini-potstickers-san-francisco',
        googleUrl: 'https://www.google.com/maps?cid=3561005319876248371',
        quotes: [
          {
            source: 'Yelp',
            author: 'Khonesavanh D.',
            rating: 4,
            text: 'Their mini potstickers are the star of the show!',
          },
          {
            source: 'Google',
            author: 'Matt P.',
            rating: 5,
            text: 'A nice little place — you can actually watch the cooking from the window.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-mixt',
    source: 'KRON4',
    sourceUrl:
      'https://www.newsbreak.com/kron4-news-1589914/4660792681671-fast-casual-salad-chain-taking-over-longtime-family-run-walnut-creek-deli',
    publishedAgo: '2 天前',
    topic: '社区 · 开业',
    headline: '百年熟食店谢幕,沙拉新店 MIXT 接手 Walnut Creek 原址',
    dek: '经营 58 年的 Genova Deli 二月关门,夏季将迎来高端沙拉连锁',
    emoji: '🥗',
    cover: 'linear-gradient(135deg,#56ab2f,#a8e063)',
    comments: 129,
    reactions: 463,
    intent: 'Walnut Creek 沙拉新店夏季开业 · 加入期待清单',
    tags: ['沙拉', '轻食', '新店'],
    body: [
      '据报道,高端沙拉连锁 MIXT 将于今年夏天在 Walnut Creek 开出新店,地址正是已歇业的百年家族熟食店 Genova Deli 原址。',
      'Genova Deli 在经营 58 年后于今年二月关门。MIXT 创始人 Leslie Silverglide 表示,公司「想进 Walnut Creek 已经超过 15 年」。',
      '新店将提供堂食与通过 MIXT App 下单的外带,沙拉定价在 13–20 美元之间。该连锁目前在湾区、洛杉矶和德州共有约 20 家门店。',
    ],
    pois: [
      {
        id: 'mixt-wc',
        name: 'MIXT — Walnut Creek',
        category: 'Salad · Fast Casual',
        emoji: '🥗',
        status: 'opening',
        blurb: 'Genova Deli 原址 · 高端沙拉连锁,提供堂食与 App 外带,沙拉 $13–20。',
        neighborhood: 'Walnut Creek',
        distance: '31.5 mi',
        price: '$13–20',
        cover: 'linear-gradient(135deg,#56ab2f,#a8e063)',
        note: '2026 年夏季开业 · 暂未营业',
      },
      {
        id: 'genova',
        name: 'Genova Delicatessen',
        category: 'Deli · 已歇业',
        emoji: '🥪',
        status: 'closed',
        blurb: '经营 58 年的百年家族熟食店,今年二月已歇业,原址将由 MIXT 接手。',
        neighborhood: 'Walnut Creek',
        distance: '31.5 mi',
        cover: 'linear-gradient(135deg,#8e9eab,#636f77)',
        note: '已歇业',
      },
    ],
  },
  {
    id: 'a-oakland-thrift',
    addedAt: '2026-05-20T10:00:00Z',
    source: 'The Thrifty Apartment',
    sourceUrl:
      'https://thethriftyapartment.com/i-checked-out-oaklands-thrift-scene-and-these-stores-impressed-me-most/',
    publishedAgo: '1 天前',
    topic: '生活 · 购物',
    headline: '逛遍奥克兰旧物店,这几家最让人挪不动腿',
    dek: 'College Ave 一条街就能淘一下午 —— 一份本地古着寻宝地图',
    emoji: '🛍️',
    cover: 'linear-gradient(135deg,#6a3093,#a044ff)',
    comments: 74,
    reactions: 392,
    intent: '安排一次 Rockridge 古着寻宝 · College Ave 一条街逛下来',
    tags: ['古着', '购物', '复古'],
    body: [
      '旧物寻宝是奥克兰最有性格的逛街方式之一 —— 这家店是复古家具和旧黑胶,隔壁可能就是穿旧了的牛仔和怪趣家居小物。本地生活媒体 The Thrifty Apartment 实地逛了一圈,挑出几家最难忘的店。',
      'Rockridge 的 College Ave 是这趟寻宝最顺的一段:Crossroads Trading 风格现代、好上手,常被当作起点;往北几个门面是 The Wardrobe Project,九十年代和千禧风的单品配上小众配饰,店里还兼做社区市集。',
      '同在 College Ave 的 Mercy Vintage 更偏「时装史」,选品大胆讲究,真古着与「未来古着」混搭;再往 Grand Lake 走是 ReLove Oakland,一家黑人女性经营的店,策展感强,把复古、设计师二手与现代单品搭得很统一。',
      '报道还提到 Dimond、Lake Merritt、东奥克兰等片区的旧物店各有脾气 —— 有的塞到顶、适合肯花时间翻,有的更精挑细选。一条 College Ave 走下来,一个下午就够淘的。',
    ],
    pois: [
      {
        id: 'crossroads-trading',
        name: 'Crossroads Trading',
        category: '古着 · 二手寄卖',
        emoji: '👗',
        status: 'open',
        blurb: 'Oakland 古着寻宝最稳的起点 · 现代风、好上手。',
        neighborhood: 'Rockridge, Oakland',
        distance: '33 mi',
        rating: 3.0,
        reviews: 395,
        price: '$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/TexQgyGUgIFCxJ3kXMcDZg/o.jpg',
        cover: 'linear-gradient(135deg,#6a3093,#a044ff)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/crossroads-trading-oakland',
        googleUrl: 'https://www.google.com/maps?cid=3319377437494074144',
        quotes: [
          {
            source: 'Yelp',
            author: 'Abi H.',
            rating: 4,
            text: "Crossroads is great for a clean & high quality 'thrifting' experience.",
          },
        ],
      },
      {
        id: 'wardrobe-project',
        name: 'The Wardrobe Project',
        category: '古着 · 二手寄卖',
        emoji: '🧥',
        status: 'open',
        blurb: 'Rockridge 的 90s/Y2K 古着 · 兼做社区市集。',
        neighborhood: 'Rockridge, Oakland',
        distance: '33 mi',
        rating: 4.7,
        reviews: 23,
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/nfWVu2N33MpZbyJvP633MQ/o.jpg',
        cover: 'linear-gradient(135deg,#6a3093,#a044ff)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/the-wardrobe-project-oakland',
        googleUrl: 'https://www.google.com/maps?cid=3202157444350404686',
        quotes: [
          {
            source: 'Yelp',
            author: 'Regina A.',
            rating: 5,
            text: 'The amount of times I have found the perfect low rise jeans here!! Love the vibes I get when I walk in.',
          },
        ],
      },
      {
        id: 'mercy-vintage',
        name: 'Mercy Vintage',
        category: '古着 · 二手寄卖',
        emoji: '👜',
        status: 'open',
        blurb: '偏时装史的选品 · 真古着与「未来古着」混搭。',
        neighborhood: 'Rockridge, Oakland',
        distance: '33 mi',
        rating: 4.1,
        reviews: 95,
        price: '$$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/kWSsjZFkcU0BF7rQK7zTgA/o.jpg',
        cover: 'linear-gradient(135deg,#6a3093,#a044ff)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/mercy-vintage-oakland-2',
        googleUrl: 'https://www.google.com/maps?cid=3977374473920423577',
        quotes: [
          {
            source: 'Yelp',
            author: 'Ted R.',
            rating: 4,
            text: 'Vintage consignment shop. Very stylish selection — tasteful items on the racks.',
          },
        ],
      },
      {
        id: 'relove-oakland',
        name: 'ReLove Oakland',
        category: '古着 · 二手寄卖',
        emoji: '👗',
        status: 'open',
        blurb: '黑人女性经营的策展感小店 · Grand Lake。',
        neighborhood: 'Grand Lake, Oakland',
        distance: '35 mi',
        rating: 4.6,
        reviews: 14,
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/Tkt62ivNzfJ-q5LEzhL4ZQ/o.jpg',
        cover: 'linear-gradient(135deg,#6a3093,#a044ff)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/relove-oakland-oakland',
        googleUrl: 'https://www.google.com/maps?cid=2652608931342007051',
        quotes: [
          {
            source: 'Yelp',
            author: 'Avey S.',
            rating: 5,
            text: 'More than just a clothing store — a thriving community space with impeccable curation and design.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-uncle-johns',
    addedAt: '2026-05-20T10:00:00Z',
    source: 'Go To Destinations',
    sourceUrl: 'https://www.gotodestinations.com/must-try-pancake-house-san-jose-ca/',
    publishedAgo: '1 天前',
    topic: '美食 · 早午餐',
    headline: '圣何塞这家排队也值的老牌煎饼屋',
    dek: 'The Alameda 街上的本地早午餐据点 —— 出餐快、分量大',
    emoji: '🥞',
    cover: 'linear-gradient(135deg,#f6d365,#fda085)',
    comments: 64,
    reactions: 271,
    intent: '周末去 Uncle John’s 吃一顿丰盛早午餐',
    tags: ['早午餐', '煎饼', '美式'],
    body: [
      '圣何塞的早午餐选择不少,但本地人一次次带着朋友回去的,是 The Alameda 街上的 Uncle John’s Pancake House。',
      '这是一家老派的煎饼屋:出餐快、分量大,煎台的滋滋声和咖啡的香气,是那种实打实、让人安心的美式早餐。',
      '招牌自然是煎饼,蓬松厚实;煎蛋、薯饼、法式吐司这些经典早餐项也都做得稳。Yelp 上一千多条评价、4.4 分,常年要排队。',
      '报道把它形容成「总是满座、且满座有道理」的那类店 —— 不靠花样,靠把一顿普通早餐认真做好。',
    ],
    pois: [
      {
        id: 'uncle-johns',
        name: 'Uncle John’s Pancake House',
        category: '早午餐 · 美式煎饼',
        emoji: '🥞',
        status: 'open',
        blurb: '排队也要吃的圣何塞老派煎饼 · 一份顶两顿。',
        neighborhood: 'The Alameda, San Jose',
        distance: '14 mi',
        rating: 4.4,
        reviews: 1023,
        price: '$$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/gUQahdfGW9ro93D-8ggdxw/o.jpg',
        cover: 'linear-gradient(135deg,#f6d365,#fda085)',
        via: 'Yelp',
        yelpUrl:
          'https://www.yelp.com/biz/uncle-johns-pancake-house-the-alameda-san-jose',
        googleUrl: 'https://www.google.com/maps?cid=3405539193598996364',
        quotes: [
          {
            source: 'Yelp',
            author: 'Karina S.',
            rating: 5,
            text: 'One of my fav brunch spots in SJ! Portion sizes are massive — great bang for your buck.',
          },
          {
            source: 'Yelp',
            author: 'Joanna M.',
            rating: 3,
            text: 'Presentation was nice; the potatoes were seasoned well. A classic busy diner.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-good-place-books',
    addedAt: '2026-05-20T10:00:00Z',
    source: 'SFGATE',
    sourceUrl:
      'https://www.sfgate.com/sf-culture/article/oakland-bookstore-closing-montclair-22259109.php',
    publishedAgo: '2 天前',
    topic: '社区 · 书店',
    headline: '开了二十多年的奥克兰社区书店,六月中旬要关门了',
    dek: 'Montclair Village 的独立书店谢幕 —— 想去的话,只剩几周',
    emoji: '📚',
    cover: 'linear-gradient(135deg,#274046,#5b7c8d)',
    comments: 138,
    reactions: 506,
    intent: '趁结业前,去 A Great Good Place for Books 探一次店',
    tags: ['即将结业', '书店', '社区', '独立小店'],
    body: [
      '开在奥克兰 Montclair Village 二十多年的独立书店 A Great Good Place for Books,将在 6 月中旬结业。',
      '店主 Kathleen Caldwell 今年 62 岁,4 月对外宣布了这个决定。她告诉 SFGATE,原因是经营上的:「当投入比收入还多时,你得认真想想它还撑不撑得下去。」',
      '生意从去年 7 月起转淡,今年 1 月明显感到营收比上一年「降了不少」。她说 Montclair Village 整体都冷清了,附近几家店近几个月陆续关张 ——「大家不怎么逛街了,不逛,我们就没理由继续开。」',
      '这是一家老街坊一年年回去的小书店,办过无数读书会和作者分享会。想去的话,留给大家的时间只剩几周。',
    ],
    pois: [
      {
        id: 'good-place-books',
        name: 'A Great Good Place for Books',
        category: '书店 · 独立书店',
        emoji: '📚',
        status: 'open',
        blurb: 'Montclair 的小书店开了 20 多年 · 只剩两周可以来告别。',
        neighborhood: 'Montclair, Oakland',
        distance: '36 mi',
        rating: 4.5,
        reviews: 91,
        price: '$$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/QW6jKu3yFGDS_lVHoAkL3w/o.jpg',
        cover: 'linear-gradient(135deg,#274046,#5b7c8d)',
        via: 'Yelp',
        note: '6 月中旬结业 · 把握最后探店机会',
        yelpUrl: 'https://www.yelp.com/biz/a-great-good-place-for-books-oakland',
        googleUrl: 'https://www.google.com/maps?cid=1329494692118127922',
        quotes: [
          {
            source: 'Yelp',
            author: 'Morgan W.',
            rating: 5,
            text: 'I love my neighborhood bookstores. The ladies here have always been nothing but friendly.',
          },
          {
            source: 'Yelp',
            author: 'Jo W.',
            rating: 4,
            text: 'A tiny, cozy bookstore — I always enjoyed coming here to browse. Staff is really nice.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-cafe-bolita',
    addedAt: '2026-05-21T10:00:00Z',
    source: 'Eater SF',
    sourceUrl: 'https://sf.eater.com/dining-report/212499/cafe-bolita-review',
    publishedAgo: '6 天前',
    topic: '美食 · 必吃',
    headline: '伯克利这家 masa 餐厅,被 Eater 称作「玉米面天堂」',
    dek: '从快闪摊做成常驻店 —— 主厨用传统玉米面征服了一票食客',
    emoji: '🌮',
    cover: 'linear-gradient(135deg,#e1b12c,#c23616)',
    comments: 88,
    reactions: 410,
    intent: '找一顿伯克利 masa 午餐 · 去 Café Bolita',
    tags: ['墨西哥菜', 'masa', '午餐'],
    body: [
      '主厨 Emmanuel Galvan 最早以快闪摊位 Bolita Masa 起家,专攻 masa(玉米面)—— 用稀有的传家宝玉米品种,做塔玛利等食物的面底,慢慢攒下一批死忠食客。',
      '后来他接手了伯克利原 Standard Fare 的店面,2025 年 2 月底把 Bolita 开成常驻餐厅,凭着对 masa 与时令食材的拿捏持续收获关注。Eater 记者说,好吃到「连去了两天」。',
      '招牌里,猪五花脆皮配青莎莎的 burro(15 美元)被点名「别错过」;当季的胡萝卜 masa 塔玛利(16 美元)甜得恰到好处;烤茄子配打发瑞可塔的 tostada(19 美元)也被形容成一道惊喜。',
      '报道直接把它称作「伯克利的玉米面天堂」,并建议把它列进你的午餐清单。',
    ],
    pois: [
      {
        id: 'cafe-bolita',
        name: 'Café Bolita',
        category: '墨西哥菜 · masa 专门店',
        emoji: '🌮',
        status: 'open',
        blurb: '伯克利的玉米面殿堂 · Eater 记者去了两天还想再去。',
        neighborhood: 'West Berkeley',
        distance: '37 mi',
        rating: 4.3,
        reviews: 12,
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/V4DrPxBvPbcV3mzCk_V_YQ/o.jpg',
        cover: 'linear-gradient(135deg,#e1b12c,#c23616)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/bolita-berkeley',
        googleUrl: 'https://www.google.com/maps?cid=2333048724488448263',
        quotes: [
          {
            source: 'Yelp',
            author: 'Cricket H.',
            rating: 5,
            text: "So far I've had the Chilaquiles Rojos — outstanding! And I'm picky.",
          },
          {
            source: 'Yelp',
            author: 'Leila S.',
            rating: 4,
            text: 'I thought it was sensational. Got the Rib Eye Volcan — the flavors were great.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-maillards',
    addedAt: '2026-05-21T10:00:00Z',
    source: 'Eater SF',
    sourceUrl:
      'https://sf.eater.com/dining-report/212433/maillards-two-pitchers-review',
    publishedAgo: '10 天前',
    topic: '美食 · 必吃',
    headline: 'Outer Sunset 的 smash burger,把人排到了店门外',
    dek: '快闪摊做成常驻店 —— 开在一家啤酒厂里的人气汉堡',
    emoji: '🍔',
    cover: 'linear-gradient(135deg,#d35400,#7d3c20)',
    comments: 152,
    reactions: 690,
    intent: '去 Outer Sunset 排一份招牌 smash burger',
    tags: ['汉堡', '啤酒', '美式'],
    body: [
      '旧金山从不缺汉堡,但 Outer Sunset 新开的 Maillards 还是迅速排起了长队。',
      'Maillards 过去几年以 smash burger 快闪摊的形式,在 Outer Sunset 农夫市集和一些餐厅积累人气;如今 Two Pitchers 啤酒厂把主理人 Max Ponzurick 和他的汉堡请进了 Noriega 街的新店,4 月 22 日开业。',
      'Eater 记者在一个周四下午、开门前 20 分钟到,已经排在第 12 位。店里氛围像海边啤酒馆一样松弛,只是那条长队会把用餐区一分为二。',
      '记者给同行的人一个建议:分工合作 —— 一个占座、一个管饮料、一个负责取餐;独自前来也行,边排队边先点杯啤酒。',
    ],
    pois: [
      {
        id: 'maillards',
        name: 'Maillards at Two Pitchers',
        category: 'Smash Burger · 啤酒厂',
        emoji: '🍔',
        status: 'open',
        blurb: 'Outer Sunset 的 smash burger 圣地 · 开门前 20 分钟到也只能排第 12 位。',
        neighborhood: 'Outer Sunset, SF',
        distance: '33 mi',
        rating: 3.8,
        reviews: 33,
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/HvbhNChJD3mmLEfZNAcslw/o.jpg',
        cover: 'linear-gradient(135deg,#d35400,#7d3c20)',
        via: 'Yelp',
        yelpUrl:
          'https://www.yelp.com/biz/maillards-smash-burgers-noriega-san-francisco',
        googleUrl: 'https://www.google.com/maps?cid=4447702942744498774',
        quotes: [
          {
            source: 'Yelp',
            author: 'Dyanna Q.',
            rating: 4,
            text: 'The Maillards / Two Pitchers combination is a fun addition to the Outer Sunset.',
          },
          {
            source: 'Yelp',
            author: 'Chris C.',
            rating: 3,
            text: 'Came for all the publicity about the best smashburger in SF — honestly a touch underwhelming.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-soma-social',
    addedAt: '2026-05-21T10:00:00Z',
    source: 'Eater SF',
    sourceUrl:
      'https://sf.eater.com/restaurant-news/212321/san-francisco-bay-area-restaurant-bar-openings-may-2026',
    publishedAgo: '6 天前',
    topic: '新店 · 开业',
    headline: 'SoMa 新开一家体育主题餐酒吧,从早开到晚',
    dek: '开在 SoMa House 酒店里 —— 满墙球赛、满屋电视',
    emoji: '🏈',
    cover: 'linear-gradient(135deg,#0a3d62,#3c6382)',
    comments: 64,
    reactions: 240,
    intent: '约朋友去 SoMa Social 边看球边吃喝',
    tags: ['运动酒吧', '美式', '聚会'],
    body: [
      '旧金山 SoMa 街区新开了一家体育主题的餐酒吧 SoMa Social,5 月 15 日(周五)正式营业。',
      '它开在第七街靠近 Minna、SoMa House 酒店内,从早餐一路供应到晚餐,是个全天候的去处。',
      '餐食走 gastropub(精酿酒馆菜)路线,下午 3 点到 6 点有 happy hour,鸡尾酒选择也不少。',
      '店里满是体育主题的装饰与周边,配了大量电视 —— 是那种专门用来看比赛的运动酒吧。',
    ],
    pois: [
      {
        id: 'soma-social',
        name: 'SoMa Social',
        category: '运动酒吧 · 餐酒吧',
        emoji: '🏈',
        status: 'open',
        blurb: 'SoMa 新开的体育餐酒吧 · 满墙电视、happy hour 3–6,从早开到晚。',
        neighborhood: 'SoMa, SF',
        distance: '33 mi',
        rating: 5.0,
        reviews: 1,
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/khXm1HPOWqBxUjvBZRI4Bw/o.jpg',
        cover: 'linear-gradient(135deg,#0a3d62,#3c6382)',
        via: 'Yelp',
        note: '2026 年 5 月 15 日开业 · 评价尚少',
        yelpUrl: 'https://www.yelp.com/biz/soma-social-san-francisco',
        quotes: [
          {
            source: 'Yelp',
            author: 'Anthony S.',
            rating: 5,
            text: 'Just opened and stopped in — this place is nice. A much-needed food & drink spot, staff attentive.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-studio-estepan',
    addedAt: '2026-05-21T10:00:00Z',
    source: 'Eater SF',
    sourceUrl: 'https://sf.eater.com/dining-report/212521/studio-estepan-review',
    publishedAgo: '2 天前',
    topic: '新店 · 烘焙',
    headline: '前米其林三星面包师,在西奥克兰开起周末限定面包房',
    dek: 'Quince 出身的 Estevan Silva 自立门户 —— 口碑像野火一样传开',
    emoji: '🥖',
    cover: 'linear-gradient(135deg,#d9a566,#6b4423)',
    comments: 47,
    reactions: 213,
    intent: '周末去 Studio Estepan 买现做面包',
    tags: ['烘焙', '面包', '新店'],
    body: [
      '面包师 Estevan Silva 于 2026 年 3 月在西奥克兰的 O2 Artisans Aggregate 开了自己的面包房 Studio Estepan —— 那是 Magnolia 街上一处聚集了艺术家与食品小生意的园区。',
      '这是一家周末限定的小店,开售日期会提前一个月发在 Instagram 上。Silva 此前在米其林三星餐厅 Quince 当了八年面包师,也为 Cotogna、Verjus 等姐妹店做面包。',
      'Eater 记者最推荐这里的盐面包:海苔口味(5 美元)带一丝鲜味,原味(4 美元)则是教科书级的样子 —— 柔软蓬松的内里,裹着一层紧致发亮的脆壳。',
      '蓝玉米 concha(4.5 美元)是 Silva 的招牌之一,蓝玉米顶料带着独特、不会太甜的「土地味」。报道说,他自立门户后,口碑「像野火一样」传开。',
    ],
    pois: [
      {
        id: 'studio-estepan',
        name: 'Studio Estepan',
        category: '烘焙 · 手作面包',
        emoji: '🥖',
        status: 'open',
        blurb: '三星面包师自立门户 · 只卖周末,蓝玉米 concha 让人专程跑来。',
        neighborhood: 'West Oakland',
        distance: '35 mi',
        cover: 'linear-gradient(135deg,#d9a566,#6b4423)',
        note: '2026 年 3 月开业 · 周末限定,暂未被 Yelp / Google 收录',
      },
    ],
  },
  {
    id: 'a-pizza-shop',
    addedAt: '2026-05-22T12:00:00Z',
    source: 'Go To Destinations',
    sourceUrl: 'https://www.gotodestinations.com/hidden-pizza-gem-nyc-slices-san-francisco/',
    publishedAgo: '1 天前',
    topic: '美食 · 必吃',
    headline: 'Mission 区这家小店,把纽约大切片做到了旧金山',
    dek: '可对折的薄脆 NYC 风格大切片 —— 低调的街角人气店',
    emoji: '🍕',
    cover: 'linear-gradient(135deg,#cb2d3e,#ef473a)',
    comments: 96,
    reactions: 438,
    intent: '去 The Pizza Shop 买一块巨型纽约式披萨',
    tags: ['披萨', '纽约风味', '街角小店'],
    body: [
      '旧金山从不缺花哨的披萨,但 Mission 区的 The Pizza Shop 走的是另一条路 —— 简简单单的纽约大切片。',
      '招牌是可对折的纽约风格切片:薄脆饼底带一点韧劲,在「挺」与「软」之间找到平衡;酱汁有味但不抢戏,让芝士和配料唱主角。',
      '本地人喜欢下班后、看演出前、或深夜嘴馋时拐进来抓一块 —— 走进去、拿一块、几分钟就能吃上,低调随意,像个真正的街坊据点。',
      '评价里反复出现「巨大」二字 —— 在外食越来越贵的旧金山,这种实在的大切片让人觉得划算;整张 NY 派也很适合朋友聚会。',
    ],
    pois: [
      {
        id: 'the-pizza-shop',
        name: 'The Pizza Shop',
        category: 'Pizza · 纽约风味',
        emoji: '🍕',
        status: 'open',
        blurb: '在 SF 真找到一片能折起来的纽约披萨 · 一片实实在在的大。',
        neighborhood: 'Mission, SF',
        distance: '30 mi',
        rating: 4.5,
        reviews: 602,
        price: '$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/2eN8GuSfQvaj7QKBNY0EAg/o.jpg',
        cover: 'linear-gradient(135deg,#cb2d3e,#ef473a)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/the-pizza-shop-san-francisco',
        googleUrl: 'https://www.google.com/maps?cid=3302398241532372927',
        quotes: [
          {
            source: 'Yelp',
            author: 'Kimberly Y.',
            rating: 5,
            text: "Most similar to NY style pizza I've found in SF so far — thin crust, no flop.",
          },
          {
            source: 'Yelp',
            author: 'Jack R.',
            rating: 4,
            text: 'Legit good pizza with a nice thin crust — proper New York style.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-dont-eat-me',
    addedAt: '2026-05-22T12:00:00Z',
    source: 'NBC Bay Area',
    sourceUrl:
      'https://www.nbcbayarea.com/celebrating-aapi-heritage/mountain-view-shop-dont-eat-me/4084937/',
    publishedAgo: '4 天前',
    topic: '本地小店 · 文化',
    headline: 'Mountain View 一家名字古怪的小店,藏着四位亚裔艺术家',
    dek: '从快闪到实体店 —— Don’t Eat Me Collective 把可爱怪趣搬上 Castro Street',
    emoji: '🧸',
    cover: 'linear-gradient(135deg,#ff6b9d,#c44dff)',
    comments: 58,
    reactions: 331,
    intent: '去 Castro Street 逛逛 Don’t Eat Me 小店',
    tags: ['本地小店', '文创', '购物'],
    body: [
      'Mountain View 的 Castro Street 上有一家店,名字很抓人:Don’t Eat Me。店里的东西和名字一样不寻常 —— 胡须龙的毛绒玩具、印着暖心句子的衣服、手作卡片和怪趣艺术。',
      '店背后是 Don’t Eat Me Collective,一个由四位亚裔女性艺术家组成的创作团体。她们各自的风格意外地融成一种统一、惹人喜爱的角色与设计语言。',
      '四人在一次聚餐时发现,其中三位都有台湾背景 —— 这解释了她们共通的审美:大胆、鲜艳、可爱又带点 kitsch。连「Don’t Eat Me」这个有点无厘头的店名,灵感也来自台湾品牌爱起怪名字的传统。',
      '在南湾机构 S.J. Made 的帮助下,她们把这个快闪团体落成了实体店。联合创始人 Madeline Liu 说,希望客人走进来时「像被施了魔法一样」。',
    ],
    pois: [
      {
        id: 'dont-eat-me',
        name: 'Don’t Eat Me',
        category: '文创小店 · 玩具杂货',
        emoji: '🧸',
        status: 'open',
        blurb: '四位亚裔女艺术家的合作小店 · 怪趣可爱,从快闪做成实体。',
        neighborhood: 'Mountain View',
        distance: '4 mi',
        rating: 5.0,
        reviews: 72,
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/fj65O5vvOj2X8zzEhvmmRw/o.jpg',
        cover: 'linear-gradient(135deg,#ff6b9d,#c44dff)',
        via: 'Google',
        yelpUrl: 'https://www.yelp.com/biz/dont-eat-me-mountain-view',
        googleUrl: 'https://www.google.com/maps?cid=10271232527478023387',
        quotes: [
          {
            source: 'Yelp',
            author: 'Ann T.',
            rating: 5,
            text: "I learned about Don't Eat Me from one of my favorite reptile artists — such a charming little shop.",
          },
        ],
      },
    ],
  },
  {
    id: 'a-barbaras-fishtrap',
    addedAt: '2026-05-22T12:00:00Z',
    source: 'Fast Food Club',
    sourceUrl:
      'https://fastfoodclub.com/p/your-first-bowl-of-clam-chowder-at-this-california-hole-in-the-wall-is-impossible-to-forget/',
    publishedAgo: '1 天前',
    topic: '美食 · 必吃',
    headline: 'Half Moon Bay 海边的蛤蜊浓汤,本地人念叨了几十年',
    dek: '不起眼的海鲜小棚 —— 招牌浓汤靠土豆熬出浓稠',
    emoji: '🥣',
    cover: 'linear-gradient(135deg,#2980b9,#2c3e50)',
    comments: 134,
    reactions: 612,
    intent: '去 Barbara’s Fishtrap 喝一碗招牌蛤蜊浓汤',
    tags: ['海鲜', '蛤蜊浓汤', '海边'],
    body: [
      '在 Half Moon Bay 崎岖的海岸线上,Barbara’s Fishtrap 是那种本地人会四处安利、外地人吃过就忘不掉的店。',
      '这家不起眼的海鲜小棚在 281 Capistrano Road 已经开了几十年,招牌蛤蜊浓汤是加州最常被人念叨的之一 —— 它不靠大量奶油,而是用土豆熬出浓稠口感,厚实、扎实、让人上瘾。',
      '浓汤配的面包碗新鲜松软,分量很足、可以续上好几次。报道里有位食客专程从萨克拉门托开车来,说这是他喝过最好的一碗。',
      '除了浓汤,炸鱼也很有名 —— 21 美元能拿到五块裹着酥脆面糊的鳕鱼,配上据说数一数二的薯条;不想吃炸的,也能请厨房改成烤的。',
    ],
    pois: [
      {
        id: 'barbaras-fishtrap',
        name: 'Barbara’s Fishtrap',
        category: '海鲜 · 蛤蜊浓汤',
        emoji: '🥣',
        status: 'open',
        blurb: '海边小棚里的蛤蜊浓汤 · 有人专程从萨克拉门托开车来喝。',
        neighborhood: 'Half Moon Bay',
        distance: '20 mi',
        rating: 4.0,
        reviews: 3490,
        price: '$$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/jsZ23dlax91DDOBlUaxG_A/o.jpg',
        cover: 'linear-gradient(135deg,#2980b9,#2c3e50)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/barbaras-fishtrap-half-moon-bay',
        googleUrl: 'https://www.google.com/maps?cid=8382617434255625340',
        quotes: [
          {
            source: 'Yelp',
            author: 'Thao D.',
            rating: 5,
            text: 'Stopped by on a random trip to HMB and have been coming back ever since.',
          },
          {
            source: 'Yelp',
            author: 'Manoh T.',
            rating: 4,
            text: 'I always love a good seafood place — on the water and with history. The menu is great.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-fish-and-bird',
    addedAt: '2026-05-22T12:00:00Z',
    source: 'KRON4',
    sourceUrl:
      'https://www.kron4.com/news/bay-area/japanese-restaurant-in-downtown-berkeley-closing-next-month-been-a-tough-6-1-2-years/',
    publishedAgo: '1 天前',
    topic: '社区 · 餐厅',
    headline: '伯克利市中心这家日料 izakaya,下月中旬要谢幕了',
    dek: '经营六年半的 Fish & Bird —— 6 月 14 日是最后一晚',
    emoji: '🐟',
    cover: 'linear-gradient(135deg,#16222a,#3a6073)',
    comments: 121,
    reactions: 487,
    intent: '趁结业前,去 Fish & Bird 吃一顿告别日料',
    tags: ['即将结业', '日料', 'izakaya', '社区'],
    body: [
      '伯克利市中心的日料店 Fish & Bird Sousaku Izakaya 将在下月中旬谢幕。',
      '据 KRON4 报道,这家位于 Shattuck 大道 2451 号的餐厅在社交媒体上宣布:6 月 14 日(周日)是最后的营业日。',
      '餐厅开业六年半,熬过了疫情那几年的经营冲击。店家在告别中说,这是「艰难的六年半」。',
      'Fish & Bird 主打创作系 izakaya 小馆菜,不少老客把它当作伯克利日料的首选。想去的话,留给大家的时间只剩三周左右。',
    ],
    pois: [
      {
        id: 'fish-and-bird',
        name: 'Fish & Bird Sousaku Izakaya',
        category: '日料 · 创作 izakaya',
        emoji: '🐟',
        status: 'open',
        blurb: '伯克利日料的「艰难六年半」· 6/14 是最后一晚。',
        neighborhood: 'Downtown Berkeley',
        distance: '37 mi',
        rating: 3.9,
        reviews: 442,
        price: '$$$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/efmFoxtxoCyv1-5Wj6N6MA/o.jpg',
        cover: 'linear-gradient(135deg,#16222a,#3a6073)',
        via: 'Yelp',
        note: '6 月 14 日最后营业 · 把握最后探店机会',
        yelpUrl: 'https://www.yelp.com/biz/fish-and-bird-sousaku-izakaya-berkeley',
        googleUrl: 'https://www.google.com/maps?cid=5821675507943956186',
        quotes: [
          {
            source: 'Yelp',
            author: 'Matt C.',
            rating: 5,
            text: 'Top contender for Japanese cuisine in Berkeley — equal parts sophisticated and scrumptious.',
          },
          {
            source: 'Yelp',
            author: 'Nicki A.',
            rating: 5,
            text: 'The ambience was intimate and cozy yet elegant.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-kumako-ramen',
    addedAt: '2026-05-22T18:00:00Z',
    source: 'San Francisco Chronicle',
    sourceUrl: 'https://www.sfchronicle.com/entertainment/article/bts-rm-kumako-ramen-22269837.php',
    publishedAgo: '2 天前',
    topic: '名人 · 美食',
    headline: 'BTS 队长 RM 开唱前,悄悄去了圣何塞这家小拉面店',
    dek: 'BTS 湾区探店再添一站 —— 这次是 Japantown 的 Kumako Ramen',
    emoji: '🍜',
    cover: 'linear-gradient(135deg,#c94b4b,#4b134f)',
    comments: 204,
    reactions: 1015,
    intent: '去 Kumako Ramen 打卡 BTS·RM 同款拉面',
    tags: ['拉面', '日料', '名人探店'],
    body: [
      'BTS 这趟湾区行的美食之旅,似乎是从圣何塞 Japantown 的一碗拉面开始的。',
      '拉面店 Kumako Ramen 透露,队长 RM 在 BTS 斯坦福体育场连开三场演唱会之前,低调造访了它在 Japantown 的店。',
      '店家 5 月 20 日在 Instagram 上写道:「演出还没开始,RM 就悄悄来了一趟 Kumako Ramen Japantown —— 这一刻我们团队不会忘记。」并感谢他「在我们的空间里共度了一段时光」;店家没有透露他点了什么。',
      '对粉丝(ARMY)来说,这又给 BTS 那条非官方的湾区美食地图添了一站 —— 此前也有成员被发现去过 Redwood City 的披萨店 Vesta。',
    ],
    pois: [
      {
        id: 'kumako-ramen',
        name: 'Kumako Ramen Japantown',
        category: '拉面 · 日料',
        emoji: '🍜',
        status: 'open',
        blurb: 'BTS·RM 开唱前悄悄来吃的拉面 · 就在 SJ Japantown。',
        neighborhood: 'Japantown, San Jose',
        distance: '14 mi',
        rating: 3.6,
        reviews: 1238,
        price: '$$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/n1ufOPmexluxViEirIZftw/o.jpg',
        cover: 'linear-gradient(135deg,#c94b4b,#4b134f)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/kumako-ramen-japantown-san-jose',
        googleUrl: 'https://www.google.com/maps?cid=6704161160231133367',
        quotes: [
          {
            source: 'Yelp',
            author: 'Manda Bear B.',
            rating: 5,
            text: 'Cozy, flavorful comfort food in San Jose Japantown — rich, savory broth.',
          },
          {
            source: 'Yelp',
            author: 'Daniel S.',
            rating: 4,
            text: 'Came back for the pork cutlet curry — traditional and good; the karaage was juicy and crisp.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-golden-rule',
    addedAt: '2026-05-22T22:00:00Z',
    source: 'Eater SF',
    sourceUrl: 'https://sf.eater.com/restaurant-news/212588/golden-rule-bar-opening-san-francisco',
    publishedAgo: '1 天前',
    topic: '新店 · 酒吧',
    headline: 'Che Fico 团队首次做酒吧 —— Golden Rule 本周六在 Chase Center 旁开业',
    dek: '主打 70/80/90 后童年记忆的怀旧鸡尾酒',
    emoji: '🍸',
    cover: 'linear-gradient(135deg,#f857a6,#ff5858)',
    comments: 72,
    reactions: 318,
    intent: '开业当天去 Golden Rule 试一杯怀旧主题鸡尾酒',
    tags: ['鸡尾酒', '酒吧', '新店'],
    body: [
      'Che Fico 主厨 David Nayfeld 和合伙人 Matthew Brewer 在旧金山一连开了好几家新店,这次他们把第一次跨入酒吧的尝试落在了 Chase Center 旁的 Thrive City —— 一家名叫 Golden Rule 的新酒吧,5 月 23 日(本周六)开业。',
      '酒水总监 Danielle Peters-Clossey 主理的鸡尾酒单走「童年回忆」风:一杯叫 MIP(Most Improved Player)的把金酒、烟熏龙舌兰、香瓜、苦味开胃酒与味美思混在一起,杯口飘着一层用 Hubba Bubba 西瓜泡泡糖做的雾;另一杯 Halftime Snacks 走的是 Capri-Sun 路线 —— 伏特加、番石榴白兰地、苦味开胃酒、石榴蜂蜜与青柠。',
      '「如果你是 70、80、90 年代生的人,这家店就像给灵魂的一个小拥抱。」Nayfeld 这样告诉 SF Standard。',
      'Golden Rule 是 Back Home Hospitality 团队在 Mission Rock-Mission Bay 一带的第三家店,也是它在 Thrive City 的第二家(另一家是 Che Fico Pizzeria),正好开在牛排馆 Miller & Lux 对面。',
    ],
    pois: [
      {
        id: 'golden-rule',
        name: 'Golden Rule',
        category: '酒吧 · 怀旧主题鸡尾酒',
        emoji: '🍸',
        status: 'opening',
        blurb: 'Che Fico 团队首次做酒吧 · Hubba Bubba 西瓜泡泡糖雾在杯口。',
        neighborhood: 'Thrive City, SF',
        distance: '33 mi',
        cover: 'linear-gradient(135deg,#f857a6,#ff5858)',
        note: '2026 年 5 月 23 日开业 · 暂无评价',
        googleUrl: 'https://www.google.com/maps?cid=8371040821972029130',
      },
    ],
  },
  {
    id: 'a-grand-opening',
    addedAt: '2026-05-22T22:00:00Z',
    source: 'Eater SF',
    sourceUrl: 'https://sf.eater.com/dining-report/212569/grand-opening-review',
    publishedAgo: '2 天前',
    topic: '新店 · 烘焙',
    headline: '前 Mister Jiu’s 烘焙师在西奥克兰开了自己的甜点店,与 Studio Estepan 同一栋',
    dek: '烧蜜派与巴黎蛋挞曾两年入选 NYT 年度最佳',
    emoji: '🥧',
    cover: 'linear-gradient(135deg,#eacda3,#d6ae7b)',
    comments: 64,
    reactions: 286,
    intent: '周末去西奥克兰打 Studio Estepan + Grand Opening 双烘焙连击',
    tags: ['烘焙', '甜点', '新店'],
    body: [
      '烘焙师 Melissa Chou 在 2026 年 2 月把她的人气快闪正式开成了一家独立店 —— Grand Opening 落户西奥克兰的 O2 Artisans Aggregate,和已经在那里营业的 Studio Estepan 共用同一栋。',
      'Chou 出身名厨之手:Aziza、Mourad、Quince、Mister Jiu’s —— 都是米其林星级餐厅。她最早以 Mister Jiu’s 窗口快闪起家,在 Waverly Place 一侧卖手作的亚洲风味甜点(蓝莓波罗包、黑芝麻茶蛋糕等);烧蜜派(burnt honey pie)与巴黎蛋挞分别在 2024 与 2022 年被 NYT 选进年度最佳菜品名单。',
      '在 Oakland 的新店,她把粉丝最爱的那批也都搬了过来。Eater 记者推荐从 Magnolia Slice Box($48)起手:一盒四块的派 —— 烧蜜派、黑芝麻番石榴芝士派、巴黎蛋挞、配焦糖味噌奶霜的巧克力慕斯派;评测说这盒「全线水准都不掉」。',
      '这俩烘焙店共用一栋,周末门口会排起队 —— Studio Estepan 主打面包,Grand Opening 主打甜点,一站可以两吃。',
    ],
    pois: [
      {
        id: 'grand-opening',
        name: 'Grand Opening Bakery',
        category: '烘焙 · 创作甜点',
        emoji: '🥧',
        status: 'open',
        blurb: '前 Mister Jiu’s 甜点师自立门户 · 烧蜜派与巴黎蛋挞两度入选 NYT。',
        neighborhood: 'West Oakland',
        distance: '35 mi',
        cover: 'linear-gradient(135deg,#eacda3,#d6ae7b)',
        note: '2026 年 2 月开业 · 西奥克兰新址暂未被 Yelp / Google 评分收录',
        googleUrl: 'https://www.google.com/maps?cid=14056306740911422482',
      },
    ],
  },
  {
    id: 'a-trumer',
    addedAt: '2026-05-23T10:00:00Z',
    source: 'The Coconut Mama',
    sourceUrl:
      'https://thecoconutmama.com/california-beer-fans-stunned-as-iconic-brewery-shuts-down-local-operations-30-lose-jobs/',
    publishedAgo: '1 天前',
    topic: '社区 · 啤酒',
    headline: '伯克利 Trumer 啤酒厂下周关停 —— 招牌绿瓶 Pils 告别湾区生产',
    dek: '20+ 年地标谢幕,5/29 是 taproom 最后营业日',
    emoji: '🍺',
    cover: 'linear-gradient(135deg,#5a8f3e,#2c4a1c)',
    comments: 142,
    reactions: 587,
    intent: '趁 5/29 关停前,去 Trumer Taproom 喝一杯告别 Pils',
    tags: ['即将结业', '啤酒', 'taproom', 'pilsner'],
    body: [
      '伯克利 Trumer 啤酒厂宣布将在下周关停湾区生产线 —— 招牌的绿瓶 Trumer Pils 不会消失,但「在湾区酿造」的章节就此画上句号。',
      'Trumer 2004 年在伯克利 Fourth Street 开厂,以德式 Pilsner 闻名;那只在加州酒吧、餐厅与超市里随处可见的亮绿色瓶,就是它。被 Firestone Walker Brewing 收购后,生产线将搬到帕索罗布尔斯(Paso Robles)的本厂。',
      '州政府文件显示,33 名员工受影响,**5 月 29 日永久裁员生效**。也就是说,这家在湾区扎根了 20+ 年的啤酒厂,只剩几天的告别窗口。',
      '2023 年才面向公众开放的 taproom 也会随之关闭 —— 它本来是粉丝在「原产地」试酒的唯一去处。想去喝最后一杯 Pils 的话,留下的时间不多了。',
    ],
    pois: [
      {
        id: 'trumer',
        name: 'Trumer Brewery',
        category: '啤酒厂 · 德式 Pilsner',
        emoji: '🍺',
        status: 'open',
        blurb: '湾区那只绿瓶 Pils · 只剩 6 天可以在原产地喝。',
        neighborhood: 'Fourth Street, Berkeley',
        distance: '37 mi',
        rating: 4.3,
        reviews: 106,
        price: '$$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/ugDzDC79hAM4owgzPJbB4w/o.jpg',
        cover: 'linear-gradient(135deg,#5a8f3e,#2c4a1c)',
        via: 'Yelp',
        note: '2026 年 5 月 29 日永久关停 · 把握最后告别窗口',
        yelpUrl: 'https://www.yelp.com/biz/trumer-brewery-berkeley',
        googleUrl: 'https://www.google.com/maps?cid=182139579076154227',
        quotes: [
          {
            source: 'Yelp',
            author: 'Vedran V.',
            rating: 5,
            text: 'Trumer will unfortunately be closing at the end of May 2026 — the iconic pilsner will live on through Paso Robles.',
          },
          {
            source: 'Yelp',
            author: 'Melodie D.',
            rating: 4,
            text: "I'm not usually one who raves about breweries, but I'd definitely go back to Trumer for repeat visits.",
          },
        ],
      },
    ],
  },
  {
    id: 'a-bar-esper',
    addedAt: '2026-05-25T10:00:00Z',
    source: 'The SF Standard',
    sourceUrl: 'https://sfstandard.com/2026/05/24/bar-esper-portuguese-japanese-restaurant/',
    publishedAgo: '1 天前',
    topic: '新店 · 美食',
    headline: '味噌遇上 malasadas —— SF 第一家葡萄牙-日本融合餐厅 Bar Esper 开业',
    dek: 'Tenderloin 区,接手 Jasper’s Corner Tap 原址',
    emoji: '🍤',
    cover: 'linear-gradient(135deg,#e74c3c,#16222a)',
    comments: 81,
    reactions: 296,
    intent: '挑个晚上去 Bar Esper 试 SF 第一家葡日 fusion',
    tags: ['日料', '葡萄牙菜', 'fusion', '新店'],
    body: [
      'SF 的日料 fusion 正在井喷:从秘鲁日料(Chotto Matte)、意大利日料(Ciaorigato)到菲律宾咖啡馆(Kissaten Hi-Fi)—— 现在轮到葡萄牙与日本的组合上桌。',
      'Bar Esper 在 5 月 20 日(本周三)悄悄开业,接手 Tenderloin 区 Hotel Spero 内原 Jasper’s Corner Tap 的店面,是旧金山第一家葡萄牙-日本融合餐厅。',
      '招牌包括:猪排饭 bowl、辛辣蟹肉炒乌冬、peri peri 鸡、葡萄牙香肠配虾饺,以及黑蒜蛋黄酱贯穿全程的 ebi katsu 三明治;早餐有抹茶柠檬奶酥 malasadas 与葡萄牙蛋挞 pastel de nata。',
      '鸡尾酒由本地传奇 bartender Jacques Bezuidenhout(Forgery Bar / Wildhawk)操刀,主打日本酒类搭配 fortified wine。110 座位、L 形临街餐厅,**不做午餐** —— Tenderloin 中午冷清,他们把火力都放在晚上。',
    ],
    pois: [
      {
        id: 'bar-esper',
        name: 'Bar Esper',
        category: '葡萄牙-日本 fusion',
        emoji: '🍤',
        status: 'open',
        blurb: 'SF 第一家葡日 fusion · 味噌芥末配西冷三明治,malasadas 配抹茶柠檬奶酥。',
        neighborhood: 'Tenderloin, SF',
        distance: '33 mi',
        rating: 5.0,
        reviews: 4,
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/KjsKotuoAhzXJaex3IqiWg/o.jpg',
        cover: 'linear-gradient(135deg,#e74c3c,#16222a)',
        via: 'Yelp',
        note: '2026 年 5 月 20 日开业 · Yelp 评价尚少',
        yelpUrl: 'https://www.yelp.com/biz/bar-esper-san-francisco',
        googleUrl: 'https://www.google.com/maps?cid=623290015445002951',
      },
    ],
  },
  {
    id: 'a-uss-hornet',
    addedAt: '2026-05-25T22:00:00Z',
    source: 'Alameda Post',
    sourceUrl: 'https://alamedapost.com/features/alameda-life/after-three-decades-uss-hornet-goodbye-alameda/',
    publishedAgo: '1 天前',
    topic: '社区 · 博物馆',
    headline: '在 Alameda 停了三十年的二战航母 USS Hornet,可能要走了',
    dek: '场地新限制下,基金会在考虑搬去 SF 或其他湾区港口',
    emoji: '✈️',
    cover: 'linear-gradient(135deg,#283c86,#45a247)',
    comments: 167,
    reactions: 521,
    intent: '趁还在 Alameda 时去 USS Hornet 上一次甲板',
    tags: ['博物馆', '历史', '航母'],
    body: [
      '在 Alameda Point 停了将近三十年的 USS Hornet —— 一艘 1943 年建造、参加过太平洋战争的二战航母 —— 可能要搬家了。',
      '运营这艘船的非营利基金会自 1998 年起把它做成了 Sea, Air and Space Museum。基金会说,Alameda 最近收紧了场地能办的大型活动(rave、私人 party 等)的限制,而那些活动恰恰是博物馆主要的资金来源。',
      '组织正在「认真考虑」把这艘 82 岁的航母搬到旧金山或湾区其他港口去。还没有确定的时间表,但「移走」这个选项已经在桌面上。',
      '想去甲板上走走、看看舰载机和当年阿波罗登月舱返航回收用的那条甲板的话,趁它还在 Alameda Point 这一段时间。',
    ],
    pois: [
      {
        id: 'uss-hornet',
        name: 'USS Hornet · Sea, Air and Space Museum',
        category: '博物馆 · 二战航母',
        emoji: '✈️',
        status: 'open',
        blurb: 'Alameda Point 上的二战航母博物馆 · 阿波罗回收功臣,Yelp 4.5 / Google 4.8。',
        neighborhood: 'Alameda Point',
        distance: '36 mi',
        rating: 4.5,
        reviews: 430,
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/Xxrv6uRJC2MqviEq-PpK4Q/o.jpg',
        cover: 'linear-gradient(135deg,#283c86,#45a247)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/uss-hornet-museum-alameda-4',
        googleUrl: 'https://www.google.com/maps?cid=3540376326982033198',
        quotes: [
          {
            source: 'Yelp',
            author: 'Chun M.',
            rating: 5,
            text: 'USS Hornet (CV-12) — 4th Essex-class aircraft carrier built in 1943, served in the Pacific theater.',
          },
          {
            source: 'Yelp',
            author: 'Amber M.',
            rating: 5,
            text: "5th year attending the overnight on the USS Hornet with the Scouts — every year we still learn or see something new.",
          },
        ],
      },
    ],
  },
  {
    id: 'a-belotti',
    addedAt: '2026-05-27T10:00:00Z',
    source: 'Go To Destinations',
    sourceUrl: 'https://www.gotodestinations.com/authentic-italian-spot-oakland-ca/',
    publishedAgo: '1 天前',
    topic: '美食 · 必吃',
    headline: '奥克兰 Rockridge 这家意大利小馆,本地人压着声音安利',
    dek: 'College Ave 上的 Belotti · 名声在外却不张扬',
    emoji: '🍝',
    cover: 'linear-gradient(135deg,#0e8045,#c0392b)',
    comments: 73,
    reactions: 318,
    intent: '订张桌去 Belotti 吃一份招牌 pappardelle',
    tags: ['意大利菜', '意餐', '约会'],
    body: [
      'Oakland 的 Rockridge 街区上,意餐选择不算少,但本地人会压低声音安利的那一家,叫 Belotti Ristorante E Bottega。',
      '位置不张扬 —— College Ave 5403 号,门面小、座位有限,几乎要预订。但 Yelp 上一千一百多条评价稳在 4.4 分,常被点名「最佳手工意面」之一。',
      '招牌是 pappardelle:据 Eater 记者一位食客的形容,「酱汁浓郁又奶香,蘑菇、欧芹、Grana Padano,一份让人想再点一份」。',
      'College Ave 一带本身就值得逛半天 —— 这条街上还有 Crossroads Trading、The Wardrobe Project 等几家古着小店,Belotti 可以作为这一带午餐或晚餐的收尾。',
    ],
    pois: [
      {
        id: 'belotti',
        name: 'Belotti Ristorante E Bottega',
        category: '意大利菜 · 手工意面',
        emoji: '🍝',
        status: 'open',
        blurb: 'Rockridge 的亲密意餐小馆 · 手工 pappardelle 让人想再点一份,Yelp 千余评价稳 4.4。',
        neighborhood: 'Rockridge, Oakland',
        distance: '33 mi',
        rating: 4.4,
        reviews: 1113,
        price: '$$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/6mPMyY0npCrL1wGTJQgnkw/o.jpg',
        cover: 'linear-gradient(135deg,#0e8045,#c0392b)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/belotti-ristorante-e-bottega-oakland',
        googleUrl: 'https://www.google.com/maps?cid=8811260290038589195',
        quotes: [
          {
            source: 'Yelp',
            author: 'The R.',
            rating: 5,
            text: 'Had a wonderful lunch at the bar — pasta is exceptional. Will be back; have been going for years.',
          },
          {
            source: 'Yelp',
            author: 'Candy C.',
            rating: 4,
            text: 'Definitely get the pappardelle — the sauce is rich and creamy with mushrooms, parsley, and Grana Padano.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-held-over',
    addedAt: '2026-05-29T22:00:00Z',
    source: 'The SF Standard',
    sourceUrl: 'https://sfstandard.com/2026/05/29/held-over-vintage-closing-sale-sf/',
    publishedAgo: '1 天前',
    topic: '社区 · 古着',
    headline: 'Haight 街上近 50 年的古着传奇 Held Over,本周六最后一天 —— 全场 $9',
    dek: 'Retro City Fashions 仅存的一家 · 5/30 永久关门',
    emoji: '🧥',
    cover: 'linear-gradient(135deg,#2c3e50,#7b8a99)',
    comments: 156,
    reactions: 624,
    intent: '5/30 关门前去 Held Over 抢一件 $9 古着',
    tags: ['即将结业', '古着', '二手'],
    body: [
      'Haight 街上开了近 50 年的古着店 Held Over,本周末永久关门 —— 它是 Retro City Fashions 仅存的最后一家。',
      '现任店主 Cynthia Anderson 告诉 SF Standard,**最后一天是 5 月 30 日(周六)**;从现在到周六关门,店里每一件 —— 不分款式 —— 统统 $9。',
      '对很多人来说,Held Over 是 Haight 古着记忆的一部分:Members Only 夹克、落地长风衣、傻气的帽子和羽毛围巾,一代代客人在这里淘过。',
      '想留个纪念、或趁 $9 抢一件的话,只剩这一个周末。',
    ],
    pois: [
      {
        id: 'held-over',
        name: 'Held Over',
        category: '古着 · 二手寄卖',
        emoji: '🧥',
        status: 'open',
        blurb: 'Haight 街近 50 年的古着传奇 · 5/30 永久关门,关门前全场 $9。',
        neighborhood: 'Haight St, SF',
        distance: '32 mi',
        rating: 4.3,
        reviews: 178,
        price: '$$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/lwqInG9dYov2IPvoYKl12g/o.jpg',
        cover: 'linear-gradient(135deg,#2c3e50,#7b8a99)',
        via: 'Yelp',
        note: '2026 年 5 月 30 日(周六)最后一天 · 全场 $9',
        yelpUrl: 'https://www.yelp.com/biz/held-over-san-francisco',
        googleUrl: 'https://www.google.com/maps?cid=9364708065751635350',
      },
    ],
  },
  {
    id: 'a-bloom',
    addedAt: '2026-05-29T16:00:00Z',
    source: 'Go To Destinations',
    sourceUrl: 'https://www.gotodestinations.com/cozy-breakfast-bloom-santa-clara/',
    publishedAgo: '1 天前',
    topic: '美食 · 早午餐',
    headline: 'Santa Clara 这家暖光早午餐据点,本地人排队也愿意去',
    dek: 'Bloom · 主打现代早餐与轻午餐,Saratoga 街上的暖窗户',
    emoji: '🍳',
    cover: 'linear-gradient(135deg,#f7971e,#ffd200)',
    comments: 64,
    reactions: 248,
    intent: '挑个周末去 Bloom 排一顿暖光早午餐',
    tags: ['早午餐', '咖啡', '美式'],
    body: [
      'Santa Clara 的 Bloom 是那种第一次去就被「钩」住的店 —— 现代的早餐和轻午餐,自带暖色的家常感。',
      '店开在 202 Saratoga Ave,Yelp 上 1828 条评价、4.3 分。本地人来一回之后,会开始计划下周末再来。',
      '招牌品类是 Eggs Benedict + 自制鸡尾酒 + 各式经典美式早餐,Benedict 量大,几乎一份顶一顿正餐。',
      '人多的时候排队会比较长,记得早点去 —— 也可以打包带走。',
    ],
    pois: [
      {
        id: 'bloom-sc',
        name: 'Bloom',
        category: '早午餐 · 美式',
        emoji: '🍳',
        status: 'open',
        blurb: 'Santa Clara Saratoga 街上的暖窗户早午餐店 · 现代早餐 + 鸡尾酒,周末排队也愿意去。',
        neighborhood: 'Saratoga Ave, Santa Clara',
        distance: '12 mi',
        rating: 4.3,
        reviews: 1828,
        price: '$$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/7k0P8wC9C0MfShETO4FugA/o.jpg',
        cover: 'linear-gradient(135deg,#f7971e,#ffd200)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/bloom-santa-clara',
        googleUrl: 'https://www.google.com/maps?cid=8145557257463476339',
        quotes: [
          {
            source: 'Yelp',
            author: 'Matthew W.',
            rating: 5,
            text: 'Popular American brunch spot — well-lit, decent indoor and outdoor seating, servers are friendly and helpful.',
          },
          {
            source: 'Yelp',
            author: 'Ally Y.',
            rating: 3,
            text: 'Food portions are generous; line for a table is LONG so plan accordingly.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-nearly-new',
    addedAt: '2026-05-29T16:00:00Z',
    source: 'El Estoque',
    sourceUrl: 'https://elestoque.org/2026/05/28/uncategorized/local-thrift-stores-are-the-hidden-gems-of-the-bay-area/',
    publishedAgo: '1 天前',
    topic: '本地小店 · 二手',
    headline: '从 1958 年开到今天,Sunnyvale 这家旧物店把利润捐给女性教育',
    dek: 'Nearly New Shop · 志愿者运营,卖出每一笔都进了奖学金',
    emoji: '🛍️',
    cover: 'linear-gradient(135deg,#a8e063,#56ab2f)',
    comments: 53,
    reactions: 221,
    intent: '挑个下午去 Nearly New 慢慢淘,同时支持本地女性奖学金',
    tags: ['二手', '古着', '社区', '小众'],
    body: [
      '在 Sunnyvale East Maude Ave 上,Nearly New Shop 是那种漆着雏菊、用淡绿做主色调的小店 —— 推门进去既好奇又安心。',
      '店从 1958 年开到现在 —— 中间 1978 年搬到 Palo Alto,1990 年又搬回 Sunnyvale。完全由志愿者运营,隶属于 P.E.O. 国际女性互助组织。',
      '所有营收都用作给本地女性的奖学金。2021 年以来共筹了 197,550 美元,资助过 29 位攻读硕士、博士、本科学位的女性。',
      'Yelp 上 4.5 分 65 条评价,常常被淘到「季节性小摆件」和「老物件」的人安利。',
    ],
    pois: [
      {
        id: 'nearly-new',
        name: 'Nearly New Shop',
        category: '二手店 · 非营利',
        emoji: '🛍️',
        status: 'open',
        blurb: 'Sunnyvale 1958 年开到现在的志愿者旧物店 · 卖出去的每一笔都是本地女性的奖学金。',
        neighborhood: 'Sunnyvale',
        distance: '8 mi',
        rating: 4.5,
        reviews: 65,
        price: '$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/Vs379jdhGRo3KmEuXjsKqg/o.jpg',
        cover: 'linear-gradient(135deg,#a8e063,#56ab2f)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/nearly-new-shop-sunnyvale',
        googleUrl: 'https://www.google.com/maps?cid=11320554242905286598',
        quotes: [
          {
            source: 'Yelp',
            author: 'Cherie M.',
            rating: 5,
            text: 'Absolute gem of a thrift shop — well curated and the volunteers go out of their way to help.',
          },
          {
            source: 'Yelp',
            author: 'Emily K.',
            rating: 5,
            text: 'Very organized, great prices, able to park, great staff.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-liholiho',
    addedAt: '2026-05-28T22:00:00Z',
    source: 'Eater SF',
    sourceUrl: 'https://sf.eater.com/dining-report/212719/liholiho-yacht-club-review-2026',
    publishedAgo: '1 天前',
    topic: '美食 · 必吃',
    headline: 'SF 这家夏威夷融合餐厅开了 10 年,还是值得专程一去',
    dek: 'Liholiho Yacht Club · 主厨 Ravi Kapur 把夏威夷童年和家族文化端上一桌',
    emoji: '🍢',
    cover: 'linear-gradient(135deg,#0a9396,#ee9b00)',
    comments: 102,
    reactions: 419,
    intent: '挑个特别的日子去 Liholiho 吃一顿融合菜',
    tags: ['夏威夷菜', '创意菜', '约会'],
    body: [
      '位于 SF Sutter 街上的 Liholiho Yacht Club 已经开了 10 年 —— Eater 记者最新探访后说:还是值得专程一去。',
      '主厨 Ravi Kapur 难以被归类:常被叫做「夏威夷餐厅」,但其实把他童年在夏威夷的味道、家族里的南亚根脉、以及湾区的食材都揉进了同一桌。',
      '招牌包括啤酒花椒蜂蜜炸鸡、烟熏鳟鱼咖喱卷、海胆奶酥配脆糕。Yelp 上近 3000 条评价稳在 4.5 分,$$ $ 价位,长期是「庆祝晚餐」清单上的常客。',
      '十年是一道门槛 —— Eater 的结论是:十年后,它依然没被时间追上。',
    ],
    pois: [
      {
        id: 'liholiho',
        name: 'Liholiho Yacht Club',
        category: '夏威夷融合 · 创意菜',
        emoji: '🍢',
        status: 'open',
        blurb: '主厨 Ravi Kapur 的招牌融合餐 · 十年没掉队,$$$, 长期「庆祝晚餐」候选名单上。',
        neighborhood: 'Polk-Sutter, SF',
        distance: '32 mi',
        rating: 4.5,
        reviews: 2995,
        price: '$$$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/T4OjmG1dOQWQbKVjWf0QEQ/o.jpg',
        cover: 'linear-gradient(135deg,#0a9396,#ee9b00)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/liholiho-yacht-club-san-francisco-2',
        googleUrl: 'https://www.google.com/maps?cid=12785219178625967625',
        quotes: [
          {
            source: 'Yelp',
            author: 'Crystal C.',
            rating: 5,
            text: 'Each dish felt so special, unique, flavorful — delicious in its own way.',
          },
          {
            source: 'Yelp',
            author: 'Tiffany C.',
            rating: 5,
            text: 'Been here for many celebrations and it never misses — the pacing of the food is really on point.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-shotwells',
    addedAt: '2026-05-28T16:00:00Z',
    source: 'SFGATE',
    sourceUrl: 'https://www.sfgate.com/food/article/sf-bar-shotwells-naked-lady-22264867.php',
    publishedAgo: '1 天前',
    topic: '社区 · 酒吧',
    headline: '比金门大桥还老 —— SF Mission 区这家 1891 年的小酒馆,守着不让它消失',
    dek: 'Shotwell’s · 第 5 老的 SF 酒吧,135 年没永久关过',
    emoji: '🍻',
    cover: 'linear-gradient(135deg,#7d3c20,#16222a)',
    comments: 124,
    reactions: 542,
    intent: '挑个下班去 Shotwell’s 喝一杯,顺手摸摸百年木吧台',
    tags: ['酒吧', '百年老店', '地标'],
    body: [
      '在旧金山「最老酒吧」这件事上没有共识,但所有列表都同意:Mission 区 Shotwell & 20 街口的 Shotwell’s 至少是第 5 老 —— 135 年了。',
      '它 1891 年由德国移民开店,前店卖杂货,后店供啤酒 —— 1906 年大地震、禁酒令、二战 …… 都没让它永久关过门。绰号「Old Man」Cribbin 接手后做了 50 多年,到 1976 年去世。',
      '现在的两个老板 Tom Madonna 和 David Hall 在 2006 年把店买下,本人也亲自做调酒师。Madonna 说,「照顾一个比金门大桥还老的 SF 地标,是种责任」。',
      '高峰时人会溢到门口树荫下的 parklet,里外连成一片 —— 那一刻你会觉得 Shotwell’s 不只是一家社区酒吧,它就是这个社区本身。',
    ],
    pois: [
      {
        id: 'shotwells',
        name: 'Shotwell’s',
        category: '酒吧 · 百年 saloon',
        emoji: '🍻',
        status: 'open',
        blurb: 'Mission 区 1891 年开到现在的小酒馆 · 排得上 SF 第 5 老,门外 parklet 与店内连成一片。',
        neighborhood: 'Mission, SF',
        distance: '30 mi',
        rating: 4.3,
        reviews: 261,
        price: '$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/wRqkPQj93v5u8qxtTRkL3g/o.jpg',
        cover: 'linear-gradient(135deg,#7d3c20,#16222a)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/shotwells-san-francisco',
        googleUrl: 'https://www.google.com/maps?cid=11819181268645175355',
        quotes: [
          {
            source: 'Yelp',
            author: 'Blaise M.',
            rating: 5,
            text: 'A wonderful spot to take a break and relax — open space, cozy booths, great bartenders.',
          },
          {
            source: 'Yelp',
            author: 'Andy N.',
            rating: 5,
            text: 'Found a day bar for a drink to catch up — luckily they were open around 4 in the afternoon.',
          },
        ],
      },
    ],
  },
  {
    id: 'a-oles-waffle',
    addedAt: '2026-05-27T23:00:00Z',
    source: 'Fast Food Club',
    sourceUrl: 'https://fastfoodclub.com/p/this-california-waffle-shop-has-been-serving-old-school-breakfast-comfort-for-generations/',
    publishedAgo: '1 天前',
    topic: '美食 · 经典',
    headline: 'Park Street 上这家 1927 年的华夫小店,本地人守了三代',
    dek: '配方没换过,1927 年开到现在 —— Alameda 的 Ole’s Waffle Shop',
    emoji: '🧇',
    cover: 'linear-gradient(135deg,#f7971e,#a55e2b)',
    comments: 87,
    reactions: 364,
    intent: '挑个周末去 Ole’s 吃一份开了百年的华夫',
    tags: ['早午餐', '美式', '百年老店'],
    body: [
      '在 Alameda Park Street 上,Ole’s Waffle Shop 是那种走进去就像被时间按了暂停键的小店 —— 1927 年开业,做到今天,中间一茬一茬本地人守着它长大。',
      '招牌的华夫面糊配方从 1927 年用到现在,98 年没动过 —— 报道里写,「尝过一口就明白为什么没人敢改」。',
      '除了脆华夫,松饼、现榨橙汁也是经典款。门口经常排队,愿意坐吧台的可以跳过等位,直接看煎台师傅在你面前翻面。',
      'Yelp 上将近 1900 条评价、3.9 分 —— 老 diner 的真实分数,但本地人会反复回去,正是因为它从没想过变酷。',
    ],
    pois: [
      {
        id: 'oles-waffle',
        name: 'Ole’s Waffle Shop',
        category: '美式早餐 · 经典 diner',
        emoji: '🧇',
        status: 'open',
        blurb: 'Alameda 开了 98 年的 diner · 招牌华夫配方从 1927 年没换过,门口经常排队。',
        neighborhood: 'Park St, Alameda',
        distance: '36 mi',
        rating: 3.9,
        reviews: 1897,
        price: '$$',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/VMya_HtTLct1tXbJjFEZcA/o.jpg',
        cover: 'linear-gradient(135deg,#f7971e,#a55e2b)',
        via: 'Yelp',
        yelpUrl: 'https://www.yelp.com/biz/oles-waffle-shop-alameda',
        googleUrl: 'https://www.google.com/maps?cid=10365028996241859396',
        quotes: [
          {
            source: 'Yelp',
            author: 'Maggie Y.',
            rating: 4,
            text: 'A classic island staple that just gets better — still the undisputed champ.',
          },
          {
            source: 'Yelp',
            author: 'JoAnn Y.',
            rating: 5,
            text: "Huge line up front, but you can skip it if you're willing to sit at the counter. Such good food.",
          },
        ],
      },
    ],
  },
  {
    id: 'a-goldpie',
    addedAt: '2026-05-27T23:00:00Z',
    source: 'KQED',
    sourceUrl: 'https://www.kqed.org/arts/13990167/goldpie-pizza-pop-up-richmond-weed-dispensary-east-bay-7-stars',
    publishedAgo: '1 天前',
    topic: '新店 · 美食',
    headline: '东湾最有意思的披萨弹出店 —— 开在 Richmond 一家大麻店门口',
    dek: 'Goldpie · 周日周一限定,前 Rotten City 师傅做主理',
    emoji: '🍕',
    cover: 'linear-gradient(135deg,#f1c40f,#c0392b)',
    comments: 64,
    reactions: 248,
    intent: '周日去 Goldpie 排一份 NY-混搭风披萨',
    tags: ['披萨', '弹出式', '新店'],
    body: [
      '东湾最让人惊喜的新披萨弹出店,开在 Richmond 一家大麻店门口 —— 这事好像不需要太多解释。每周日和周一,7 Stars Holistic Healing Center 的常客排在门口的小帐篷摊前,买一片刚出炉、油亮的辣肠披萨。',
      '这家店叫 Goldpie,主理人 Scott Hataye 白天是 7 Stars 的「budtender」,过去七年里也是 Emeryville 的 Rotten City Pizza 的揉面师 —— 那家开了 17 年的纽约风披萨店去年六月关了门。',
      '披萨用了和 Rotten City 类似的面团(Central Milling 00 + 高筋,冷发酵最长 72 小时),不同的是红酱更浓稠,用 Bianco DiNapoli 整罐番茄熬出来。烤箱是便携 Gozney 迷你披萨炉,温度上到 1000 度。',
      '12–13 英寸的一张,比纽约对折派稍小但更紧实;招牌「Heaven on Earth」的咸甜组合(辣肠、青酱、辣蜜、炸蒜)被记者点名;经典香肠披萨则被形容为「奶酪、酱汁与脆-韧饼底的理想组合」。',
    ],
    pois: [
      {
        id: 'goldpie',
        name: 'Goldpie',
        category: '披萨 · 弹出式',
        emoji: '🍕',
        status: 'open',
        blurb: '前 Rotten City 师傅自立门户 · 周日周一在 7 Stars 大麻店门口烤披萨,12 寸一张。',
        neighborhood: '7 Stars Dispensary, Richmond',
        distance: '40 mi',
        rating: 5.0,
        reviews: 6,
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/PLKNA7Filyfc945hQbzkew/o.jpg',
        cover: 'linear-gradient(135deg,#f1c40f,#c0392b)',
        via: 'Yelp',
        note: '周日周一限定 · 弹出式摊位,Yelp 评价尚少',
        yelpUrl: 'https://www.yelp.com/biz/goldpie-richmond-4',
        googleUrl: 'https://www.google.com/maps?cid=1169918934913181264',
      },
    ],
  },
  {
    id: 'a-gold-palm',
    addedAt: '2026-05-26T16:00:00Z',
    source: 'Eater SF',
    sourceUrl: 'https://sf.eater.com/closings/212388/san-francisco-bay-area-restaurant-closures-may-2026',
    publishedAgo: '1 天前',
    topic: '社区 · 餐厅',
    headline: 'Oakland Uptown 的巴基斯坦派对食 + 鸡尾酒小馆 Gold Palm,5/27 关门',
    dek: 'Bar Shiru 团队的副牌只撑了一年半;楼下小酒馆 Moonglow 留着',
    emoji: '🍸',
    cover: 'linear-gradient(135deg,#3a1c71,#d76d77)',
    comments: 96,
    reactions: 287,
    intent: '5/27 关门前去 Gold Palm 吃个 masala 薯条配一杯',
    tags: ['即将结业', '巴基斯坦菜', '酒吧'],
    body: [
      '在 Oakland Uptown 的 Floral Depot 大楼里,把鸡尾酒和巴基斯坦派对食撮合在一桌的 Gold Palm,将于 5 月 27 日(周三)永久关门。',
      'Gold Palm(以及它楼下的私密小酒馆 Moonglow)由 Bar Shiru 的合伙人 Shirin Raza 和 Daniel Gahr 经营,2024 年 10 月接手了原 Palmetto 的店面,前后只撑了一年半。',
      '店家在闭店通告里把原因归结于「当下的经济环境、疫后持续的逆风、以及在 Oakland Uptown 经营的具体挑战」。',
      'Moonglow 会继续保留 —— 改成单独入口、依然主打鸡尾酒和 Gold Palm 留下来的 masala 薯条等小菜,外加地下电子乐场子。想吃 Gold Palm 招牌组合的话,只剩到 5/27 这一晚。',
    ],
    pois: [
      {
        id: 'gold-palm',
        name: 'Gold Palm',
        category: '酒吧 · 巴基斯坦小食',
        emoji: '🍸',
        status: 'open',
        blurb: 'Bar Shiru 团队的副牌 · 鸡尾酒配 masala 薯条的 Uptown 派对场,5/27 是最后一晚。',
        neighborhood: 'Uptown, Oakland',
        distance: '36 mi',
        rating: 4.4,
        reviews: 51,
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/NbDv6YDERRc_KavTZhCybg/o.jpg',
        cover: 'linear-gradient(135deg,#3a1c71,#d76d77)',
        via: 'Yelp',
        note: '2026 年 5 月 27 日(周三)最后营业 · 把握最后一晚',
        yelpUrl: 'https://www.yelp.com/biz/gold-palm-oakland',
        googleUrl: 'https://www.google.com/maps?cid=6407263301811069929',
        quotes: [
          {
            source: 'Yelp',
            author: 'Tomoko S.',
            rating: 5,
            text: 'The ex-Palmetto / Flora space is now a cute, friendly space for casual cocktails and Pakistani-inspired bites.',
          },
        ],
      },
    ],
  },
]

export function getArticle(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id)
}

// ---- Discover cards ---------------------------------------------------------
// The second card type: recommendations the engine surfaces from API content
// worth a user's attention. Two kinds —
//   find  : under-the-radar Yelp spots (high rating, few reviews — a "新发现")
//   event : trending, time-bound Ticketmaster events
// Note: Yelp/Google don't expose an opening date, so "new" can't be verified
// from the APIs — these are framed honestly as high-rated-but-low-review finds.

export const DISCOVER: DiscoverCard[] = [
  {
    type: 'discover',
    id: 'd-hibari',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Hibari',
    category: 'Sushi · 日料',
    emoji: '🍣',
    cover: 'linear-gradient(135deg,#2c3e50,#4ca1af)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/AlgrKwpEydClDIMd3TOhaw/o.jpg',
    neighborhood: 'Portola Valley',
    distance: '3.9 mi',
    rating: 4.9,
    reviews: 87,
    blurb: '藏在 Portola Valley 的寿司小店 —— 只有 87 条评价却拿到 4.9 分,口碑高得惊人。',
    intent: '找个安静的晚上去 Hibari 吃顿寿司',
    tags: ['寿司', '日料', '小众'],
    quote: {
      source: 'Yelp',
      author: 'Richard L.',
      rating: 5,
      text: 'Truly authentic — the quality here rivals restaurants I’ve visited in Japan.',
    },
    yelpUrl: 'https://www.yelp.com/biz/hibari-portola-valley-2',
  },
  {
    type: 'discover',
    id: 'd-hellskitchen',
    kind: 'event',
    badge: '🔥 本周热门活动',
    title: "Hell's Kitchen (巡演)",
    category: '音乐剧 · 演出',
    emoji: '🎭',
    cover: 'linear-gradient(135deg,#3a1c71,#d76d77)',
    image:
      'https://s1.ticketm.net/dam/a/cc7/e506039e-ce0b-4a57-bdbc-cfa72081acc7_RETINA_PORTRAIT_16_9.jpg',
    neighborhood: 'San Francisco',
    distance: '30.3 mi',
    date: '2026-05-20',
    price: '门票',
    blurb: 'Broadway 音乐剧《Hell’s Kitchen》巡演,本周登陆旧金山 Orpheum 剧院。',
    intent: '订张票去看《Hell’s Kitchen》音乐剧',
    tags: ['音乐剧', '演出', '文化'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fevent%2FZ7r9jZ1A7OkF3&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-redwood',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'The Redwood by Chef Julien',
    category: 'Cafe · 早午餐',
    emoji: '🥐',
    cover: 'linear-gradient(135deg,#d38312,#a83279)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/3nYKrxLzkmzxAXb1VXnMOA/o.jpg',
    neighborhood: 'Palo Alto',
    distance: '1.1 mi',
    rating: 4.8,
    reviews: 60,
    blurb: 'Palo Alto 一家低调的早午餐咖啡馆,主厨手作三明治与糕点,60 条评价稳在 4.8 分。',
    intent: '周末去 The Redwood 吃顿手作早午餐',
    tags: ['早午餐', '咖啡', '三明治'],
    quote: {
      source: 'Yelp',
      author: 'S M.',
      rating: 5,
      text: 'Excellent sandwiches and pastries — some traditional, some very creative and flavorful.',
    },
    yelpUrl: 'https://www.yelp.com/biz/the-redwood-by-chef-julien-palo-alto',
  },
  {
    type: 'discover',
    id: 'd-giants',
    kind: 'event',
    badge: '🔥 本周热门活动',
    title: 'SF Giants vs. White Sox',
    category: '棒球 · MLB',
    emoji: '⚾',
    cover: 'linear-gradient(135deg,#ee6c2b,#1a1a1a)',
    image:
      'https://s1.ticketm.net/dam/a/29d/12ff0046-a332-4bc3-ae3c-85d5778ca29d_RETINA_PORTRAIT_16_9.jpg',
    neighborhood: 'San Francisco',
    distance: '26.9 mi',
    date: '2026-05-22',
    price: '门票',
    blurb: '旧金山巨人队主场迎战芝加哥白袜 —— 去 Oracle Park 看一场 MLB,经典的周末出游。',
    intent: '订张票去 Oracle Park 看场棒球',
    tags: ['棒球', '体育', '演出'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fevent%2FZ7r9jZ1A7Q8jK&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-crust',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Crust — Fresh Sourdough Deli',
    category: 'Deli · 三明治',
    emoji: '🥪',
    cover: 'linear-gradient(135deg,#e0a96d,#8a5a2b)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/WQc0o4Z8LkNu8RLm0FvyUQ/o.jpg',
    neighborhood: 'Palo Alto',
    distance: '1.4 mi',
    rating: 4.8,
    reviews: 125,
    price: '$$',
    blurb: '主打酸种面包三明治的小 deli —— 料足、面包够酸,本地口碑很稳。',
    intent: '中午去 Crust 带个酸种三明治',
    tags: ['三明治', '酸种', 'Deli'],
    quote: {
      source: 'Yelp',
      author: 'Jon Y.',
      rating: 5,
      text: 'Delicious, loaded sandwiches on perfectly sour sourdough — fresh ingredients, cheerful staff.',
    },
    yelpUrl: 'https://www.yelp.com/biz/crust-fresh-sourdough-deli-palo-alto',
  },
  {
    type: 'discover',
    id: 'd-michoacanita',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'La Michoacanita Grill',
    category: 'Tacos · 餐车',
    emoji: '🌮',
    cover: 'linear-gradient(135deg,#f7971e,#ffd200)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/SQdHeFW0rLh_MgR2OheUCw/o.jpg',
    neighborhood: 'East Palo Alto',
    distance: '2.1 mi',
    rating: 4.9,
    reviews: 22,
    blurb: 'East Palo Alto 的塔可餐车 —— 22 条评价高达 4.9 分,典型的本地小众宝藏。',
    intent: '去 La Michoacanita 餐车吃顿地道塔可',
    tags: ['塔可', '墨西哥菜', '餐车'],
    quote: {
      source: 'Yelp',
      author: 'Shay W.',
      rating: 5,
      text: 'One of the cleanest taco trucks with the freshest ingredients — the carne asada quesadillas are to die for.',
    },
    yelpUrl: 'https://www.yelp.com/biz/la-michoacanita-grill-east-palo-alto',
  },
  {
    type: 'discover',
    id: 'd-kathmandu',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Kathmandu Cuisine',
    category: 'Himalayan · 尼泊尔菜',
    emoji: '🍛',
    cover: 'linear-gradient(135deg,#dd5e89,#f7bb97)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/VfZxTt1l6IR4Q2uhusYLXw/o.jpg',
    neighborhood: 'Los Altos',
    distance: '4.8 mi',
    rating: 4.8,
    reviews: 18,
    blurb: 'Los Altos downtown 新开的尼泊尔菜小馆 —— 主打 momo 与印度中式融合,层次丰富,本地人刚发现。',
    intent: '找一晚去 Kathmandu 尝尝尼泊尔菜',
    tags: ['尼泊尔菜', 'momo', '新店'],
    quote: {
      source: 'Yelp',
      author: 'Niraj T.',
      rating: 5,
      text: 'Had been waiting to check this newly opened place — definitely worth it, amazing layered flavors.',
    },
    yelpUrl: 'https://www.yelp.com/biz/kathmandu-cuisine-los-altos-3',
  },
  {
    type: 'discover',
    id: 'd-lunchbox',
    kind: 'event',
    badge: '🔥 本周热门活动',
    title: 'The Lunchbox',
    category: '话剧 · 剧场',
    emoji: '🎭',
    cover: 'linear-gradient(135deg,#42275a,#734b6d)',
    image:
      'https://s1.ticketm.net/dam/c/8cf/a6653880-7899-4f67-8067-1f95f4d158cf_124761_RETINA_PORTRAIT_16_9.jpg',
    neighborhood: 'Berkeley',
    distance: '30.2 mi',
    date: '2026-05-20',
    price: '门票',
    blurb: 'Berkeley Repertory Theatre 上演的话剧《The Lunchbox》,本周开演。',
    intent: '订张票去 Berkeley Rep 看场话剧',
    tags: ['话剧', '剧场', '演出'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fevent%2FZ7r9jZ1A70F7d&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-mias',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: "Mia's Paleteria Y Neveria",
    category: 'Ice Cream · 墨西哥冰品',
    emoji: '🍦',
    cover: 'linear-gradient(135deg,#ee9ca7,#ffdde1)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/mJToR4ZOQUmSPThoylOB0A/o.jpg',
    neighborhood: 'Mountain View',
    distance: '3.6 mi',
    rating: 4.9,
    reviews: 15,
    blurb: 'Mountain View 一个不起眼街角的墨西哥冰品店 —— paleta 冰棍与水果奶昔,15 条评价就 4.9 分。',
    intent: "天热了去 Mia's 吃支墨西哥冰棍",
    tags: ['冰品', '墨西哥', '甜品'],
    quote: {
      source: 'Yelp',
      author: 'Farhana M.',
      rating: 5,
      text: 'Ordered a large fresa con crema — packed full of strawberries with lots of delicious cream.',
    },
    yelpUrl: 'https://www.yelp.com/biz/mias-paleteria-y-neveria-mountain-view',
  },
  {
    type: 'discover',
    id: 'd-larkinpoe',
    kind: 'event',
    badge: '🔥 本周热门活动',
    title: 'Larkin Poe',
    category: '现场音乐 · 根源摇滚',
    emoji: '🎸',
    cover: 'linear-gradient(135deg,#5a3f37,#2c2117)',
    image:
      'https://s1.ticketm.net/dam/a/ebb/bed02c66-2479-4164-8f99-a3adb56bbebb_1839231_RETINA_PORTRAIT_16_9.jpg',
    neighborhood: 'Menlo Park',
    distance: '2.4 mi',
    date: '2026-05-22',
    price: '门票',
    blurb: 'Larkin Poe 姐妹乐队的根源摇滚现场 —— 就在 Menlo Park 的 The Guild Theatre,离你 2.4 mi。',
    intent: '订张票去 The Guild 看场现场',
    tags: ['现场演出', '音乐', 'Live'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fevent%2FZ7r9jZ1A7xo7k&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-haven',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Haven',
    category: 'Wine Bar · 小食',
    emoji: '🍷',
    cover: 'linear-gradient(135deg,#5d4157,#a8caba)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/PsvPfl3FyRjfIQvqXLraRw/o.jpg',
    neighborhood: 'Menlo Park',
    distance: '1.3 mi',
    rating: 4.8,
    reviews: 34,
    blurb: 'Menlo Park 一条小巷里的红酒小馆 —— 自然酒配 tapas,环境安静,很适合约会。',
    intent: '挑个晚上去 Haven 喝杯酒',
    tags: ['红酒', '小酌', '约会'],
    quote: {
      source: 'Yelp',
      author: 'Sung Hee P.',
      rating: 4,
      text: 'Finally checked this wine bar off my list — came for a couple’s date night on the patio.',
    },
    yelpUrl: 'https://www.yelp.com/biz/haven-menlo-park-3',
  },
  {
    type: 'discover',
    id: 'd-stellato',
    kind: 'find',
    badge: '☕️ 本地宝藏咖啡馆',
    title: 'Caffe Stellato',
    category: 'Gelato · 咖啡',
    emoji: '🍨',
    cover: 'linear-gradient(135deg,#7b5e57,#c9b8a8)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/-MktuYJQya7QIHmbkWqeMA/o.jpg',
    neighborhood: 'Palo Alto',
    distance: '1.1 mi',
    rating: 4.7,
    reviews: 61,
    blurb: 'Palo Alto 一家手工 gelato 加咖啡的小店 —— 午餐后散步顺路来一支,61 条评价稳在 4.7 分。',
    intent: '午后去 Caffe Stellato 吃支手工 gelato',
    tags: ['咖啡', 'gelato', '甜品'],
    quote: {
      source: 'Yelp',
      author: 'Amy C.',
      rating: 5,
      text: 'Delicious gelato — we stopped by for dessert after lunch and were greeted so warmly.',
    },
    yelpUrl: 'https://www.yelp.com/biz/caffe-stellato-palo-alto',
  },
  {
    type: 'discover',
    id: 'd-bici',
    kind: 'find',
    badge: '☕️ 本地宝藏咖啡馆',
    title: 'Bici Coffee',
    category: 'Coffee · 咖啡馆',
    emoji: '☕️',
    cover: 'linear-gradient(135deg,#3e5151,#decba4)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/njzQYzLPjpCwwCfMkKVL-Q/o.jpg',
    neighborhood: 'Menlo Park',
    distance: '4.1 mi',
    rating: 4.6,
    reviews: 26,
    blurb: 'Menlo Park 一家藏起来的小咖啡馆 —— 户外座位、备着毯子,是本地人安静的据点。',
    intent: '找个下午去 Bici Coffee 坐坐',
    tags: ['咖啡', '咖啡馆', '小众'],
    quote: {
      source: 'Yelp',
      author: 'Esther C.',
      rating: 5,
      text: 'Love this coffee shop tucked in Menlo Park — such a cute little hangout spot.',
    },
    yelpUrl: 'https://www.yelp.com/biz/bici-coffee-menlo-park',
  },
  {
    type: 'discover',
    id: 'd-fireside',
    kind: 'find',
    badge: '📚 本地独立书店',
    title: 'Fireside Books & More',
    category: 'Bookstore · 独立书店',
    emoji: '📚',
    cover: 'linear-gradient(135deg,#603813,#b29f94)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/XWTTso4Ja5WoyjFfJIeKkg/o.jpg',
    neighborhood: 'Redwood City',
    distance: '5.8 mi',
    rating: 4.8,
    reviews: 27,
    blurb: 'Redwood City 一家温馨的独立书店 —— 选书有趣、店员亲切,适合周末慢慢淘。',
    intent: '抽个空去 Fireside Books 淘几本书',
    tags: ['书店', '阅读', '独立书店'],
    quote: {
      source: 'Yelp',
      author: 'Nawale',
      rating: 5,
      text: 'I loved this bookstore — the nicest staff, a cosy store and such a cool book selection.',
    },
    yelpUrl: 'https://www.yelp.com/biz/fireside-books-and-more-redwood-city',
  },
  {
    type: 'discover',
    id: 'd-novelaffair',
    kind: 'find',
    badge: '📚 本地独立书店',
    title: 'A Novel Affair',
    category: 'Bookstore · 独立书店',
    emoji: '📖',
    cover: 'linear-gradient(135deg,#5614b0,#dbd65c)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/t6nwI1nqHkiglpsMFC9_pQ/o.jpg',
    neighborhood: 'Los Altos',
    distance: '4.6 mi',
    rating: 4.6,
    reviews: 21,
    blurb: 'Los Altos downtown 一家精致的独立书店 —— 橱窗布置很有巧思,书虫值得专程一逛。',
    intent: '去 Los Altos 的 A Novel Affair 逛书店',
    tags: ['书店', '阅读', '独立书店'],
    quote: {
      source: 'Yelp',
      author: 'Elizabeth E.',
      rating: 5,
      text: 'A lovely bookstore — the storefront is super inviting and whimsical.',
    },
    yelpUrl: 'https://www.yelp.com/biz/a-novel-affair-los-altos-2',
  },
  {
    type: 'discover',
    id: 'd-westwind',
    kind: 'find',
    badge: '🌳 本地户外好去处',
    title: 'Westwind Community Barn',
    category: 'Open Space · 户外',
    emoji: '🐴',
    cover: 'linear-gradient(135deg,#56ab2f,#a8e063)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/QaKB6EmKJtWKeAGTh8ehpQ/o.jpg',
    neighborhood: 'Los Altos Hills',
    distance: '5.4 mi',
    rating: 4.8,
    reviews: 12,
    blurb: 'Los Altos Hills 的一片开放空间 —— 马匹在草地上吃草,沿 Page Mill 的步道很适合看日落。',
    intent: '周末去 Westwind Barn 走走步道、看看马',
    tags: ['户外', '徒步', '自然'],
    quote: {
      source: 'Yelp',
      author: 'Jazmine V.',
      rating: 5,
      text: 'What a beautiful area for a hike — right off Page Mill, with horses at the stables.',
    },
    yelpUrl: 'https://www.yelp.com/biz/westwind-community-barn-los-altos-hills-2',
  },
  {
    type: 'discover',
    id: 'd-arizonagarden',
    kind: 'find',
    badge: '🌳 本地户外好去处',
    title: 'Arizona Garden',
    category: 'Botanical Garden · 户外',
    emoji: '🌵',
    cover: 'linear-gradient(135deg,#11998e,#38ef7d)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/6pZIgN57pEyPOimzta6ORQ/o.jpg',
    neighborhood: 'Stanford',
    distance: '1.6 mi',
    rating: 4.6,
    reviews: 74,
    blurb: '斯坦福校园里的仙人掌花园 —— 安静、上镜,藏着不少 19 世纪的多肉,是个本地隐秘角落。',
    intent: '去斯坦福的仙人掌花园散个步',
    tags: ['户外', '植物园', '散步'],
    quote: {
      source: 'Yelp',
      author: 'Sunil R.',
      rating: 5,
      text: 'A hidden gem on campus — peaceful, colorful and full of fascinating cacti and succulents.',
    },
    yelpUrl: 'https://www.yelp.com/biz/arizona-garden-stanford',
  },
  {
    type: 'discover',
    id: 'd-yutori',
    kind: 'find',
    badge: '🍵 本地日式咖啡馆',
    title: 'Yutori',
    category: 'Matcha Cafe · 日式',
    emoji: '🍵',
    cover: 'linear-gradient(135deg,#7ba659,#3a5f0b)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/xe4cT-ySpPlONXn4L7el4A/o.jpg',
    neighborhood: 'Palo Alto',
    distance: '1.6 mi',
    rating: 4.1,
    reviews: 91,
    blurb: 'El Camino 上新开的日式咖啡馆 —— 抹茶、mochi 华夫、司康,还带点 conbini 便利店的味道。',
    intent: '找个下午去 Yutori 喝杯抹茶',
    tags: ['抹茶', '咖啡', '日式'],
    quote: {
      source: 'Yelp',
      author: 'Vicky L.',
      rating: 5,
      text: 'Excited for this new neighbourhood cafe — the Earl grey matcha with a black sesame scone is a favourite.',
    },
    yelpUrl: 'https://www.yelp.com/biz/yutori-palo-alto',
    googleUrl: 'https://www.google.com/maps?cid=10708300136315527516',
  },
  {
    type: 'discover',
    id: 'd-mtjoy',
    kind: 'event',
    badge: '🔥 本周热门活动',
    title: 'Mt. Joy',
    category: '现场音乐 · 民谣摇滚',
    emoji: '🎵',
    cover: 'linear-gradient(135deg,#3a1c71,#d76d77)',
    image:
      'https://s1.ticketm.net/dam/a/54c/1e50f365-4f53-4bbd-8571-f0eb65f5154c_RETINA_PORTRAIT_16_9.jpg',
    neighborhood: 'San Francisco',
    distance: '28.5 mi',
    date: '2026-05-22',
    price: '门票',
    blurb: '人气民谣摇滚乐队 Mt. Joy 十周年巡演,登陆旧金山 The Fillmore。',
    intent: '订张票去 The Fillmore 看 Mt. Joy',
    tags: ['现场演出', '音乐', 'Live'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fmt-joy-2026-celebrating-10-years-san-francisco-california-05-22-2026%2Fevent%2F1C00648799C2C6BE&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-juniormuseum',
    kind: 'find',
    badge: '🧸 本地亲子去处',
    title: 'Palo Alto Junior Museum & Zoo',
    category: 'Museum · 亲子',
    emoji: '🦉',
    cover: 'linear-gradient(135deg,#f7971e,#ffd200)',
    neighborhood: 'Palo Alto',
    distance: '0.2 mi',
    rating: 4.7,
    reviews: 1670,
    blurb: '帕洛阿尔托的少儿博物馆与小动物园 —— 可动手的互动展加鸟、龟等小动物,就在你 0.2 mi 外。',
    intent: '带娃去少儿博物馆与动物园逛一上午',
    tags: ['亲子', '科普', '动物'],
    quote: {
      source: 'Google',
      author: 'Candy M.',
      rating: 5,
      text: 'A great small children’s museum and zoo — friendly, helpful staff.',
    },
    googleUrl: 'https://www.google.com/maps?cid=10995732455523062983',
  },
  {
    type: 'discover',
    id: 'd-curiodyssey',
    kind: 'find',
    badge: '🧸 本地亲子去处',
    title: 'CuriOdyssey',
    category: 'Science Museum · 亲子',
    emoji: '🔬',
    cover: 'linear-gradient(135deg,#43cea2,#185a9d)',
    neighborhood: 'San Mateo',
    distance: '14.1 mi',
    rating: 4.6,
    reviews: 2046,
    blurb: 'San Mateo 的少儿科学馆 —— 环境科学互动展加户外小动物园,还能看到湾景。',
    intent: '安排个周末带孩子去 CuriOdyssey 玩科学',
    tags: ['亲子', '科普', '动物'],
    quote: {
      source: 'Google',
      author: 'Craig M.',
      rating: 5,
      text: 'Really fun science museum and mini zoo for kids, with spectacular views of the Bay.',
    },
    googleUrl: 'https://www.google.com/maps?cid=4792569874821898316',
  },
  {
    type: 'discover',
    id: 'd-cdm',
    kind: 'find',
    badge: '🧸 本地亲子去处',
    title: "Children's Discovery Museum SJ",
    category: 'Museum · 亲子',
    emoji: '🧩',
    cover: 'linear-gradient(135deg,#ff5f6d,#ffc371)',
    neighborhood: 'San Jose',
    distance: '15.9 mi',
    rating: 4.6,
    reviews: 3871,
    blurb: 'San Jose 的大型儿童博物馆 —— 150+ 个互动展项,连一辆真消防车都能爬上去。',
    intent: '找个周末带娃去儿童博物馆',
    tags: ['亲子', '科普', '遛娃'],
    quote: {
      source: 'Google',
      author: 'David U.',
      rating: 5,
      text: 'Staff are great — attentive and friendly, and they take all your concerns seriously.',
    },
    googleUrl: 'https://www.google.com/maps?cid=3873538821499329617',
  },
  {
    type: 'discover',
    id: 'd-magicalbridge',
    kind: 'find',
    badge: '🧸 本地亲子去处',
    title: 'Magical Bridge Playground',
    category: 'Playground · 亲子',
    emoji: '🛝',
    cover: 'linear-gradient(135deg,#4776e6,#8e54e9)',
    neighborhood: 'Palo Alto',
    distance: '2.2 mi',
    rating: 4.8,
    reviews: 1976,
    blurb: '帕洛阿尔托的无障碍游乐场 —— 滑梯、秋千、树屋,各年龄段的孩子都能一起玩。',
    intent: '带孩子去 Magical Bridge 游乐场放电',
    tags: ['亲子', '遛娃', '游乐场'],
    quote: {
      source: 'Google',
      author: 'Mrs. Z',
      rating: 5,
      text: 'This playground is amazing — and very toddler friendly.',
    },
    googleUrl: 'https://www.google.com/maps?cid=2848833799547018230',
  },
  {
    type: 'discover',
    id: 'd-golfland',
    kind: 'find',
    badge: '🎯 周末玩乐去处',
    title: 'Golfland USA',
    category: 'Mini Golf · 玩乐',
    emoji: '⛳',
    cover: 'linear-gradient(135deg,#11998e,#38ef7d)',
    neighborhood: 'Sunnyvale',
    distance: '9.2 mi',
    rating: 4.4,
    reviews: 1975,
    blurb: 'Sunnyvale 的迷你高尔夫加游戏厅 —— 两个 18 洞球道,周末家庭和朋友局的常去处。',
    intent: '约人去 Golfland 打迷你高尔夫',
    tags: ['玩乐', '迷你高尔夫', '亲子'],
    quote: {
      source: 'Google',
      author: 'Edward W.',
      rating: 5,
      text: 'Lots of fun — two 18-hole courses, really good quality and well looked after.',
    },
    googleUrl: 'https://www.google.com/maps?cid=4180011727268090473',
  },
  {
    type: 'discover',
    id: 'd-winterlodge',
    kind: 'find',
    badge: '🎯 周末玩乐去处',
    title: 'Winter Lodge',
    category: 'Ice Skating · 玩乐',
    emoji: '⛸️',
    cover: 'linear-gradient(135deg,#83a4d4,#5b6f9e)',
    neighborhood: 'Palo Alto',
    distance: '1.2 mi',
    rating: 4.5,
    reviews: 560,
    blurb: '帕洛阿尔托的季节性溜冰场 —— 公众场次、教学与派对,本地家庭的老牌去处。',
    intent: '周末带家人去 Winter Lodge 溜冰',
    tags: ['玩乐', '溜冰', '亲子'],
    quote: {
      source: 'Google',
      author: 'Marcela M.',
      rating: 5,
      text: 'Our family loves this place — the girls took skating classes and were so happy.',
    },
    googleUrl: 'https://www.google.com/maps?cid=11371120154578167213',
  },
  {
    type: 'discover',
    id: 'd-bowlmor',
    kind: 'find',
    badge: '🎯 周末玩乐去处',
    title: 'Bowlmor Cupertino',
    category: 'Bowling · 玩乐',
    emoji: '🎳',
    cover: 'linear-gradient(135deg,#3a1c71,#ffaf7b)',
    neighborhood: 'Cupertino',
    distance: '10.7 mi',
    rating: 4.1,
    reviews: 1930,
    blurb: 'Cupertino 的家庭保龄球馆 —— 炫光球道、游戏厅和餐吧,适合带孩子或朋友组局。',
    intent: '组个局去 Bowlmor 打保龄',
    tags: ['玩乐', '保龄球', '朋友局'],
    quote: {
      source: 'Google',
      author: 'Claudia G.',
      rating: 5,
      text: 'Been here twice on Saturday nights — great every time, the staff are wonderful.',
    },
    googleUrl: 'https://www.google.com/maps?cid=579844727596602036',
  },
  {
    type: 'discover',
    id: 'd-fanime',
    addedAt: '2026-05-22T09:00:00Z',
    kind: 'event',
    badge: '🔥 本周热门活动',
    title: 'FanimeCon 2026',
    category: '动漫展 · 二次元',
    emoji: '🎌',
    cover: 'linear-gradient(135deg,#ee0979,#ff6a00)',
    neighborhood: 'San Jose',
    distance: '14 mi',
    date: '2026-05-22',
    price: '门票 $65–105',
    blurb:
      '北加州最大动漫展 · 本周末就在 SJ 会展中心。',
    intent: '订张 badge 去 FanimeCon 看动漫展',
    tags: ['动漫', '二次元', '活动'],
    googleUrl: 'https://www.google.com/maps?cid=8316651831005724690',
  },
  {
    type: 'discover',
    id: 'd-mv-obon',
    addedAt: '2026-05-22T09:00:00Z',
    kind: 'event',
    badge: '🏮 本地夏日活动',
    title: 'Mountain View 盆踊り祭(Obon)',
    category: '夏日祭 · 日本文化',
    emoji: '🏮',
    cover: 'linear-gradient(135deg,#c31432,#240b36)',
    neighborhood: 'Mountain View',
    distance: '4 mi',
    date: '2026-07-18',
    blurb:
      'Mountain View 寺院的盆踊り祭 · 7 月夏夜的传统舞蹈与小吃。',
    intent: '夏天带家人去逛 Obon 盆踊り祭',
    tags: ['日本文化', '夏日祭', '亲子'],
    googleUrl: 'https://www.google.com/maps?cid=15007417484976484042',
  },
  {
    type: 'discover',
    id: 'd-hakone',
    addedAt: '2026-05-22T09:00:00Z',
    kind: 'find',
    badge: '⛩️ 本地日式去处',
    title: 'Hakone Estate and Gardens',
    category: '日式庭园 · 茶道',
    emoji: '⛩️',
    cover: 'linear-gradient(135deg,#136a8a,#267871)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/_PtCYQqoRTIzoNx_orjRkA/o.jpg',
    neighborhood: 'Saratoga',
    distance: '8 mi',
    rating: 4.1,
    reviews: 599,
    blurb:
      'Saratoga 的百年日式庭园 · 每月第一个周日有公开茶道。',
    intent: '挑个周末去 Hakone 日式庭园走走、看场茶道',
    tags: ['日式庭园', '茶道', '户外'],
    quote: {
      source: 'Yelp',
      author: 'Ashley B.',
      rating: 4,
      text: 'Such a tranquil and beautiful spot in Saratoga — we spent about an hour walking around the estate.',
    },
    yelpUrl: 'https://www.yelp.com/biz/hakone-estate-and-gardens-saratoga',
    googleUrl: 'https://www.google.com/maps?cid=2165993171908345922',
  },
  {
    type: 'discover',
    id: 'd-sushi-adachi',
    addedAt: '2026-05-22T09:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Sushi Adachi',
    category: 'Omakase · 高级日料',
    emoji: '🍣',
    cover: 'linear-gradient(135deg,#2c3e50,#bdc3c7)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/SUralS6GXXXiFPlufA7WZg/o.jpg',
    neighborhood: 'Mountain View',
    distance: '3 mi',
    rating: 4.5,
    reviews: 18,
    price: '$$$$',
    blurb:
      'Mountain View 藏起来的高级寿司 · omakase $160 起,要预约。',
    intent: '挑个特别的日子订 Sushi Adachi 的 omakase',
    tags: ['寿司', 'omakase', '日料'],
    quote: {
      source: 'Yelp',
      author: 'Clarisse T.',
      rating: 5,
      text: 'Nice new omakase spot — a no-frills place just how I like it. I could really taste the freshness of each fish.',
    },
    yelpUrl: 'https://www.yelp.com/biz/sushi-adachi-mountain-view',
    googleUrl: 'https://www.google.com/maps?cid=6564942999790863497',
  },
  {
    type: 'discover',
    id: 'd-asian-art',
    addedAt: '2026-05-22T09:00:00Z',
    kind: 'find',
    badge: '🖼️ 本地文化去处',
    title: 'Asian Art Museum(亚洲艺术博物馆)',
    category: '美术馆 · 日本特展',
    emoji: '🖼️',
    cover: 'linear-gradient(135deg,#42275a,#734b6d)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/u_C4De4NjPgBNXYnkwv7cg/o.jpg',
    neighborhood: 'San Francisco',
    distance: '33 mi',
    rating: 4.4,
    reviews: 852,
    blurb:
      '在 SF 美术馆一次看完两场日本特展 · 红线装置 + 当代陶艺。',
    intent: '安排一次美术馆日,去看两场日本特展',
    tags: ['美术馆', '日本文化', '展览'],
    quote: {
      source: 'Yelp',
      author: 'Lauren T.',
      rating: 4,
      text: 'A nice collection of Asian art — the China, Korea, and Japan exhibits are much larger than the others.',
    },
    yelpUrl: 'https://www.yelp.com/biz/asian-art-museum-san-francisco',
    googleUrl: 'https://www.google.com/maps?cid=6096576621440733983',
  },
  {
    type: 'discover',
    id: 'd-liangs-village',
    addedAt: '2026-05-22T12:00:00Z',
    kind: 'find',
    badge: '🍜 值得开车一去的中餐',
    title: 'Liang’s Village(梁家村)',
    category: '台湾菜 · 牛肉面',
    emoji: '🍜',
    cover: 'linear-gradient(135deg,#b06ab3,#4568dc)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/inPxfbovW08ObkIWE_yeGw/o.jpg',
    neighborhood: 'Cupertino',
    distance: '12 mi',
    rating: 3.7,
    reviews: 1501,
    price: '$$',
    blurb: 'Cupertino 的台式牛肉面据点 · 牛筋面被 KQED 点名。',
    intent: '去 Liang’s Village 吃一碗台式牛肉面',
    tags: ['台湾菜', '牛肉面', '中餐'],
    quote: {
      source: 'Yelp',
      author: 'Memi O.',
      rating: 5,
      text: 'Incredible spicy red oil sesame noodles — look for "The Works" on the menu.',
    },
    yelpUrl: 'https://www.yelp.com/biz/liangs-village-cupertino',
    googleUrl: 'https://www.google.com/maps?cid=14027414944527759673',
  },
  {
    type: 'discover',
    id: 'd-mama-chens',
    addedAt: '2026-05-22T12:00:00Z',
    kind: 'find',
    badge: '🍜 值得开车一去的中餐',
    title: 'Ma Ma Chen’s Kitchen',
    category: '台湾菜 · 小吃',
    emoji: '🥟',
    cover: 'linear-gradient(135deg,#e8a13a,#b5651d)',
    neighborhood: 'Cupertino',
    distance: '12 mi',
    rating: 4.1,
    reviews: 368,
    blurb: 'Cupertino 的台式小吃店 · 蚵仔煎、肉圆、刈包要多人分。',
    intent: '约几个人去 Ma Ma Chen’s 点一桌台式小吃',
    tags: ['台湾菜', '小吃', '中餐'],
    googleUrl: 'https://www.google.com/maps?cid=11584721749521377140',
  },
  {
    type: 'discover',
    id: 'd-palette-tea',
    addedAt: '2026-05-22T12:00:00Z',
    kind: 'find',
    badge: '🍜 值得开车一去的中餐',
    title: 'Palette Tea Garden & Dim Sum',
    category: '粤菜 · 点心',
    emoji: '🥢',
    cover: 'linear-gradient(135deg,#1d4350,#a43931)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/B7Aa_RJfseN1BvKtRNnJEg/o.jpg',
    neighborhood: 'San Mateo',
    distance: '15 mi',
    rating: 3.8,
    reviews: 2017,
    price: '$$$',
    blurb: 'Hillsdale 商场里的精致粤菜 · Koi Palace 团队做的点心。',
    intent: '去 Palette Tea Garden 吃一顿精致粤式点心',
    tags: ['粤菜', '点心', '中餐'],
    quote: {
      source: 'Yelp',
      author: 'Johnny Z.',
      rating: 4,
      text: 'Feels more modern and upscale than the typical Cantonese restaurant.',
    },
    yelpUrl: 'https://www.yelp.com/biz/palette-tea-garden-and-dim-sum-san-mateo',
    googleUrl: 'https://www.google.com/maps?cid=9549412682736820287',
  },
  {
    type: 'discover',
    id: 'd-tai-er',
    addedAt: '2026-05-22T12:00:00Z',
    kind: 'find',
    badge: '🍜 值得开车一去的中餐',
    title: 'Tai Er Sichuan Cuisine(太二)',
    category: '川菜 · 酸菜鱼',
    emoji: '🌶️',
    cover: 'linear-gradient(135deg,#c0392b,#2c1810)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/2wml3PgOnp2d-wb71TXuaQ/o.jpg',
    neighborhood: 'San Mateo',
    distance: '15 mi',
    rating: 4.2,
    reviews: 242,
    blurb: '广州起家的太二「升级版」首店 · 招牌猪骨汤酸菜鱼。',
    intent: '去太二吃一锅招牌酸菜鱼',
    tags: ['川菜', '酸菜鱼', '中餐'],
    quote: {
      source: 'Yelp',
      author: 'Amy F.',
      rating: 5,
      text: 'We had to try their signature dish — came at a great time before it got busy.',
    },
    yelpUrl: 'https://www.yelp.com/biz/tai-er-sichuan-cuisine-san-mateo',
    googleUrl: 'https://www.google.com/maps?cid=10454870682169637207',
  },
  {
    type: 'discover',
    id: 'd-webb-ranch',
    addedAt: '2026-05-22T12:00:00Z',
    kind: 'find',
    badge: '🍒 夏日采摘季',
    title: 'U-Pick at Webb Ranch',
    category: '自采农场 · 莓果',
    emoji: '🫐',
    cover: 'linear-gradient(135deg,#56ab2f,#a8e063)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/KZU8aWYPpo01tY9e1cz_wg/o.jpg',
    neighborhood: 'Portola Valley',
    distance: '5 mi',
    rating: 4.1,
    reviews: 20,
    blurb: 'Portola Valley 的有机自采农场 · 六月初开摘,8 点就要到。',
    intent: '六月去 Webb Ranch 摘莓果',
    tags: ['自采农场', '户外', '亲子'],
    quote: {
      source: 'Yelp',
      author: 'William T.',
      rating: 5,
      text: 'Stumbled upon this cute farm on the Peninsula where you can pick your own berries!',
    },
    yelpUrl: 'https://www.yelp.com/biz/u-pick-at-webb-ranch-portola-valley-2',
  },
  {
    type: 'discover',
    id: 'd-mariani',
    addedAt: '2026-05-22T12:00:00Z',
    kind: 'find',
    badge: '🍒 夏日采摘季',
    title: 'Mariani Orchards',
    category: '自采农场 · 樱桃杏子',
    emoji: '🍒',
    cover: 'linear-gradient(135deg,#cb2d3e,#8e2d4a)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/QaBA9zCXDEDzRULBA0fsSA/o.jpg',
    neighborhood: 'Morgan Hill',
    distance: '24 mi',
    rating: 4.5,
    reviews: 8,
    blurb: '本周五开摘 · Morgan Hill 的 Rainier 黄樱桃和 Bing 红樱桃。',
    intent: '周末去 Mariani Orchards 摘樱桃和杏子',
    tags: ['自采农场', '樱桃', '亲子'],
    quote: {
      source: 'Yelp',
      author: 'Greg W.',
      rating: 5,
      text: 'My favorite orchard to pick cherries — they even expanded the parking area.',
    },
    yelpUrl: 'https://www.yelp.com/biz/mariani-orchards-harvest-experience-morgan-hill',
    googleUrl: 'https://www.google.com/maps?cid=12103259836439598001',
  },
  {
    type: 'discover',
    id: 'd-blue-house',
    addedAt: '2026-05-22T12:00:00Z',
    kind: 'find',
    badge: '🍒 夏日采摘季',
    title: 'Blue House Farm',
    category: '自采农场 · 草莓',
    emoji: '🍓',
    cover: 'linear-gradient(135deg,#2193b0,#6dd5ed)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/DoBCp_hCRfFp1f6syzYB1A/o.jpg',
    neighborhood: 'San Gregorio',
    distance: '25 mi',
    rating: 4.8,
    reviews: 80,
    price: '$',
    blurb: 'HMB 海岸线上的有机草莓园 · 周末 12–5 点自采。',
    intent: '挑个周末去 Blue House Farm 摘草莓',
    tags: ['自采农场', '草莓', '亲子'],
    quote: {
      source: 'Yelp',
      author: 'Sandeep R.',
      rating: 5,
      text: 'Went strawberry picking with our two-year-old and had a fantastic time.',
    },
    yelpUrl: 'https://www.yelp.com/biz/blue-house-farm-san-gregorio-2',
    googleUrl: 'https://www.google.com/maps?cid=3129822426916407570',
  },
  {
    type: 'discover',
    id: 'd-rwc-summer',
    addedAt: '2026-05-22T15:00:00Z',
    kind: 'event',
    badge: '🎪 本地夏日活动',
    title: 'Redwood City 夏季广场系列',
    category: '露天音乐会 · 免费',
    emoji: '🎵',
    cover: 'linear-gradient(135deg,#834d9b,#d04ed6)',
    neighborhood: 'Redwood City',
    distance: '6 mi',
    date: '2026-05-29',
    price: '多数免费',
    blurb:
      '20 周年的免费露天音乐会 · 5/29 起每周五傍晚在 RWC 广场。',
    intent: '周五傍晚去 Courthouse Square 听一场免费露天音乐会',
    tags: ['露天音乐会', '夏日活动', '亲子'],
    googleUrl: 'https://www.google.com/maps?cid=1693260971588954190',
  },
  {
    type: 'discover',
    id: 'd-foster-museum',
    addedAt: '2026-05-23T18:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'The Foster Museum',
    category: '艺术馆 · 自然画作',
    emoji: '🖼️',
    cover: 'linear-gradient(135deg,#3a6073,#16222a)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/pAjtgBQsDuE6glDTxY3R3w/o.jpg',
    neighborhood: 'Palo Alto',
    distance: '4 mi',
    rating: 5.0,
    reviews: 35,
    blurb: 'Palo Alto 工业区里藏着一座艺术家个人美术馆 · 自然主题水彩,周末有 Story Time。',
    intent: '挑个周末去 Foster Museum 看 Tony Foster 的自然画作',
    tags: ['美术馆', '艺术', '亲子'],
    quote: {
      source: 'Yelp',
      author: 'Andrew S.',
      rating: 5,
      text: 'A hidden gem in Palo Alto — an industrial-area museum of Tony Foster, an artist of wild places.',
    },
    yelpUrl: 'https://www.yelp.com/biz/the-foster-museum-palo-alto-2',
    googleUrl: 'https://www.google.com/maps?cid=15336699671940501855',
  },
  {
    type: 'discover',
    id: 'd-sour-cherry',
    addedAt: '2026-05-23T18:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Sour Cherry Comics',
    category: '漫画书店 · 文创',
    emoji: '📚',
    cover: 'linear-gradient(135deg,#c0392b,#fd6e6a)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/ghMQLn8HfjrHVnoAhcM1gg/o.jpg',
    neighborhood: 'Mission, SF',
    distance: '30 mi',
    rating: 5.0,
    reviews: 22,
    blurb: 'SF Mission 16 街上的独立漫画店 · 美漫 + 日漫 + 在地小众杂志,店员氛围好。',
    intent: '逛 Mission 时拐进 Sour Cherry 翻翻漫画',
    tags: ['漫画', '书店', '文创'],
    quote: {
      source: 'Yelp',
      author: 'Dave C.',
      rating: 5,
      text: "Lived in the neighborhood 10 years and had no idea this awesome comic and manga shop was so close.",
    },
    yelpUrl: 'https://www.yelp.com/biz/sour-cherry-comics-san-francisco',
    googleUrl: 'https://www.google.com/maps?cid=3684175534748043493',
  },
  {
    type: 'discover',
    id: 'd-black-panther-museum',
    addedAt: '2026-05-23T18:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Black Panther Party Museum',
    category: '博物馆 · 历史',
    emoji: '🏛️',
    cover: 'linear-gradient(135deg,#000000,#434343)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/3Cn1H2NS_jcVSGV2OwOyKA/o.jpg',
    neighborhood: 'Downtown Oakland',
    distance: '36 mi',
    rating: 5.0,
    reviews: 20,
    blurb: 'Downtown Oakland 黑豹党博物馆 · 免费入场,从 BART 站步行一个街区可达。',
    intent: '坐 BART 去 Downtown Oakland 看黑豹党博物馆',
    tags: ['博物馆', '历史', '社区'],
    quote: {
      source: 'Yelp',
      author: 'Danae G.',
      rating: 5,
      text: 'Feels important to have this museum in Downtown Oakland — easily accessible by BART and free admission.',
    },
    yelpUrl: 'https://www.yelp.com/biz/black-panther-party-museum-oakland',
    googleUrl: 'https://www.google.com/maps?cid=4824861385069388740',
  },
  {
    type: 'discover',
    id: 'd-paul-simon',
    addedAt: '2026-05-23T18:00:00Z',
    kind: 'event',
    badge: '🔥 本周热门活动',
    title: 'Paul Simon @ Frost Amphitheatre',
    category: '演唱会 · 音乐传奇',
    emoji: '🎸',
    cover: 'linear-gradient(135deg,#1a2980,#26d0ce)',
    image:
      'https://s1.ticketm.net/dam/a/266/528a570e-dcf3-437c-b3f1-6a7342336266_TABLET_LANDSCAPE_16_9.jpg',
    neighborhood: 'Stanford',
    distance: '2 mi',
    date: '2026-06-03',
    price: '门票',
    blurb: 'Paul Simon 6/3、6/4 连开两晚 · 就在 Stanford 的 Frost 露天剧场,步行可达。',
    intent: '订张票去 Frost 听 Paul Simon',
    tags: ['演唱会', '音乐', '活动'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fevent%2FZ7r9jZ1A7-pxA&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-valkyries',
    addedAt: '2026-05-23T18:00:00Z',
    kind: 'event',
    badge: '🔥 本周热门活动',
    title: 'Golden State Valkyries vs. Las Vegas Aces',
    category: 'WNBA · 篮球',
    emoji: '🏀',
    cover: 'linear-gradient(135deg,#7f00ff,#e100ff)',
    image:
      'https://s1.ticketm.net/dam/a/a5a/44de9aa2-a60d-4392-a2ed-05ea7642ea5a_TABLET_LANDSCAPE_16_9.jpg',
    neighborhood: 'Chase Center, SF',
    distance: '30 mi',
    date: '2026-05-31',
    price: '门票',
    blurb: '湾区新军 Valkyries 主场 vs. 维加斯王牌 · 5/31 周日下午 Chase Center。',
    intent: '订张票去 Chase Center 看一场 WNBA',
    tags: ['篮球', 'WNBA', '体育', '活动'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fgolden-state-valkyries-vs-las-vegas-san-francisco-california-05-31-2026%2Fevent%2F1C006435CB223651&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-kiwa-kitchen',
    addedAt: '2026-05-23T22:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Kiwa Kitchen',
    category: '日料 · 拉面与照烧',
    emoji: '🍜',
    cover: 'linear-gradient(135deg,#6a82fb,#fc5c7d)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/ccMjXXBpWfirmrTQCIDyGw/o.jpg',
    neighborhood: 'Bernal Heights, SF',
    distance: '30 mi',
    rating: 4.9,
    reviews: 23,
    blurb: 'Bernal Heights 的「家常风」日料午餐据点 · 招牌豚骨拉面与照烧便当,街边小店。',
    intent: '中午拐进 Kiwa Kitchen 来碗豚骨拉面',
    tags: ['日料', '拉面', '小众'],
    quote: {
      source: 'Yelp',
      author: 'Manisha D.',
      rating: 5,
      text: 'Delicious ramen and very friendly people — my new go-to lunch in Bernal.',
    },
    yelpUrl: 'https://www.yelp.com/biz/kiwa-kitchen-san-francisco',
    googleUrl: 'https://www.google.com/maps?cid=17370874285774546120',
  },
  {
    type: 'discover',
    id: 'd-bttf-musical',
    addedAt: '2026-05-23T22:00:00Z',
    kind: 'event',
    badge: '🔥 本周热门活动',
    title: 'Back to the Future: The Musical(巡演)',
    category: '音乐剧 · 巡演',
    emoji: '🎭',
    cover: 'linear-gradient(135deg,#ee9ca7,#ffdde1)',
    image:
      'https://s1.ticketm.net/dam/a/dc8/8d1dcde5-4fff-4735-bf2f-1de1b0de3dc8_RETINA_LANDSCAPE_16_9.jpg',
    neighborhood: 'San Jose',
    distance: '14 mi',
    date: '2026-06-02',
    price: '门票',
    blurb: '电影《回到未来》改编的百老汇音乐剧巡演 · 6/2 起在 SJ Center for the Performing Arts。',
    intent: '订张票去 SJ 看《回到未来》音乐剧',
    tags: ['音乐剧', '巡演', '演出'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fback-to-the-future-the-musical-san-jose-california-06-02-2026%2Fevent%2F1C00643A844A8C61&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-sj-giants',
    addedAt: '2026-05-23T22:00:00Z',
    kind: 'event',
    badge: '🔥 本周热门活动',
    title: 'San Jose Giants vs. Inland Empire 66ers',
    category: '小联盟棒球 · 亲子',
    emoji: '⚾',
    cover: 'linear-gradient(135deg,#11998e,#38ef7d)',
    image:
      'https://s1.ticketm.net/dam/c/3c2/23f6a973-82f1-4503-ab46-e890539e13c2_106101_TABLET_LANDSCAPE_LARGE_16_9.jpg',
    neighborhood: 'Excite Ballpark, San Jose',
    distance: '15 mi',
    date: '2026-06-02',
    price: '门票',
    blurb: '不去 Oracle Park 也能看棒球 · SJ Giants 主场 Excite Ballpark,票价亲民、适合带娃。',
    intent: '带孩子去 Excite Ballpark 看一场 SJ Giants',
    tags: ['棒球', '体育', '亲子'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fevent%2FZ7r9jZ1A7QbvS&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-gratta-wines',
    addedAt: '2026-05-24T10:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Gratta Wines',
    category: '酒庄 · Wine Bar',
    emoji: '🍷',
    cover: 'linear-gradient(135deg,#7b1f1f,#c54658)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/cwtN5n6ZU3qJ63GaWvkOqA/o.jpg',
    neighborhood: 'Bayview, SF',
    distance: '32 mi',
    rating: 4.9,
    reviews: 46,
    price: '$$',
    blurb: '本地酿酒人 Barb Gratta 的小酒庄 · Bayview 街角自带 lounge,3 杯或 6 杯品酒套餐。',
    intent: '挑个下午去 Gratta Wines 品几杯本地酒',
    tags: ['葡萄酒', '酒吧', '小酌'],
    quote: {
      source: 'Yelp',
      author: 'Dyanna Q.',
      rating: 5,
      text: 'My favorite local wine bar. Barb Gratta is the owner and winemaker — sells her own wines alongside a great lineup.',
    },
    yelpUrl: 'https://www.yelp.com/biz/gratta-wines-san-francisco',
    googleUrl: 'https://www.google.com/maps?cid=6168498352084176431',
  },
  {
    type: 'discover',
    id: 'd-little-wine-house',
    addedAt: '2026-05-24T10:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Little Wine House',
    category: 'Wine Bar · 小食',
    emoji: '🍷',
    cover: 'linear-gradient(135deg,#403b4a,#e7e9bb)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/vz7kjD_8UDMTmoX9YUEOxg/o.jpg',
    neighborhood: 'Downtown San Jose',
    distance: '15 mi',
    rating: 4.9,
    reviews: 134,
    price: '$$',
    blurb: '圣何塞市中心的小酒馆 · 葡萄酒 + 精酿 + tapas,134 条评价稳在 4.9。',
    intent: '约朋友去 Little Wine House 喝两杯配 tapas',
    tags: ['葡萄酒', '酒吧', '小酌'],
    quote: {
      source: 'Yelp',
      author: 'Michelle L.',
      rating: 5,
      text: 'So cute and cozy! Great wine selection and small plates — I love the atmosphere.',
    },
    yelpUrl: 'https://www.yelp.com/biz/little-wine-house-san-jose',
    googleUrl: 'https://www.google.com/maps?cid=5078485855245921351',
  },
  {
    type: 'discover',
    id: 'd-bay-burgers',
    addedAt: '2026-05-24T10:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Bay Burgers',
    category: '汉堡 · 弹出式',
    emoji: '🍔',
    cover: 'linear-gradient(135deg,#d35400,#7d3c20)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/ToK5ej9Qjy5fdFmHS43vTQ/o.jpg',
    neighborhood: 'Redwood City',
    distance: '6 mi',
    rating: 4.9,
    reviews: 28,
    price: '$$',
    blurb: 'Redwood City 弹出式汉堡摊 · 只在周五周六开,$2 起新鲜手作,无麸质可换。',
    intent: '周五下班去 Bay Burgers 排一份手作汉堡',
    tags: ['汉堡', '美式', '新店'],
    quote: {
      source: 'Yelp',
      author: 'Naxielly C.',
      rating: 5,
      text: 'So happy this local burger joint has gluten-free options — you can see how much care goes into the product.',
    },
    yelpUrl: 'https://www.yelp.com/biz/bay-burgers-redwood-city-3',
    googleUrl: 'https://www.google.com/maps?cid=5226846701195605449',
  },
  {
    type: 'discover',
    id: 'd-ariana-grande',
    addedAt: '2026-05-24T10:00:00Z',
    kind: 'event',
    badge: '🔥 本周热门活动',
    title: 'Ariana Grande · The Eternal Sunshine Tour',
    category: '演唱会 · Pop',
    emoji: '🎤',
    cover: 'linear-gradient(135deg,#ee9ca7,#ffdde1)',
    image:
      'https://s1.ticketm.net/dam/a/adb/fc874544-aef0-468d-8db5-0507863cbadb_RETINA_LANDSCAPE_16_9.jpg',
    neighborhood: 'Oakland Arena',
    distance: '35 mi',
    date: '2026-06-06',
    price: '门票',
    blurb: 'Ariana Grande 巡演来 Oakland Arena · 6/6 周六晚,大体量 Pop 演唱会。',
    intent: '订张 Ariana Grande 的票',
    tags: ['演唱会', '音乐', 'pop'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fariana-grande-the-eternal-sunshine-tour-oakland-california-06-06-2026%2Fevent%2F1C00631913D14AD8&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-damon-wayans',
    addedAt: '2026-05-24T10:00:00Z',
    kind: 'event',
    badge: '🔥 本周热门活动',
    title: 'Damon Wayans Jr. · 脱口秀专场',
    category: '脱口秀 · 喜剧',
    emoji: '🎙️',
    cover: 'linear-gradient(135deg,#232526,#414345)',
    image:
      'https://s1.ticketm.net/dam/a/629/d89d057d-3bbb-4539-be68-85d4c50e7629_137771_RETINA_LANDSCAPE_16_9.jpg',
    neighborhood: 'San Jose Improv',
    distance: '15 mi',
    date: '2026-06-05',
    price: '门票',
    blurb: 'Damon Wayans Jr. 在 SJ Improv 开脱口秀 · 6/5 周五晚,小剧场氛围。',
    intent: '约朋友去 SJ Improv 听一场脱口秀',
    tags: ['脱口秀', '喜剧', '演出'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketweb.com%2Fevent%2Fdamon-wayans-jr-san-jose-improv-tickets%2F13769404&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-tt-deli',
    addedAt: '2026-05-24T16:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'T-T Deli',
    category: '越南菜 · Banh Mi',
    emoji: '🥖',
    cover: 'linear-gradient(135deg,#f7971e,#ffd200)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/mwV1hojcetd23UOsZO1vpg/o.jpg',
    neighborhood: 'The Alameda, San Jose',
    distance: '14 mi',
    rating: 4.9,
    reviews: 134,
    blurb: '圣何塞 The Alameda 上的越南三明治据点 · 4.9 分 / 134 评,Banh Mi 现做。',
    intent: '中午绕去 T-T Deli 抓一个现做 Banh Mi',
    tags: ['越南菜', 'banh mi', '小众'],
    quote: {
      source: 'Yelp',
      author: 'Kent',
      rating: 5,
      text: 'The Banh Mi is one of the best I have ever had — made to order, carefully constructed, fresh ingredients.',
    },
    yelpUrl: 'https://www.yelp.com/biz/t-t-deli-san-jose',
    googleUrl: 'https://www.google.com/maps?cid=374857151370516450',
  },
  {
    type: 'discover',
    id: 'd-tea-rex',
    addedAt: '2026-05-25T10:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Tea Rex Cafe & Specialty Teas',
    category: '咖啡馆 · 特调茶',
    emoji: '🍵',
    cover: 'linear-gradient(135deg,#56ab2f,#a8e063)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/t9npWw7CAI8hUadwyA8UoQ/o.jpg',
    neighborhood: 'Mission, SF',
    distance: '30 mi',
    rating: 5.0,
    reviews: 44,
    blurb: 'Mission 一家新咖啡馆 · 特调茶 + 三明治 + 自制辣酱,店主很爱聊。',
    intent: '挑个下午去 Tea Rex 喝一杯特调茶',
    tags: ['咖啡馆', '茶饮', '新店', '小众'],
    quote: {
      source: 'Yelp',
      author: 'Dana M.',
      rating: 5,
      text: 'Daniel is so friendly, the food is amazing, drinks delicious — their homemade hot sauces are also great.',
    },
    yelpUrl: 'https://www.yelp.com/biz/tea-rex-cafe-and-specialty-teas-san-francisco',
    googleUrl: 'https://www.google.com/maps?cid=3424967789725366820',
  },
  {
    type: 'discover',
    id: 'd-cote-west',
    addedAt: '2026-05-25T10:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Côte West',
    category: '酒庄 · Wine Tasting Room',
    emoji: '🍷',
    cover: 'linear-gradient(135deg,#7b1f1f,#c54658)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/HAKJpjza6AqQUu7WzaOK0Q/o.jpg',
    neighborhood: 'Alameda · Oakland',
    distance: '36 mi',
    rating: 5.0,
    reviews: 32,
    blurb: 'Alameda 与 Oakland 交界的小酒庄 tasting room · 适合朋友小聚,也能办活动。',
    intent: '约两个朋友去 Côte West 品几杯',
    tags: ['葡萄酒', '酒吧', '小酌'],
    quote: {
      source: 'Yelp',
      author: 'Shayla B.',
      rating: 4,
      text: 'The cutest friggin tasting room with delicious wine — the perfect place to relax while sipping.',
    },
    yelpUrl: 'https://www.yelp.com/biz/c%C3%B4te-west-oakland',
    googleUrl: 'https://www.google.com/maps?cid=3131774905955608300',
  },
  {
    type: 'discover',
    id: 'd-ball-park',
    addedAt: '2026-05-25T10:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Ball Park',
    category: '运动酒吧 · 美式小馆',
    emoji: '🍻',
    cover: 'linear-gradient(135deg,#0a3d62,#3c6382)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/q5D7rdTghW9W6TmYdiwUSA/o.jpg',
    neighborhood: 'Park St, Alameda',
    distance: '36 mi',
    rating: 4.8,
    reviews: 25,
    blurb: 'Alameda Park St 新开的运动酒吧 · 三明治、披萨、汉堡 + 意式小馆 vibe。',
    intent: '约朋友去 Ball Park 边看球边吃喝',
    tags: ['运动酒吧', '美式', '新店'],
    quote: {
      source: 'Yelp',
      author: 'Andrea M.',
      rating: 5,
      text: 'Yay, a new local business up and running in the space Capullo used to occupy on Park St.',
    },
    yelpUrl: 'https://www.yelp.com/biz/ball-park-alameda',
    googleUrl: 'https://www.google.com/maps?cid=16059048400989538341',
  },
  {
    type: 'discover',
    id: 'd-pitbull',
    addedAt: '2026-05-25T10:00:00Z',
    kind: 'event',
    badge: '🔥 本周热门活动',
    title: 'Pitbull · I’m Back Tour(嘉宾 Lil Jon)',
    category: '演唱会 · 派对',
    emoji: '🎉',
    cover: 'linear-gradient(135deg,#ff512f,#dd2476)',
    image:
      'https://s1.ticketm.net/dam/a/918/bd324c03-b456-4cb9-87b2-fe8664cb1918_TABLET_LANDSCAPE_LARGE_16_9.jpg',
    neighborhood: 'Shoreline Amphitheatre',
    distance: '2 mi',
    date: '2026-06-07',
    price: '门票',
    blurb: 'Pitbull 带 Lil Jon 来 Shoreline 露天剧场 · 6/7 周日晚,就在山景城。',
    intent: '订张 Pitbull 的票去 Shoreline 跳一晚',
    tags: ['演唱会', '音乐', '派对'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fpitbull-im-back-with-special-guest-mountain-view-california-06-07-2026%2Fevent%2F1C006391FDCDE716&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-tilden-botanic',
    addedAt: '2026-05-25T16:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Regional Parks Botanic Garden at Tilden',
    category: '植物园 · 加州原生',
    emoji: '🌿',
    cover: 'linear-gradient(135deg,#56ab2f,#a8e063)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/DHCZs7IwfRP0LpRuXcV93w/o.jpg',
    neighborhood: 'Tilden Park, Berkeley',
    distance: '40 mi',
    rating: 4.6,
    reviews: 68,
    blurb: 'Tilden 公园里的加州原生植物园 · 10 英亩免费开放,按生态区分隔,可野餐。',
    intent: '挑个周末去 Tilden 植物园走走、野餐',
    tags: ['植物园', '户外', '亲子'],
    quote: {
      source: 'Yelp',
      author: 'Jessica H.',
      rating: 4,
      text: 'I love that this garden is FREE — 10 acres of plants, flowers, and habitats, plus a nice grass area to lay around.',
    },
    yelpUrl: 'https://www.yelp.com/biz/regional-parks-botanic-garden-at-tilden-berkeley',
    googleUrl: 'https://www.google.com/maps?cid=18226702594634798684',
  },
  {
    type: 'discover',
    id: 'd-berkeley-rose',
    addedAt: '2026-05-25T16:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'The Berkeley Rose Garden',
    category: '玫瑰园 · 公共绿地',
    emoji: '🌹',
    cover: 'linear-gradient(135deg,#ff5e62,#ff9966)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/Io3rAo4FHc4_lD87EiquJA/o.jpg',
    neighborhood: 'Berkeley',
    distance: '37 mi',
    rating: 4.5,
    reviews: 270,
    blurb: '伯克利山坡上的免费玫瑰园 · 270 条评价、绝佳视野,适合晨跑或傍晚散步。',
    intent: '傍晚去 Berkeley 玫瑰园散步看夕阳',
    tags: ['花园', '户外', '景观'],
    quote: {
      source: 'Yelp',
      author: 'Wendy D.',
      rating: 5,
      text: 'Such a beautiful place — great views, tennis courts, and a gorgeous rose garden.',
    },
    yelpUrl: 'https://www.yelp.com/biz/the-berkeley-rose-garden-berkeley',
    googleUrl: 'https://www.google.com/maps?cid=3087902254744647035',
  },
  {
    type: 'discover',
    id: 'd-rouge-lounge',
    addedAt: '2026-05-27T22:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Rouge Lounge',
    category: 'Wine Bar · Tapas',
    emoji: '🍷',
    cover: 'linear-gradient(135deg,#7b1f1f,#c54658)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/sva8OghU9DtNKPoOqKdm8Q/o.jpg',
    neighborhood: 'San Carlos',
    distance: '6 mi',
    rating: 5.0,
    reviews: 64,
    blurb: 'San Carlos 半岛上一家「神隐」红酒小馆 · 25 美元一份品酒 flight,配 tapas。',
    intent: '挑个夜晚去 Rouge Lounge 品一份红酒 flight',
    tags: ['葡萄酒', '酒吧', '小酌'],
    quote: {
      source: 'Yelp',
      author: 'May L.',
      rating: 5,
      text: 'I absolutely love this wine lounge — a true gem on the Peninsula.',
    },
    yelpUrl: 'https://www.yelp.com/biz/rouge-lounge-san-carlos',
    googleUrl: 'https://www.google.com/maps?cid=131926947225318879',
  },
  {
    type: 'discover',
    id: 'd-gate-6-garden',
    addedAt: '2026-05-27T22:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Gate 6 Garden',
    category: '咖啡馆 · 菲律宾甜品',
    emoji: '☕',
    cover: 'linear-gradient(135deg,#f7971e,#ffd200)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/qXDav5s5bQJ8QkHhZqr4Yw/o.jpg',
    neighborhood: 'Webster St, Alameda',
    distance: '36 mi',
    rating: 4.9,
    reviews: 26,
    price: '$',
    blurb: 'Alameda 一家融合菲律宾甜品的咖啡馆 · 营业到晚,适合自习或慢聊。',
    intent: '挑个下午去 Gate 6 Garden 喝杯咖啡配菲律宾甜点',
    tags: ['咖啡馆', '咖啡', '甜', '新店'],
    quote: {
      source: 'Yelp',
      author: 'Cyn K.',
      rating: 5,
      text: 'Unique and yummy flavors, quick and friendly service, good place to chill or study — open later than other cafés.',
    },
    yelpUrl: 'https://www.yelp.com/biz/gate-6-garden-alameda',
    googleUrl: 'https://www.google.com/maps?cid=10649138907372239800',
  },
  {
    type: 'discover',
    id: 'd-el-tiny-cafe',
    addedAt: '2026-05-27T22:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'El Tiny Cafe',
    category: '咖啡馆 · 街角小店',
    emoji: '☕',
    cover: 'linear-gradient(135deg,#d38312,#a83279)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/4GBsCM3ueaH6CXN-XStV0Q/o.jpg',
    neighborhood: 'Adeline St, Berkeley',
    distance: '37 mi',
    rating: 4.8,
    reviews: 86,
    blurb: '伯克利 Adeline 街角的小咖啡馆 · 三明治分量足,半 decaf 卡布奇诺也只要 $4.25。',
    intent: '逛 Adeline 时拐进 El Tiny 喝杯咖啡吃三明治',
    tags: ['咖啡馆', '咖啡', '小众'],
    quote: {
      source: 'Yelp',
      author: 'Barbara S.',
      rating: 5,
      text: 'One of my favorite neighborhood places — sandwiches are delicious and cups of coffee are generous and good.',
    },
    yelpUrl: 'https://www.yelp.com/biz/el-tiny-cafe-berkeley',
    googleUrl: 'https://www.google.com/maps?cid=1281775683670743009',
  },
  {
    type: 'discover',
    id: 'd-sweet-bites',
    addedAt: '2026-05-27T23:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Sweet Bites Bakery & Brunch',
    category: '烘焙 · 早午餐',
    emoji: '🍰',
    cover: 'linear-gradient(135deg,#ff6b9d,#f7971e)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/nwmc6Hk-zYvQM8ardpsavg/o.jpg',
    neighborhood: 'San Pablo Ave, Berkeley',
    distance: '38 mi',
    rating: 4.9,
    reviews: 112,
    blurb: '伯克利 San Pablo 街角的烘焙+早午餐小店 · 开了一年,还能定 tres leches 生日蛋糕。',
    intent: '挑个早上去 Sweet Bites 吃顿早午餐 + 顺手抓个蛋糕',
    tags: ['烘焙', '早午餐', '咖啡', '甜', '新店'],
    quote: {
      source: 'Yelp',
      author: 'May Z.',
      rating: 5,
      text: 'Hella cute! Popped my head in for a treat and was enticed by all their beautiful offerings.',
    },
    yelpUrl: 'https://www.yelp.com/biz/sweet-bites-bakery-and-brunch-berkeley',
    googleUrl: 'https://www.google.com/maps?cid=13002131641531434937',
  },
  {
    type: 'discover',
    id: 'd-samuthr-thai',
    addedAt: '2026-05-27T23:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Samuthr Thai Restaurant',
    category: '泰餐 · 家族经营',
    emoji: '🍛',
    cover: 'linear-gradient(135deg,#c0392b,#f39c12)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/tLItYWf_DsRfWg6WNn2ZrA/o.jpg',
    neighborhood: 'Downtown San Jose',
    distance: '14 mi',
    rating: 4.9,
    reviews: 29,
    blurb: 'SJSU 附近新开的家族经营泰餐 · 有人为它愿意从圣地亚哥开 8 小时车再来。',
    intent: '去 Samuthr Thai 试一桌新派泰餐',
    tags: ['泰餐', '小众', '新店'],
    quote: {
      source: 'Yelp',
      author: 'Franon L.',
      rating: 5,
      text: "Best meal I've ever had hands down — willing to drive 6–8 hours from San Diego just to eat here again.",
    },
    yelpUrl: 'https://www.yelp.com/biz/samuthr-thai-restaurant-san-jose',
    googleUrl: 'https://www.google.com/maps?cid=5714714615651164444',
  },
  {
    type: 'discover',
    id: 'd-frenchie-wine',
    addedAt: '2026-05-28T10:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Frenchie Wine Bar',
    category: 'Wine Bar · Tapas',
    emoji: '🍷',
    cover: 'linear-gradient(135deg,#7b1f1f,#c54658)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/pbBnlfFSpGwQO4jaKvfMxw/o.jpg',
    neighborhood: 'Guerrero St, Mission, SF',
    distance: '30 mi',
    rating: 4.9,
    reviews: 49,
    blurb: 'Mission Guerrero 街角的法式 wine bar · 装修美、tapas 小食配酒,氛围松弛。',
    intent: '约会前去 Frenchie 喝一杯配 tapas',
    tags: ['葡萄酒', '酒吧', '小酌'],
    quote: {
      source: 'Yelp',
      author: 'Misael S.',
      rating: 5,
      text: 'Popped in before dinner in the Mission — the vibe was so relaxed and the decor was gorgeous.',
    },
    yelpUrl: 'https://www.yelp.com/biz/frenchie-wine-bar-san-francisco',
    googleUrl: 'https://www.google.com/maps?cid=12990778813477514793',
  },
  {
    type: 'discover',
    id: 'd-churros-guerrero',
    addedAt: '2026-05-28T10:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Churros Guerrero Cart',
    category: '墨西哥甜点 · 街角现做',
    emoji: '🥯',
    cover: 'linear-gradient(135deg,#f7971e,#a55e2b)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/pvbF1azFBxS9weMappcVBQ/o.jpg',
    neighborhood: 'Cardenas Market corner, Oakland',
    distance: '36 mi',
    rating: 4.9,
    reviews: 108,
    price: '$',
    blurb: 'Oakland Cardenas 超市角落的现做 churros 摊 · 4.9 分 / 108 评,粉丝称「全世界最爱」。',
    intent: '逛 Cardenas 买完菜顺手抓一根 churros',
    tags: ['甜', '墨西哥菜', '小众'],
    quote: {
      source: 'Yelp',
      author: 'Angela P.',
      rating: 5,
      text: 'My favorite churros IN THE ENTIRE WORLD — fast and friendly service, affordable.',
    },
    yelpUrl: 'https://www.yelp.com/biz/churros-guerrero-cart-oakland',
    googleUrl: 'https://www.google.com/maps?cid=1879328382895695423',
  },
  {
    type: 'discover',
    id: 'd-bollywood-pizza',
    addedAt: '2026-05-28T22:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Bollywood Pizza',
    category: '披萨 · 印度融合',
    emoji: '🍕',
    cover: 'linear-gradient(135deg,#c23616,#e1b12c)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/J29kFc4QHQE-7HX1tafRsg/o.jpg',
    neighborhood: 'SoMa, SF',
    distance: '33 mi',
    rating: 4.9,
    reviews: 22,
    blurb: 'SoMa 一家印度风披萨小店 · 招牌牛油鸡披萨配芒果 lassi,开到深夜。',
    intent: '夜里饿了去 Bollywood Pizza 来一片黄油鸡披萨',
    tags: ['披萨', '印度菜', '小众'],
    quote: {
      source: 'Yelp',
      author: 'Jennifer C.',
      rating: 5,
      text: 'Good food, great choices of pizza — the butter chicken pizza is amazing. Mango lassi is also so good.',
    },
    yelpUrl: 'https://www.yelp.com/biz/bollywood-pizza-san-francisco-2',
  },
  {
    type: 'discover',
    id: 'd-kusan-bazaar',
    addedAt: '2026-05-29T10:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Kusan Bazaar',
    category: '维吾尔菜 · 清真',
    emoji: '🥘',
    cover: 'linear-gradient(135deg,#cb2d3e,#ef473a)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/9F8XHIZsxnUIu6KCpD2gFA/o.jpg',
    neighborhood: 'San Mateo',
    distance: '6 mi',
    rating: 4.9,
    reviews: 28,
    blurb: 'El Camino 上一家维吾尔菜小店 · 嫩烤羊腿 + 葡萄干手抓饭,店面不大常排队。',
    intent: '去 Kusan Bazaar 吃顿正宗维吾尔晚餐',
    tags: ['维吾尔菜', '清真', '亚洲菜', '小众'],
    quote: {
      source: 'Yelp',
      author: 'David Z.',
      rating: 5,
      text: 'Excellent Uyghur spot! Lamb soup has perfect flavor and the lamb kebabs are incredibly flavorful.',
    },
    yelpUrl: 'https://www.yelp.com/biz/kusan-bazaar-san-mateo',
    googleUrl: 'https://www.google.com/maps?cid=13840017075972659350',
  },
  {
    type: 'discover',
    id: 'd-sushi-ai',
    addedAt: '2026-05-29T10:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Sushi Ai',
    category: 'Omakase · 日料',
    emoji: '🍣',
    cover: 'linear-gradient(135deg,#2c3e50,#bdc3c7)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/I40RILUuU22hxgWQEXfphw/o.jpg',
    neighborhood: 'Broadway, Redwood City',
    distance: '6 mi',
    rating: 4.9,
    reviews: 43,
    blurb: 'Redwood City 一家藏起来的 omakase · 干式熟成寿司,主厨 Nick 会一道道讲。',
    intent: '约个特别的日子订 Sushi Ai 的 omakase',
    tags: ['寿司', 'omakase', '日料'],
    quote: {
      source: 'Yelp',
      author: 'Valerie S.',
      rating: 5,
      text: 'A hidden gem in Redwood City — gorgeous design, ambiance, plating and absolutely delicious food.',
    },
    yelpUrl: 'https://www.yelp.com/biz/sushi-ai-redwood-city',
    googleUrl: 'https://www.google.com/maps?cid=3515348370804209146',
  },
  {
    type: 'discover',
    id: 'd-nunus-cafe',
    addedAt: '2026-05-29T10:00:00Z',
    kind: 'find',
    badge: '🔍 本地小众新发现',
    title: 'Nunu’s Cafe',
    category: '咖啡馆 · 早餐三明治',
    emoji: '☕',
    cover: 'linear-gradient(135deg,#d38312,#a83279)',
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/H6f-9eHt3FpOM_Si9PtgZQ/o.jpg',
    neighborhood: 'Mandela Pkwy, West Oakland',
    distance: '35 mi',
    rating: 4.8,
    reviews: 56,
    blurb: '西奥克兰 Mandela 上的小咖啡馆 · 早餐三明治和 bagels 评价高得离谱。',
    intent: '挑个早上去 Nunu’s 吃一份火鸡香肠早餐三明治',
    tags: ['咖啡馆', '咖啡', '早午餐'],
    quote: {
      source: 'Yelp',
      author: 'Jessica P.',
      rating: 5,
      text: 'Ordered a turkey sausage breakfast sandwich and a bacon one — loved both. Bread was amazing.',
    },
    yelpUrl: 'https://www.yelp.com/biz/nunu-s-cafe-oakland',
    googleUrl: 'https://www.google.com/maps?cid=3407478867620205999',
  },
  {
    type: 'discover',
    id: 'd-ringo-starr',
    addedAt: '2026-05-29T10:00:00Z',
    kind: 'event',
    badge: '🔥 本周热门活动',
    title: 'Ringo Starr & His All Starr Band',
    category: '演唱会 · 摇滚传奇',
    emoji: '🥁',
    cover: 'linear-gradient(135deg,#373b44,#4286f4)',
    image:
      'https://s1.ticketm.net/dam/a/01b/d1e948ca-28a5-4b93-97a6-5861cd4f701b_RETINA_LANDSCAPE_16_9.jpg',
    neighborhood: 'San Jose Civic',
    distance: '14 mi',
    date: '2026-06-11',
    price: '门票',
    blurb: 'Beatles 鼓手 Ringo Starr 带 All Starr 乐队 · 6/11 周四晚在 San Jose Civic。',
    intent: '订张票去 SJ Civic 听一晚 Ringo Starr',
    tags: ['演唱会', '音乐', '摇滚'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fringo-starr-and-his-all-starr-san-jose-california-06-11-2026%2Fevent%2F1C006367F78B9B5C&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-pussycat-dolls',
    addedAt: '2026-05-29T22:00:00Z',
    kind: 'event',
    badge: '🔥 本周热门活动',
    title: 'The Pussycat Dolls · PCD Forever Tour',
    category: '演唱会 · 流行',
    emoji: '🎤',
    cover: 'linear-gradient(135deg,#ee0979,#ff6a00)',
    image:
      'https://s1.ticketm.net/dam/a/77e/f7658e89-d70c-4260-b800-95ca6aaa877e_TABLET_LANDSCAPE_LARGE_16_9.jpg',
    neighborhood: 'Shoreline Amphitheatre',
    distance: '2 mi',
    date: '2026-06-12',
    price: '门票',
    blurb: 'Pussycat Dolls 重组巡演 · 6/12 就在山景城 Shoreline 露天剧场,几乎家门口。',
    intent: '订张票去 Shoreline 看 Pussycat Dolls',
    tags: ['演唱会', '音乐', '流行'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fthe-pussycat-dolls-pcd-forever-tour-mountain-view-california-06-12-2026%2Fevent%2F1C0064699A5EA2A3&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-jake-shimabukuro',
    addedAt: '2026-05-30T08:00:00Z',
    kind: 'event',
    badge: '🎫 本周末就有',
    title: 'Jake Shimabukuro',
    category: '现场演出 · 尤克里里',
    emoji: '🪕',
    cover: 'linear-gradient(135deg,#11998e,#38ef7d)',
    image:
      'https://s1.ticketm.net/dam/a/796/66db7215-d93a-445f-a780-c3ec70626796_1546151_RETINA_LANDSCAPE_16_9.jpg',
    neighborhood: 'The Guild Theatre, Menlo Park',
    distance: '3 mi',
    date: '2026-06-12',
    price: '门票',
    blurb: '夏威夷尤克里里大师 · 6/12 就在 Menlo Park Guild,几乎家门口。',
    intent: '订张票去 Menlo Park Guild 听 Jake Shimabukuro',
    tags: ['现场演出', '音乐', '演出'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fevent%2FZ7r9jZ1A7xo79&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-brit-floyd',
    addedAt: '2026-05-30T08:00:00Z',
    kind: 'event',
    badge: '🎫 本周末就有',
    title: 'Brit Floyd',
    category: '演唱会 · 摇滚',
    emoji: '🎸',
    cover: 'linear-gradient(135deg,#0f2027,#2c5364)',
    image:
      'https://s1.ticketm.net/dam/a/a5b/d64a6ad6-ab25-4204-978f-7a6a1352fa5b_SOURCE',
    neighborhood: 'Mountain Winery, Saratoga',
    distance: '20 mi',
    date: '2026-06-12',
    price: '门票',
    blurb: '全球最强 Pink Floyd 致敬秀 · 6/12 萨拉托加山顶酒庄露天舞台。',
    intent: '订张票去 Mountain Winery 看 Brit Floyd',
    tags: ['演唱会', '音乐', '摇滚'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fevent%2FZ7r9jZ1A7OSkA&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-worldcup-qat-sui',
    addedAt: '2026-05-30T14:00:00Z',
    kind: 'event',
    badge: '⚽ 世界杯就在家门口',
    title: '世界杯 B 组:卡塔尔 vs 瑞士',
    category: '体育 · 足球',
    emoji: '⚽',
    cover: 'linear-gradient(135deg,#1e3c72,#2a5298)',
    image:
      'https://s1.ticketm.net/dam/a/9d4/101abbaa-1635-4f78-a6a7-ef820ced19d4_SOURCE',
    neighborhood: "Levi's Stadium, Santa Clara",
    distance: '15 mi',
    date: '2026-06-13',
    price: '门票',
    blurb: '2026 世界杯就踢在 Levi\'s · 6/13 中午,半岛家门口看世界杯。',
    intent: "订张票去 Levi's Stadium 看一场世界杯",
    tags: ['体育', '演出', '活动'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fevent%2FZ7r9jZ1A7433K&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-jim-gaffigan',
    addedAt: '2026-05-30T20:00:00Z',
    kind: 'event',
    badge: '🎤 本周末就有',
    title: 'Jim Gaffigan: Everything is Wonderful!',
    category: '脱口秀 · 喜剧',
    emoji: '🎤',
    cover: 'linear-gradient(135deg,#f7971e,#ffd200)',
    image:
      'https://s1.ticketm.net/dam/a/838/aabe1f75-fe3d-4040-b17b-7f53ded6d838_TABLET_LANDSCAPE_16_9.jpg',
    neighborhood: 'The Masonic, SF',
    distance: '33 mi',
    date: '2026-06-13',
    price: '门票',
    blurb: '美式干脆吐槽天王 · 6/13 傍晚在 SF Masonic,笑到岔气。',
    intent: '订张票去 SF Masonic 看 Jim Gaffigan 脱口秀',
    tags: ['现场演出', '演出', '喜剧'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fjim-gaffigan-everything-is-wonderful-san-francisco-california-06-13-2026%2Fevent%2F1C00635CDBC3AC08&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-natalia-lafourcade',
    addedAt: '2026-05-31T08:00:00Z',
    kind: 'event',
    badge: '🎫 本周末就有',
    title: 'Natalia Lafourcade · Cancionera Tour',
    category: '演唱会 · 拉丁',
    emoji: '🎙️',
    cover: 'linear-gradient(135deg,#c94b4b,#4b134f)',
    image:
      'https://s1.ticketm.net/dam/a/5d4/21700809-2211-46d5-a314-4d29a6a3e5d4_SOURCE',
    neighborhood: 'San Jose Civic',
    distance: '14 mi',
    date: '2026-06-13',
    price: '门票',
    blurb: '拉丁格莱美天后 · 6/13 在 SJ Civic,一把吉他唱遍墨西哥。',
    intent: '订张票去 SJ Civic 看 Natalia Lafourcade',
    tags: ['演唱会', '音乐', '拉丁'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fnatalia-lafourcade-cancionera-tour-san-jose-california-06-13-2026%2Fevent%2F1C00623E8CF429CE&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-coyote-chuy',
    addedAt: '2026-05-31T08:00:00Z',
    kind: 'event',
    badge: '🎫 本周末就有',
    title: 'Coyote y Chuy Lizárraga · Capibaras Tour',
    category: '演唱会 · 班达',
    emoji: '🎺',
    cover: 'linear-gradient(135deg,#f12711,#f5af19)',
    image:
      'https://s1.ticketm.net/dam/e/5f2/8e35d14c-9d48-4a54-b3b0-4abbb641a5f2_SOURCE',
    neighborhood: 'SAP Center, San Jose',
    distance: '17 mi',
    date: '2026-06-13',
    price: '门票',
    blurb: '墨西哥班达全场蹦迪 · 6/13 SAP Center 万人合唱。',
    intent: '订张票去 SAP Center 看 Coyote y Chuy 班达',
    tags: ['演唱会', '音乐', '拉丁'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fcoyote-y-chuy-lizarraga-capibaras-tour-san-jose-california-06-13-2026%2Fevent%2F1C006475BFAAC930&utm_medium=affiliate',
  },
  {
    type: 'discover',
    id: 'd-rocky-horror',
    addedAt: '2026-06-01T08:00:00Z',
    kind: 'event',
    badge: '🎭 周末就有',
    title: 'The Rocky Horror Picture Show',
    category: '现场演出 · 邪典经典',
    emoji: '🎭',
    cover: 'linear-gradient(135deg,#7b0a2a,#1a0033)',
    image:
      'https://s1.ticketm.net/dam/a/879/eb0656ac-c826-4a4a-944e-7ba18cf9f879_816351_TABLET_LANDSCAPE_16_9.jpg',
    neighborhood: 'The Guild Theatre, Menlo Park',
    distance: '3 mi',
    date: '2026-06-14',
    price: '门票',
    blurb: '邪典经典互动放映 · 6/14 在 Menlo Park Guild,带道具一起喊。',
    intent: '订张票去 Menlo Park Guild 看 Rocky Horror',
    tags: ['现场演出', '演出', '话剧'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fevent%2FZ7r9jZ1A70eG-&utm_medium=affiliate',
  },
]

export function getDiscover(id: string): DiscoverCard | undefined {
  return DISCOVER.find((d) => d.id === id) ?? getAssistantPick(id)
}

/** Type guard: distinguishes a discover card from an article. */
export function isDiscover(entry: FeedEntry): entry is DiscoverCard {
  return (entry as DiscoverCard).type === 'discover'
}

// ---- Local Life Assistant ---------------------------------------------------
// The assistant's anchor picks are pre-fetched by scripts/build-assistant.mjs
// from Yelp Fusion + Ticketmaster, shaped as DiscoverCard so they re-use the
// existing CommitSheet flow ("加入计划") without any new plumbing.

export type AssistantWindow = 'couple_dinner' | 'family_outing' | 'weekend_events'

export interface AssistantData {
  generatedAt: string
  anchor: { city: string; latlng: string }
  windows: Record<AssistantWindow, DiscoverCard[]>
}

export const ASSISTANT: AssistantData = assistantPicksRaw as AssistantData

/** Flat list of every assistant pick, across all windows. */
const ASSISTANT_PICKS: DiscoverCard[] = Object.values(ASSISTANT.windows).flat()

/** Lookup including assistant picks — so OPEN_PLANNING(target.id) works. */
export function getAssistantPick(id: string): DiscoverCard | undefined {
  return ASSISTANT_PICKS.find((p) => p.id === id)
}

// Cold-start "safe anchors": hand-picked PA-area cards already in DISCOVER.
// When the live API picks for a window are thin or far, we backfill from
// these known-good, nearby spots — a Palo Alto user would actually go.
const ASSISTANT_FALLBACK: Record<AssistantWindow, string[]> = {
  couple_dinner: ['d-sushi-adachi', 'd-hibari', 'd-rouge-lounge', 'd-redwood'],
  family_outing: [
    'd-juniormuseum',
    'd-magicalbridge',
    'd-arizonagarden',
    'd-curiodyssey',
    'd-cdm',
  ],
  weekend_events: ['d-paul-simon', 'd-rwc-summer', 'd-fanime', 'd-mv-obon'],
}

const distNum = (c: DiscoverCard): number => {
  const m = c.distance?.match(/([\d.]+)/)
  return m ? parseFloat(m[1]) : 999
}

const hasTag = (c: DiscoverCard, ...needles: string[]) =>
  c.tags?.some((t) => needles.some((n) => t.includes(n))) ?? false

/**
 * Cold-start ordering = 最新 + 最热 + 最近. With no behaviour to personalise on,
 * lead with what's universally compelling: popular (rating × review volume),
 * newly opened, and time-sensitive (closing soon / happening this week).
 * Proximity is a gentle nudge, not the lead.
 */
export function coldStartScore(c: DiscoverCard): number {
  let s = 0
  if (c.rating) s += c.rating * Math.log10((c.reviews ?? 0) + 10) // 最热 (~4–18)
  if (hasTag(c, '新店')) s += 4 // 最新
  if (c.addedAt) s += 2
  if (hasTag(c, '即将结业')) s += 6 // 最近 · 紧迫
  if (c.date) s += 3 // 最近 · 即将上演
  s += Math.max(0, 4 - distNum(c) / 5) // 近一点小加分
  return s
}

/** User-supplied refinements ("改一改") that override the cold-start guesses. */
export interface AssistantOverrides {
  maxMiles?: number
  budget?: 'cheap' | 'mid' | 'fancy'
  text?: string
}

const priceTier = (c: DiscoverCard): number | null =>
  c.price && /^\$+$/.test(c.price) ? c.price.length : null

function budgetMatch(c: DiscoverCard, budget: NonNullable<AssistantOverrides['budget']>) {
  const t = priceTier(c)
  if (t == null) return true // unknown price (e.g. 门票) — don't filter out
  if (budget === 'cheap') return t <= 2
  if (budget === 'mid') return t === 2 || t === 3
  return t >= 3 // fancy
}

function textMatch(c: DiscoverCard, text: string) {
  const q = text.trim().toLowerCase()
  if (!q) return true
  const hay = [c.title, c.category, c.blurb, ...(c.tags ?? [])]
    .join(' ')
    .toLowerCase()
  return q.split(/\s+/).some((tok) => tok && hay.includes(tok))
}

/** Heuristic: free text → structured overrides, no LLM. */
export function parseRefine(text: string): AssistantOverrides {
  const q = text.toLowerCase()
  const o: AssistantOverrides = { text }
  if (/(便宜|实惠|平价|cheap|budget)/.test(q)) o.budget = 'cheap'
  if (/(高级|精致|特别|高端|fancy|nice|fine)/.test(q)) o.budget = 'fancy'
  if (/(就近|附近|近一点|近点|走路|walk|nearby)/.test(q)) o.maxMiles = 5
  return o
}

/**
 * Final picks for an assistant window: live API picks + curated nearby
 * DISCOVER fallbacks, deduped, ordered by cold-start score (最新/最热/最近).
 * `overrides` from the 改一改 sheet narrow the pool (距离 / 预算 / 关键词).
 */
export function assistantPicks(
  window: AssistantWindow,
  overrides: AssistantOverrides = {},
): DiscoverCard[] {
  const api = ASSISTANT.windows[window] ?? []
  const fallback = ASSISTANT_FALLBACK[window]
    .map((id) => DISCOVER.find((d) => d.id === id))
    .filter((d): d is DiscoverCard => !!d)
  const seen = new Set<string>()
  let pool: DiscoverCard[] = []
  for (const c of [...api, ...fallback]) {
    if (seen.has(c.id)) continue
    seen.add(c.id)
    pool.push(c)
  }
  if (overrides.maxMiles != null)
    pool = pool.filter((c) => distNum(c) <= overrides.maxMiles!)
  if (overrides.budget)
    pool = pool.filter((c) => budgetMatch(c, overrides.budget!))
  if (overrides.text) pool = pool.filter((c) => textMatch(c, overrides.text!))
  pool.sort((a, b) => coldStartScore(b) - coldStartScore(a))
  return pool.slice(0, 4)
}

// ---- Geography of relevance --------------------------------------------------
// A Palo Alto user's willingness to travel changes per category. Coffee tops
// out around 5 mi; a destination event is OK at 35+. The pipeline doesn't
// tag this explicitly — we derive it from tags. The user picks one of three
// RadiusStyle archetypes on the Me page; the feed filters by it.

const DEST_NEEDLES = [
  '博物馆', '美术馆', '展览',
  '演唱会', '音乐剧', '现场演出', '演出', '体育', '话剧',
  '动漫', '二次元',
  '即将结业',
  '日式庭园', '茶道', '夏日祭', '采摘', '自采农场',
]

/**
 * Derive the willingness-to-travel class from tags. Closing and event content
 * is destination-class even if the place itself is a casual venue. Coffee is
 * daily unless it explicitly co-tags as brunch (a planned outing).
 */
export function categoryClass(entry: FeedEntry): CategoryClass {
  const tags = entry.tags
  if (tags.some((t) => DEST_NEEDLES.some((n) => t.includes(n)))) return 'destination'
  const hasCoffee = tags.some((t) => t.includes('咖啡'))
  const hasBrunch = tags.some((t) => t.includes('早午餐'))
  if (hasCoffee && !hasBrunch) return 'daily'
  return 'weekend'
}

/** Per-category max miles from the user's anchor (Palo Alto) for each style. */
export const RADIUS_FOR: Record<RadiusStyle, Record<CategoryClass, number>> = {
  walk:      { daily: 4,  weekend: 12, destination: 25 },
  peninsula: { daily: 8,  weekend: 20, destination: 40 },
  bay:       { daily: 15, weekend: 35, destination: 70 },
}

export const RADIUS_LABELS: Record<RadiusStyle, string> = {
  walk: '走路就好',
  peninsula: '南湾半岛(默认)',
  bay: '跨湾也行',
}

/** Parse the leading number from a distance string like "33 mi" or "5.5 mi". */
export function distanceOf(entry: FeedEntry): number | null {
  const s = isDiscover(entry) ? entry.distance : entry.pois[0]?.distance
  if (!s) return null
  const m = s.match(/([\d.]+)/)
  return m ? parseFloat(m[1]) : null
}

/** Should this entry be shown given the user's radius style? */
export function withinRadius(entry: FeedEntry, style: RadiusStyle): boolean {
  const d = distanceOf(entry)
  if (d == null) return true // unknown distance — don't filter
  return d <= RADIUS_FOR[style][categoryClass(entry)]
}

/**
 * The user's local-life preference profile — aggregated from the tags of the
 * articles they have read and the discover cards they have engaged with.
 */
/** Tags representing an article, a discover card, or a POI — by its id. */
function tagsForRef(id: string): string[] {
  const a = getArticle(id)
  if (a) return a.tags
  const d = getDiscover(id)
  if (d) return d.tags
  return ARTICLES.find((x) => x.pois.some((p) => p.id === id))?.tags ?? []
}

/**
 * The user's local-life preference profile, scored by INTERACTION RATE.
 *   denominator = times a card was dwelled / dismissed (the user "checked" it)
 *   numerator   = weighted interactions, positive AND negative —
 *                 opened (+1), saved a place (+2), committed a plan (+3),
 *                 marked "not interested" (−4)
 *   preference  = numerator / denominator  → can be negative
 * A topic the user reliably acts on ranks high; one they keep dismissing
 * ranks negative (a real disinterest signal, not just a low score).
 */
export function getPreferences(s: {
  read: string[]
  seen: string[]
  opened: string[]
  saved: string[]
  plans: Plan[]
  dismissed: string[]
}): { tag: string; rate: number; num: number; denom: number }[] {
  const denom = new Map<string, number>()
  const num = new Map<string, number>()
  // Denominator: every distinct card the user dwelled on or dismissed.
  ;[...new Set([...s.read, ...s.seen, ...s.dismissed])].forEach((id) =>
    tagsForRef(id).forEach((t) => denom.set(t, (denom.get(t) ?? 0) + 1)),
  )
  // Numerator: weighted interactions — positive and negative.
  const addNum = (id: string, w: number) =>
    tagsForRef(id).forEach((t) => num.set(t, (num.get(t) ?? 0) + w))
  s.opened.forEach((id) => addNum(id, 1))
  s.saved.forEach((id) => addNum(id, 2))
  s.plans.forEach((p) => addNum(p.basedOnId, 3))
  s.dismissed.forEach((id) => addNum(id, -4))
  return [...new Set([...denom.keys(), ...num.keys()])]
    .map((tag) => {
      const n = num.get(tag) ?? 0
      const d = denom.get(tag) ?? 0
      return { tag, num: n, denom: d, rate: n / Math.max(d, 1) }
    })
    .filter((p) => p.num !== 0)
    .sort((a, b) => b.rate - a.rate || b.num - a.num)
}

// ---- User persona ----------------------------------------------------------
// Alongside WHAT the user likes (getPreferences), infer WHO they are — life
// stage / household — from real interactions. The strongest signal is the
// "和谁一起" choice made when committing a plan; content topics are softer
// supporting evidence. No survey; the persona emerges from behaviour.

interface PersonaDef {
  key: string
  label: string
  emoji: string
  hint: string
  /** Content tags that softly point to this trait. */
  tags: string[]
  /** The "和谁一起" choice that strongly points to it. */
  whom: string
}

const PERSONA: PersonaDef[] = [
  {
    key: 'family',
    label: '带娃家庭',
    emoji: '🧸',
    hint: '常看亲子内容、和家人一起出行',
    tags: ['亲子', '遛娃', '科普', '动物', '游乐场'],
    whom: '带家人',
  },
  {
    key: 'couple',
    label: '约会 / 情侣',
    emoji: '💑',
    hint: '常规划约会、关注适合两人的去处',
    tags: ['约会'],
    whom: '约会',
  },
  {
    key: 'social',
    label: '社交活跃',
    emoji: '🎉',
    hint: '常和朋友组局、看演出活动',
    tags: ['演出', '音乐', '脱口秀', '话剧', '喜剧', '棒球', '体育', '音乐剧', 'Live', '现场演出', '文化'],
    whom: '和朋友',
  },
  {
    key: 'solo',
    label: '单身 / 独自生活',
    emoji: '🧍',
    hint: '常独自探索本地',
    tags: [],
    whom: '自己一个人',
  },
]

/**
 * Infers the user's persona — life stage / household — from interactions.
 * Committing a plan with a given "和谁一起" is the strong signal (+3);
 * opening (+1) / saving (+1.5) topically-matching content is supporting.
 */
export function getPersona(s: {
  opened: string[]
  saved: string[]
  plans: Plan[]
}): {
  label: string
  emoji: string
  hint: string
  score: number
  level: 'low' | 'mid' | 'high'
}[] {
  const score = new Map<string, number>()
  const bump = (key: string, w: number) => score.set(key, (score.get(key) ?? 0) + w)
  s.plans.forEach((p) => {
    const d = PERSONA.find((x) => x.whom === p.withWhom)
    if (d) bump(d.key, 3)
  })
  const fromTags = (id: string, w: number) => {
    const tags = tagsForRef(id)
    PERSONA.forEach((d) => {
      if (d.tags.some((t) => tags.includes(t))) bump(d.key, w)
    })
  }
  s.opened.forEach((id) => fromTags(id, 1))
  s.saved.forEach((id) => fromTags(id, 1.5))
  return PERSONA.map((d) => {
    const n = score.get(d.key) ?? 0
    const level: 'low' | 'mid' | 'high' = n >= 6 ? 'high' : n >= 3 ? 'mid' : 'low'
    return { label: d.label, emoji: d.emoji, hint: d.hint, score: n, level }
  })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
}

// ---- Plan generator ---------------------------------------------------------
// A plan is tailored to the KIND of place it centres on — a dinner out, a
// coffee morning, an outdoor half-day, a bookstore afternoon, a grocery run or
// an evening event each get their own pacing, supporting stops and tips. It is
// then PERSONALIZED with one extra stop matched to the user's local-life
// preference profile. `{area}` in a description is filled with the anchor's
// neighborhood.

interface PlanVariant {
  vibe: string
  when: string
  anchorTime: string
  before: PlanStop[]
  after: PlanStop[]
}

interface PlanKindTemplate {
  title: string
  anchorTravel: string
  anchorTip: string
  variants: [PlanVariant, PlanVariant]
}

const PLAN_KINDS: Record<PlanKind, PlanKindTemplate> = {
  meal: {
    title: '约会聚餐夜',
    anchorTravel: '🚶 步行可达',
    anchorTip: '💡 招牌菜先点上;工作日通常比周末好订位,热门时段建议提前订。',
    variants: [
      {
        vibe: '🌆 经典约会夜',
        when: '本周五 17:30',
        anchorTime: '19:00',
        before: [
          {
            time: '17:30',
            emoji: '🚶',
            title: '提前到,先散个步',
            desc: '比订位时间早半小时到 {area},沿街走走、看看橱窗,把节奏先慢下来。',
          },
        ],
        after: [
          {
            time: '21:00',
            emoji: '🍨',
            title: '餐后甜点散步',
            travel: '🚶 6 分钟',
            desc: '慢慢走去 {area} 附近还开着的甜品店,边走边把今晚的话聊完。',
          },
        ],
      },
      {
        vibe: '🍸 微醺夜生活',
        when: '本周五 18:30',
        anchorTime: '19:30',
        before: [
          {
            time: '18:30',
            emoji: '🍸',
            title: '餐前小酌',
            desc: '先在 {area} 附近找家酒吧喝一杯热场,空腹别太久,垫点小食。',
          },
        ],
        after: [
          {
            time: '21:30',
            emoji: '🎶',
            title: '找点现场气氛',
            travel: '🚶 8 分钟',
            desc: '饭后转去附近的 live house 或安静酒馆,给这一晚收个尾。',
          },
        ],
      },
    ],
  },
  cafe: {
    title: '慢咖啡时光',
    anchorTravel: '🚶 几步路',
    anchorTip: '💡 招牌饮品配一份现烤的刚好;靠窗或户外位最舒服,现烤糕点卖得快、想吃早点到。',
    variants: [
      {
        vibe: '☕️ 慵懒上午',
        when: '本周六 10:00',
        anchorTime: '10:30',
        before: [
          {
            time: '10:00',
            emoji: '🗞️',
            title: '不慌不忙出门',
            desc: '不用赶时间,带本书或耳机;{area} 这一带上午人少、光线也正好。',
          },
        ],
        after: [
          {
            time: '12:00',
            emoji: '🚶',
            title: '喝完再逛逛',
            travel: '🚶 5 分钟',
            desc: '沿着 {area} 周边慢慢走一圈,逛逛小店再回家。',
          },
        ],
      },
      {
        vibe: '🥐 边吃边逛',
        when: '本周六 09:45',
        anchorTime: '10:30',
        before: [
          {
            time: '09:45',
            emoji: '🛍️',
            title: '先逛逛小店',
            desc: '趁人少先在 {area} 附近转转,周末早晨常有刚开门的小店。',
          },
        ],
        after: [
          {
            time: '12:00',
            emoji: '📖',
            title: '找个地方坐下',
            travel: '🚶 7 分钟',
            desc: '带上买的东西,找家书店或公园把上午收个尾。',
          },
        ],
      },
    ],
  },
  outdoor: {
    title: '户外半日',
    anchorTravel: '🚗 开车前往',
    anchorTip: '💡 穿好走路的鞋、带够水和防晒;正午前结束最舒服。',
    variants: [
      {
        vibe: '🌄 清晨户外',
        when: '本周六 08:30',
        anchorTime: '09:30',
        before: [
          {
            time: '08:30',
            emoji: '☕️',
            title: '出发前补给',
            desc: '路上买杯咖啡、带够水;{area} 一带上午凉快、人也少。',
          },
        ],
        after: [
          {
            time: '12:00',
            emoji: '🍜',
            title: '迟来的午餐',
            travel: '🚗 12 分钟',
            desc: '走完一身轻松,回 {area} 附近找家小馆吃顿热乎的。',
          },
        ],
      },
      {
        vibe: '🌇 黄昏漫步',
        when: '本周六 16:00',
        anchorTime: '16:45',
        before: [
          {
            time: '16:00',
            emoji: '🧺',
            title: '带点零食出门',
            desc: '下午晚些出发避开高温;带点零食,{area} 的傍晚最适合慢慢逛。',
          },
        ],
        after: [
          {
            time: '18:30',
            emoji: '🍽️',
            title: '收尾晚餐',
            travel: '🚗 10 分钟',
            desc: '看完日落,就近找家餐馆把这一天画上句号。',
          },
        ],
      },
    ],
  },
  bookstore: {
    title: '书店下午',
    anchorTravel: '🚶 步行可达',
    anchorTip: '💡 别排太赶的行程;问问店员,独立书店的推荐往往很准,留意本地作者与二手区。',
    variants: [
      {
        vibe: '📖 安静的下午',
        when: '本周六 14:00',
        anchorTime: '14:30',
        before: [
          {
            time: '14:00',
            emoji: '☕️',
            title: '先来杯咖啡',
            desc: '逛书店前先在 {area} 附近喝杯咖啡,把状态调到「慢」。',
          },
        ],
        after: [
          {
            time: '16:30',
            emoji: '🍰',
            title: '带书找个角落',
            travel: '🚶 6 分钟',
            desc: '拿着淘到的书,找家咖啡馆或公园翻上几页。',
          },
        ],
      },
      {
        vibe: '🛍️ 街区漫游',
        when: '本周六 13:30',
        anchorTime: '14:15',
        before: [
          {
            time: '13:30',
            emoji: '🚶',
            title: '逛逛街区',
            desc: '先在 {area} 老城区随便走走,独立书店周边常有有意思的小店。',
          },
        ],
        after: [
          {
            time: '16:00',
            emoji: '🍵',
            title: '歇脚收尾',
            travel: '🚶 5 分钟',
            desc: '逛累了找家茶馆或甜品店坐下,翻翻刚买的书。',
          },
        ],
      },
    ],
  },
  shopping: {
    title: '逛店淘货半日',
    anchorTravel: '🚶 步行可达',
    anchorTip: '💡 二手店货品每天在变,不赶时间慢慢翻;看到合眼缘的别犹豫,下次未必还在。',
    variants: [
      {
        vibe: '🛍️ 周末淘货',
        when: '本周六 12:00',
        anchorTime: '12:30',
        before: [
          {
            time: '12:00',
            emoji: '🥪',
            title: '先吃个简餐',
            desc: '空腹逛容易累 —— 先在 {area} 附近吃点东西垫垫肚子。',
          },
        ],
        after: [
          {
            time: '14:30',
            emoji: '☕️',
            title: '歇脚翻战利品',
            travel: '🚶 5 分钟',
            desc: '淘累了找家咖啡馆坐下,把今天挑到的东西摊开看看。',
          },
        ],
      },
      {
        vibe: '🚶 一条街逛到底',
        when: '本周六 13:30',
        anchorTime: '14:00',
        before: [
          {
            time: '13:30',
            emoji: '🚶',
            title: '从街角开始',
            desc: '沿着 {area} 一条街慢慢逛,二手店常一家挨着一家。',
          },
        ],
        after: [
          {
            time: '16:00',
            emoji: '🍰',
            title: '收尾甜点',
            travel: '🚶 6 分钟',
            desc: '逛到下午找家甜品店收尾,顺便决定哪几件值得回头买。',
          },
        ],
      },
    ],
  },
  grocery: {
    title: '周末囤货',
    anchorTravel: '🚶 几步路',
    anchorTip: '💡 周末上午人最多;自带保温袋,生鲜冷冻先逛后拿,留意开业优惠与会员注册。',
    variants: [
      {
        vibe: '🛒 周末囤货',
        when: '本周六 11:00',
        anchorTime: '11:00',
        before: [],
        after: [
          {
            time: '12:30',
            emoji: '🍜',
            title: '美食广场午餐',
            travel: '🚶 2 分钟',
            desc: '逛完直接在超市的美食广场吃午饭 —— 大型亚洲超市的 food hall 选择很多。',
          },
          {
            time: '14:00',
            emoji: '🧊',
            title: '把生鲜送回家',
            travel: '🚗 顺路',
            desc: '买了生鲜别久放,先回一趟家,下午再安排别的。',
          },
        ],
      },
      {
        vibe: '🍱 边逛边吃',
        when: '本周六 10:30',
        anchorTime: '11:15',
        before: [
          {
            time: '10:30',
            emoji: '☕️',
            title: '先垫垫肚子',
            desc: '空腹逛超市容易乱买 —— 先在 {area} 附近喝杯咖啡、吃点东西。',
          },
        ],
        after: [
          {
            time: '13:00',
            emoji: '🥡',
            title: '把想吃的带回家',
            travel: '🚶 2 分钟',
            desc: '挑些熟食和半成品,回家就能复刻一桌;别忘了试试自有品牌。',
          },
        ],
      },
    ],
  },
  family: {
    title: '家庭日',
    anchorTravel: '🚗 开车前往',
    anchorTip: '💡 周末上午人最多,早点到更从容;热门场馆建议提前在网上订票。',
    variants: [
      {
        vibe: '🧸 轻松家庭日',
        when: '本周六 10:00',
        anchorTime: '10:30',
        before: [
          {
            time: '10:00',
            emoji: '🚗',
            title: '出发前准备',
            desc: '带上水、零食和换洗衣物;{area} 一带上午人还不算多。',
          },
        ],
        after: [
          {
            time: '12:30',
            emoji: '🍕',
            title: '一顿热闹的午餐',
            travel: '🚗 10 分钟',
            desc: '玩到中午,找家孩子友好、有儿童餐的馆子坐下来吃饭。',
          },
          {
            time: '14:00',
            emoji: '🍦',
            title: '甜点 + 放电',
            travel: '🚶 5 分钟',
            desc: '饭后来支冰淇淋,再找块草地让孩子跑一跑。',
          },
        ],
      },
      {
        vibe: '🎉 朋友组局日',
        when: '本周六 13:00',
        anchorTime: '13:30',
        before: [
          {
            time: '13:00',
            emoji: '☕️',
            title: '集合',
            desc: '约上人先在 {area} 附近碰个头,买杯喝的再出发。',
          },
        ],
        after: [
          {
            time: '16:00',
            emoji: '🍻',
            title: '收尾小聚',
            travel: '🚶 8 分钟',
            desc: '玩累了找个地方坐下,边吃边聊把这天收尾。',
          },
        ],
      },
    ],
  },
  event: {
    title: '看演出的晚上',
    anchorTravel: '🚶 步行到场馆',
    anchorTip: '💡 提前查清入场时间与停车;城里的活动建议公共交通前往,热门场次早点到。',
    variants: [
      {
        vibe: '🎭 看演出的晚上',
        when: '演出当晚 18:00',
        anchorTime: '19:30',
        before: [
          {
            time: '18:00',
            emoji: '🍽️',
            title: '场馆附近吃晚餐',
            desc: '提前到场馆所在的 {area} 先吃顿饭 —— 散场后餐馆大多打烊了。',
          },
        ],
        after: [
          {
            time: '22:00',
            emoji: '🍷',
            title: '散场后小聚',
            travel: '🚶 8 分钟',
            desc: '看完别急着走,附近找家还开着的酒馆,聊聊刚才的演出。',
          },
        ],
      },
      {
        vibe: '🌃 演出 + 夜游',
        when: '演出当晚 17:30',
        anchorTime: '19:30',
        before: [
          {
            time: '17:30',
            emoji: '🚶',
            title: '先逛逛街区',
            desc: '早点到场馆所在的 {area} 走走,顺便把晚饭解决了。',
          },
        ],
        after: [
          {
            time: '22:00',
            emoji: '🍜',
            title: '深夜一碗',
            travel: '🚶 10 分钟',
            desc: '散场后找家深夜还营业的小馆,一碗面收尾。',
          },
        ],
      },
    ],
  },
}

// Preference-matched extra stop. `window` is the sensible hour range for the
// stop (no late-night coffee); `prefer` is whether it reads better appended at
// the end or slotted in before the plan starts.
const PREF_STOPS: {
  match: string[]
  skip: PlanKind
  prefer: 'pre' | 'post'
  window: [number, number]
  emoji: string
  title: string
  desc: string
}[] = [
  {
    match: ['咖啡', '咖啡馆'],
    skip: 'cafe',
    prefer: 'post',
    window: [7, 18],
    emoji: '☕️',
    title: '顺路来杯咖啡',
    desc: '你最近常看咖啡内容 —— 在 {area} 拐进一家本地咖啡馆坐坐。',
  },
  {
    match: ['甜品', '冰品', 'gelato', '抹茶'],
    skip: 'cafe',
    prefer: 'post',
    window: [11, 23],
    emoji: '🍦',
    title: '加一份甜的',
    desc: '你偏爱甜点 —— 安排一份冰淇淋,或一块现做蛋糕。',
  },
  {
    match: ['户外', '散步', '徒步', '自然', '植物园'],
    skip: 'outdoor',
    prefer: 'pre',
    window: [7, 18],
    emoji: '🌳',
    title: '绿地里走走',
    desc: '你常关注户外 —— 去 {area} 附近的公园绿地走一圈。',
  },
  {
    match: ['书店', '阅读'],
    skip: 'bookstore',
    prefer: 'pre',
    window: [10, 20],
    emoji: '📚',
    title: '逛家书店',
    desc: '你常看书店内容 —— 进家 {area} 的本地独立书店翻翻。',
  },
  {
    match: ['红酒', '小酌'],
    skip: 'meal',
    prefer: 'post',
    window: [17, 24],
    emoji: '🍷',
    title: '小酌一杯',
    desc: '你偏好微醺时光 —— 找家红酒小馆小酌一杯。',
  },
  {
    match: ['烘焙', '面包'],
    skip: 'cafe',
    prefer: 'pre',
    window: [7, 16],
    emoji: '🥐',
    title: '带个面包走',
    desc: '你常看烘焙内容 —— 顺路买个现烤的带回家。',
  },
]

function classify(tags: string[], category: string): PlanKind {
  const has = (...ks: string[]) =>
    ks.some((k) => tags.includes(k) || category.includes(k))
  if (has('亚洲超市', '超市')) return 'grocery'
  if (has('户外', '植物园', '徒步', '自然', '散步')) return 'outdoor'
  if (has('书店', '阅读')) return 'bookstore'
  if (has('古着', '购物', '复古', '旧物', '二手', '淘货')) return 'shopping'
  if (has('亲子', '遛娃', '科普', '玩乐', '动物', '游乐场')) return 'family'
  if (
    has('咖啡', '也门咖啡', '烘焙', '面包', 'gelato', '冰品', '抹茶', '甜品', '早午餐', '三明治', 'Cafe')
  )
    return 'cafe'
  return 'meal'
}

const cleanArea = (n: string) => n.split(' · ')[0]

function addMinutes(t: string, mins: number): string {
  const [h, m] = t.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(
    total % 60,
  ).padStart(2, '0')}`
}

export function planVariantCount(): number {
  return 2
}

export function planSeedFromArticle(a: Article): PlanSeed {
  const p = a.pois[0]
  return {
    id: a.id,
    title: a.headline,
    kind: classify(a.tags, p.category),
    area: cleanArea(p.neighborhood),
    anchorName: p.name,
    anchorEmoji: p.emoji,
    anchorBlurb: p.blurb,
    anchorImage: p.image,
  }
}

export function planSeedFromDiscover(d: DiscoverCard): PlanSeed {
  let fixedWhen: string | undefined
  if (d.kind === 'event' && d.date) {
    const [, mm, dd] = d.date.split('-')
    fixedWhen = `演出日期 · ${Number(mm)}/${Number(dd)}`
  }
  return {
    id: d.id,
    title: d.title,
    kind: d.kind === 'event' ? 'event' : classify(d.tags, d.category),
    area: cleanArea(d.neighborhood),
    anchorName: d.title,
    anchorEmoji: d.emoji,
    anchorBlurb: d.blurb,
    anchorImage: d.image,
    fixedWhen,
  }
}

/**
 * Builds the optional preference-matched stop — time-of-day aware. A daytime
 * stop (coffee, a walk) won't be tacked onto the end of a late evening; it is
 * slotted in before the plan instead, or dropped if neither time fits.
 */
function preferenceStop(
  prefTags: string[],
  kind: PlanKind,
  area: string,
  firstTime: string,
  lastTime: string,
): { stop: PlanStop; pos: 'pre' | 'post' } | null {
  const hourOf = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h + m / 60
  }
  const postT = addMinutes(lastTime, 75)
  const preT = addMinutes(firstTime, -80)
  for (const tag of prefTags) {
    const m = PREF_STOPS.find((p) => p.match.includes(tag) && p.skip !== kind)
    if (!m) continue
    const fits = (t: string) => hourOf(t) >= m.window[0] && hourOf(t) <= m.window[1]
    const order = m.prefer === 'pre' ? (['pre', 'post'] as const) : (['post', 'pre'] as const)
    for (const pos of order) {
      const time = pos === 'post' ? postT : preT
      if (!fits(time)) continue
      return {
        pos,
        stop: {
          time,
          emoji: m.emoji,
          title: m.title,
          desc: m.desc.replace(/\{area\}/g, area),
          travel: pos === 'post' ? '🚶 顺路' : undefined,
          forYou: true,
        },
      }
    }
  }
  return null
}

/**
 * Builds the OPTIONAL multi-stop itinerary — only when the user chooses to
 * expand one. A plain commitment doesn't need it.
 */
export function generateItinerary(
  seed: PlanSeed,
  variant = 0,
  prefTags: string[] = [],
): { vibe: string; stops: PlanStop[] } {
  const t = PLAN_KINDS[seed.kind]
  const v = t.variants[((variant % 2) + 2) % 2]
  const fill = (s: string) => s.replace(/\{area\}/g, seed.area)
  const before = v.before.map((s) => ({ ...s, desc: fill(s.desc) }))
  const after = v.after.map((s) => ({ ...s, desc: fill(s.desc) }))
  const anchor: PlanStop = {
    time: v.anchorTime,
    emoji: seed.anchorEmoji,
    title: seed.anchorName,
    desc: seed.anchorBlurb,
    tip: t.anchorTip,
    travel: before.length ? t.anchorTravel : undefined,
    image: seed.anchorImage,
    anchor: true,
  }
  const stops = [...before, anchor, ...after]
  const pref = preferenceStop(
    prefTags,
    seed.kind,
    seed.area,
    stops[0].time,
    stops[stops.length - 1].time,
  )
  if (pref) {
    if (pref.pos === 'post') {
      stops.push(pref.stop)
    } else {
      stops[0] = { ...stops[0], travel: stops[0].travel ?? '🚶 顺路' }
      stops.unshift(pref.stop)
    }
  }
  return { vibe: v.vibe, stops }
}
