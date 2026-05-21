// Article-driven feed data.
//
// Each article is a real local-news report supplied to the demo. The POIs it
// mentions were extracted, then enriched with live data from Yelp Fusion /
// Google Places (ratings, review counts, photos, prices captured 2026-05).
// Article bodies are original Chinese summaries of the reporting — not copies.

import type { Article, Plan, PlanStop } from './types'

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

// ---- Lightweight plan generator ---------------------------------------------
// A plan is built around an article's primary POI, with a couple of moods.

interface PlanVariant {
  vibe: string
  before: PlanStop[]
  after: PlanStop[]
}

const PLAN_VARIANTS: PlanVariant[] = [
  {
    vibe: '☕️ 周末觅食小路线',
    before: [
      {
        time: '10:00',
        emoji: '🚶',
        title: '街区散步',
        desc: '先到附近随便逛逛,慢慢进入状态。',
      },
    ],
    after: [
      {
        time: '12:30',
        emoji: '🍰',
        title: '甜点收尾',
        desc: '就近找家店,把这趟觅食画上句号。',
        travel: '🚶 8 分钟',
      },
    ],
  },
  {
    vibe: '🚗 顺路一日',
    before: [
      {
        time: '09:30',
        emoji: '☕️',
        title: '出发前咖啡',
        desc: '路上先来一杯,顺便把路线理一理。',
      },
    ],
    after: [
      {
        time: '13:00',
        emoji: '🌳',
        title: '公园歇脚',
        desc: '吃饱后找个公园散散步消食。',
        travel: '🚗 10 分钟',
      },
    ],
  },
]

export function planVariantCount(): number {
  return PLAN_VARIANTS.length
}

export function generatePlan(article: Article, variant = 0): Plan {
  const v = PLAN_VARIANTS[((variant % PLAN_VARIANTS.length) + PLAN_VARIANTS.length) % PLAN_VARIANTS.length]
  const poi = article.pois[0]
  const anchor: PlanStop = {
    time: '11:00',
    emoji: poi.emoji,
    title: poi.name,
    desc: poi.blurb,
    travel: '🚗 前往',
    image: poi.image,
    anchor: true,
  }
  return {
    id: `plan-${article.id}-${Date.now()}`,
    title: `${poi.name} 觅食计划`,
    when: '本周六 10:00',
    vibe: v.vibe,
    basedOnArticleId: article.id,
    basedOnTitle: article.headline,
    stops: [...v.before, anchor, ...v.after],
    createdAt: Date.now(),
  }
}
