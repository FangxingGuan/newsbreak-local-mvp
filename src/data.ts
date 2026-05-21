// Article-driven feed data.
//
// Each article is a real local-news report supplied to the demo. The POIs it
// mentions were extracted, then enriched with live data from Yelp Fusion /
// Google Places (ratings, review counts, photos, prices captured 2026-05).
// Article bodies are original Chinese summaries of the reporting — not copies.

import type {
  Article,
  DiscoverCard,
  FeedEntry,
  Plan,
  PlanKind,
  PlanSeed,
  PlanStop,
} from './types'

export const USER_LOCATION = 'Palo Alto, CA'

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
    id: 'd-davelandau',
    kind: 'event',
    badge: '🔥 本周热门活动',
    title: 'Dave Landau',
    category: '脱口秀 · 喜剧',
    emoji: '🎤',
    cover: 'linear-gradient(135deg,#0f2027,#2c5364)',
    image:
      'https://s1.ticketm.net/dam/a/d74/4adaa7b3-91c9-4541-a3df-59e35af8bd74_RETINA_PORTRAIT_16_9.jpg',
    neighborhood: 'San Francisco',
    distance: '32.0 mi',
    date: '2026-05-20',
    price: '门票',
    blurb: '喜剧演员 Dave Landau 本周在旧金山 Cobb’s Comedy Club 开演。',
    intent: '订张票去 Cobb’s 看一场脱口秀',
    tags: ['脱口秀', '喜剧', '演出'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fdave-landau-san-francisco-california-05-20-2026%2Fevent%2F1C0064432114C05F&utm_medium=affiliate',
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
    id: 'd-gatecreeper',
    kind: 'event',
    badge: '🔥 本周热门活动',
    title: 'Gatecreeper',
    category: 'Music · 现场演出',
    emoji: '🎸',
    cover: 'linear-gradient(135deg,#232526,#414345)',
    image:
      'https://s1.ticketm.net/dam/a/bff/cc6fbd26-e821-45a6-99e2-53716d1e8bff_RETINA_PORTRAIT_16_9.jpg',
    neighborhood: 'San Francisco',
    distance: '30.3 mi',
    date: '2026-05-20',
    price: '门票',
    blurb: '金属乐队 Gatecreeper 巡演,本周在旧金山 Rickshaw Stop 的 live house 开唱。',
    intent: '订张票去 Rickshaw Stop 看场现场',
    tags: ['现场演出', '音乐', 'Live'],
    ticketUrl:
      'https://ticketmaster.evyy.net/c/nbotaction/264167/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fevent%2FZ7r9jZ1A7x7-b&utm_medium=affiliate',
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
]

export function getDiscover(id: string): DiscoverCard | undefined {
  return DISCOVER.find((d) => d.id === id)
}

/** Type guard: distinguishes a discover card from an article. */
export function isDiscover(entry: FeedEntry): entry is DiscoverCard {
  return (entry as DiscoverCard).type === 'discover'
}

/**
 * The user's local-life preference profile — aggregated from the tags of the
 * articles they have read and the discover cards they have engaged with.
 */
export function getPreferences(
  read: string[],
  seen: string[],
): { tag: string; n: number }[] {
  const freq = new Map<string, number>()
  read.forEach((id) =>
    getArticle(id)?.tags.forEach((t) => freq.set(t, (freq.get(t) ?? 0) + 1)),
  )
  seen.forEach((id) =>
    getDiscover(id)?.tags.forEach((t) => freq.set(t, (freq.get(t) ?? 0) + 1)),
  )
  return [...freq.entries()]
    .map(([tag, n]) => ({ tag, n }))
    .sort((a, b) => b.n - a.n)
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
