// Builds the Local Life Assistant's anchor picks for the three windows:
//   couple_dinner (约会就餐)   — Yelp, evening-dining categories, $$+
//   family_outing (带娃出行)   — Yelp, family-friendly categories
//   weekend_events (周末活动)  — Ticketmaster events + a brewery alt from Yelp
//
// Each pick conforms to the DiscoverCard shape so the existing CommitSheet
// flow ("加入计划") works without any plumbing.
//
// Output: src/assistant-picks.json — re-generated every cron run.
//
//   node scripts/build-assistant.mjs

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PALO_ALTO_LATLNG = '37.4419,-122.1430'
const PALO_ALTO_LAT = 37.4419
const PALO_ALTO_LNG = -122.143
const YELP_RADIUS_M = 40000 // Yelp max — ~25 mi
const PA_ZIP = '94301'

async function readEnv(key) {
  const env = await readFile('.env', 'utf8')
  const line = env.split('\n').find((l) => l.startsWith(`${key}=`))
  return line ? line.slice(key.length + 1).trim() : ''
}

async function yelpSearch(params, key) {
  const u = new URL('https://api.yelp.com/v3/businesses/search')
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v)
  const res = await fetch(u, {
    headers: { Authorization: 'Bearer ' + key },
    signal: AbortSignal.timeout(25000),
  })
  if (!res.ok) throw new Error(`yelp ${res.status}: ${u.toString()}`)
  return (await res.json()).businesses || []
}

function metersToMiles(m) {
  return (m / 1609.34).toFixed(1)
}

// Service-provider category titles that slip through the umbrella search but
// aren't walk-in destinations (private lessons, schools, training).
const SERVICE_CATS = [
  'Lesson', 'Class', 'School', 'Training', 'Tutor', 'Coach', 'Instructor',
  'Music & DJs', 'Performing Arts', 'Custom Cake', 'Delivery',
]

function isServiceCategory(b) {
  const titles = (b.categories || []).map((c) => c.title)
  const name = b.name || ''
  // Either an explicit service category, OR the business name itself signals
  // a service ("XYZ Lessons", "Music Academy") rather than a destination.
  if (titles.some((t) => SERVICE_CATS.some((s) => t.includes(s)))) return true
  if (/(Lesson|Class|Academy|Training|Tutor|Coach|Studio$|School|STEM|Tutoring)/i.test(name))
    return true
  return false
}

// Cold-start scoring: a nearby decent place beats an excellent far one.
// score = rating × exp(-distanceMi / decayMi). Smaller decay = nearer-biased.
function pickFromYelp(list, opts = {}) {
  const {
    max = 3,
    minRating = 4.2,
    minReviews = 40,
    maxDistanceM = 25 * 1609,
    decayMi = 8,
  } = opts
  return list
    .filter(
      (b) =>
        !b.is_closed &&
        b.rating >= minRating &&
        b.review_count >= minReviews &&
        b.review_count <= 6000 &&
        b.distance != null &&
        b.distance <= maxDistanceM &&
        !isServiceCategory(b),
    )
    .map((b) => ({ b, score: b.rating * Math.exp(-b.distance / 1609.34 / decayMi) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.b)
}

const COVERS = {
  couple_dinner: 'linear-gradient(135deg,#7b1f1f,#c54658)',
  family_outing: 'linear-gradient(135deg,#ff9966,#ff5e62)',
  weekend_events: 'linear-gradient(135deg,#7f00ff,#e100ff)',
}

function emojiForCategory(titles) {
  const c = titles.join(' ')
  if (/Sushi|Japanese|Ramen|Izakaya/i.test(c)) return '🍣'
  if (/Wine|Bar/i.test(c)) return '🍷'
  if (/French|Italian|Pasta|Pizza/i.test(c)) return '🍝'
  if (/Brewery|Brewpub|Beer/i.test(c)) return '🍻'
  if (/Park|Garden|Botanical/i.test(c)) return '🌳'
  if (/Museum|Gallery/i.test(c)) return '🏛️'
  if (/Bowling|Arcade/i.test(c)) return '🎳'
  if (/Zoo|Aquarium/i.test(c)) return '🐾'
  if (/Children|Kids|Family/i.test(c)) return '👨‍👩‍👧'
  return '📍'
}

function toCard({ window, b, badge, intent, tags }) {
  const titles = (b.categories || []).map((c) => c.title)
  return {
    type: 'discover',
    id: 'ap-' + window + '-' + b.id.slice(0, 12),
    kind: 'find',
    badge,
    title: b.name,
    category: titles.slice(0, 2).join(' · '),
    emoji: emojiForCategory(titles),
    cover: COVERS[window],
    image: b.image_url || '',
    neighborhood:
      (b.location && (b.location.city || b.location.address1)) || '',
    distance: `${metersToMiles(b.distance)} mi`,
    rating: b.rating,
    reviews: b.review_count,
    price: b.price || undefined,
    blurb: `${titles[0] || '本地小店'} · ${
      b.rating
    }★ / ${b.review_count.toLocaleString()} 评价 · 由 Local Life Assistant 推荐`,
    intent,
    tags,
    yelpUrl: (b.url || '').split('?')[0],
    assistant: {
      window,
      reason: 'Yelp 高分 + 在你的半岛半径内',
    },
  }
}

// --- Couple dinner -----------------------------------------------------------

// "Date-worthiness" isn't in a rating × distance score — it's price, ambiance,
// sit-down, occasion fit. For restaurants we curate the Peninsula date canon
// (the spots a local knows are date-night material) and pull live Yelp data
// for each by name. Raw category search only fills if the canon comes up short.
const DATE_CANON = [
  ['Evvia Estiatorio', 'Palo Alto, CA'],
  ['Tamarine Restaurant', 'Palo Alto, CA'],
  ['Bird Dog', 'Palo Alto, CA'],
  ['Protégé', 'Palo Alto, CA'],
  ['Zola', 'Palo Alto, CA'],
  ['Sundance the Steakhouse', 'Palo Alto, CA'],
  ['Camper', 'Menlo Park, CA'],
  ['Selby’s', 'Atherton, CA'],
  ['Donato Enoteca', 'Redwood City, CA'],
  ['Vesta', 'Redwood City, CA'],
  ['Sushi Adachi', 'Mountain View, CA'],
  ['Naomi Sushi', 'Menlo Park, CA'],
]

async function fetchCoupleDinner(yk) {
  const found = new Map()
  for (const [term, loc] of DATE_CANON) {
    try {
      const r = await yelpSearch({ term, location: loc, limit: '1' }, yk)
      const b = r[0]
      if (!b || b.is_closed) continue
      // Confirm the match name roughly equals the canon term (avoid wrong hits).
      const t = term.toLowerCase().replace(/[^a-z]/g, '')
      const n = b.name.toLowerCase().replace(/[^a-z]/g, '')
      if (!n.includes(t.slice(0, 5)) && !t.includes(n.slice(0, 5))) continue
      if (b.distance != null && b.distance > 12 * 1609) continue
      if (!found.has(b.id)) found.set(b.id, b)
    } catch {
      /* skip a canon miss */
    }
  }
  const canon = [...found.values()].sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))

  // Keep a deeper pool (up to 8) so the refine sheet has room to filter.
  let picks = canon.slice(0, 8)
  if (picks.length < 6) {
    const list = await yelpSearch(
      {
        location: PA_ZIP,
        radius: String(16000),
        categories: 'wine_bars,french,italian,newamerican,mediterranean,tapas,seafood,steak',
        price: '3,4',
        sort_by: 'rating',
        limit: '40',
      },
      yk,
    )
    const fill = pickFromYelp(list, { max: 8, minRating: 4.3, maxDistanceM: 10 * 1609, decayMi: 6 })
    for (const b of fill) {
      if (picks.length >= 8) break
      if (!found.has(b.id)) {
        found.set(b.id, b)
        picks.push(b)
      }
    }
  }

  return picks.slice(0, 8).map((b) =>
    toCard({
      window: 'couple_dinner',
      b,
      badge: '🍷 约会就餐',
      intent: `约个晚上去 ${b.name} 吃顿好的`,
      tags: ['约会', '晚餐', '半岛'],
    }),
  )
}

// --- Family outing -----------------------------------------------------------

async function fetchFamilyOuting(yk) {
  // Two passes — Yelp's bucket aliases for family stuff are scattered.
  const a = await yelpSearch(
    {
      location: PA_ZIP,
      radius: String(YELP_RADIUS_M),
      categories:
        'museums,zoos,gardens,parks,playgrounds,childrensactivities,amusementparks,bowling,arcades',
      sort_by: 'rating',
      limit: '40',
    },
    yk,
  )
  const b = await yelpSearch(
    {
      location: PA_ZIP,
      radius: String(YELP_RADIUS_M),
      categories: 'kids_activities,giftshops,toys',
      sort_by: 'rating',
      limit: '20',
    },
    yk,
  )
  const all = [...a, ...b]
  const byId = new Map(all.map((x) => [x.id, x]))
  // Positive allow-list: only true kid-destination categories survive.
  const FAMILY_KEEP = [
    'Museum', 'Garden', 'Park', 'Zoo', 'Aquarium', 'Bowling', 'Arcade',
    'Playground', 'Amusement', "Children's Activities", 'Kids Activities',
    'Mini Golf', 'Karting', 'Trampoline', 'Aquarium',
  ]
  // Negative block-list: the kids_activities bucket leaks party-rental /
  // claw-machine / soft-play / bounce-house *services* (not walk-in
  // destinations). Drop them by name even if their category matched KEEP.
  const FAMILY_BLOCK_RE =
    /(Part(?:y|ies)\b|Claw|Soft Play|Stuffed|Bounce|Inflatable|Rental|Petting|Pop-?Up|Mobile)/i
  const filtered = [...byId.values()].filter(
    (x) =>
      (x.categories || []).some((c) => FAMILY_KEEP.some((k) => c.title.includes(k))) &&
      !FAMILY_BLOCK_RE.test(x.name),
  )
  return pickFromYelp(filtered, {
    max: 6,
    minRating: 4.3,
    minReviews: 15,
    maxDistanceM: 18 * 1609,
    decayMi: 8,
  }).map((x) =>
    toCard({
      window: 'family_outing',
      b: x,
      badge: '👨‍👩‍👧 带娃出行',
      intent: `周末带娃去 ${x.name}`,
      tags: ['亲子', '玩乐', '家庭'],
    }),
  )
}

// --- Weekend events ----------------------------------------------------------

async function fetchTmEvents(tk) {
  // Saturday + Sunday in the next 14 days, within 30 mi.
  const now = new Date()
  const end = new Date(now.getTime() + 14 * 24 * 3600 * 1000)
  const iso = (d) => d.toISOString().slice(0, 19) + 'Z'
  const u = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
  u.searchParams.set('apikey', tk)
  u.searchParams.set('latlong', PALO_ALTO_LATLNG)
  u.searchParams.set('radius', '30')
  u.searchParams.set('unit', 'miles')
  u.searchParams.set('startDateTime', iso(now))
  u.searchParams.set('endDateTime', iso(end))
  u.searchParams.set('size', '50')
  u.searchParams.set('sort', 'relevance,desc')
  const res = await fetch(u, { signal: AbortSignal.timeout(25000) })
  if (!res.ok) return []
  const data = await res.json()
  const events = data._embedded?.events || []
  // Keep only Sat/Sun events.
  return events.filter((e) => {
    const day = e.dates?.start?.localDate
    if (!day) return false
    const d = new Date(day + 'T00:00:00')
    const dow = d.getUTCDay()
    return dow === 0 || dow === 6
  })
}

function tmToCard(e) {
  const img =
    e.images?.find((i) => i.ratio === '16_9' && i.width >= 1024)?.url ||
    e.images?.[0]?.url ||
    ''
  const venueName = e._embedded?.venues?.[0]?.name || ''
  const city = e._embedded?.venues?.[0]?.city?.name || ''
  const genre = e.classifications?.[0]?.segment?.name || ''
  return {
    type: 'discover',
    id: 'ap-weekend-' + e.id.slice(0, 12),
    kind: 'event',
    badge: '🎫 周末活动',
    title: e.name,
    category: `${genre} · ${venueName}`,
    emoji: '🎫',
    cover: COVERS.weekend_events,
    image: img,
    neighborhood: venueName,
    distance: '',
    date: e.dates?.start?.localDate || '',
    price: '门票',
    blurb: `${genre} · ${venueName}${city ? ' · ' + city : ''} · 由 Local Life Assistant 推荐`,
    intent: `订张票去 ${venueName} 看一场`,
    tags: ['演出', '活动', '周末'],
    ticketUrl: e.url || '',
    assistant: {
      window: 'weekend_events',
      reason: '在你半岛半径内的本周末事件 · 按热度排',
    },
  }
}

async function fetchWeekendEvents(yk, tk) {
  const tmEvents = await fetchTmEvents(tk)
  const picks = tmEvents.slice(0, 6).map(tmToCard)
  // If TM is thin, add a brewery alt from Yelp so the window is never empty.
  if (picks.length < 4) {
    const breweries = await yelpSearch(
      {
        location: PA_ZIP,
        radius: String(YELP_RADIUS_M),
        categories: 'breweries,brewpubs,musicvenues',
        sort_by: 'rating',
        limit: '20',
      },
      yk,
    )
    const yelpPicks = pickFromYelp(breweries, { minReviews: 80, max: 8 })
      .slice(0, 6 - picks.length)
      .map((b) =>
        toCard({
          window: 'weekend_events',
          b,
          badge: '🎫 周末活动',
          intent: `周末去 ${b.name} 转转`,
          tags: ['周末', '小酌', '现场'],
        }),
      )
    picks.push(...yelpPicks)
  }
  return picks
}

async function main() {
  const yk = await readEnv('YELP_API_KEY')
  const tk = await readEnv('TICKETMASTER_API_KEY')
  if (!yk || !tk) throw new Error('missing API keys in .env')

  console.log('[couple]   fetching evening dining picks…')
  const couple = await fetchCoupleDinner(yk)
  console.log(`  ${couple.length} picks`)
  console.log('[family]   fetching family outings…')
  const family = await fetchFamilyOuting(yk)
  console.log(`  ${family.length} picks`)
  console.log('[weekend]  fetching TM events + brewery fallbacks…')
  const weekend = await fetchWeekendEvents(yk, tk)
  console.log(`  ${weekend.length} picks`)

  const out = {
    generatedAt: new Date().toISOString(),
    anchor: { city: 'Palo Alto', latlng: PALO_ALTO_LATLNG },
    windows: {
      couple_dinner: couple,
      family_outing: family,
      weekend_events: weekend,
    },
  }

  const path = join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    'src',
    'assistant-picks.json',
  )
  await writeFile(path, JSON.stringify(out, null, 2))
  console.log(
    `\n✅ ${couple.length + family.length + weekend.length} picks → ${path}`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
