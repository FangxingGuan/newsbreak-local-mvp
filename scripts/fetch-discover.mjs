// API-driven discovery fetch — counterpart to fetch-news.mjs.
//
// Pulls candidate discover cards from two APIs:
//   • Yelp Fusion — top-rated low-review-count businesses near each priority
//     zipcode, the "本地小众新发现" pattern
//   • Ticketmaster Discovery — events within 30 mi of Palo Alto in the next
//     14 days
//
// Output: scripts/.cache/discover-candidates.json
//
// Claude (running the cron) reads this together with news-feed-latest.json,
// dedups against the seen ledger (yelp:<id> / tm:<id> prefixes), and decides
// which to auto-add as DISCOVER cards. Same auto-add + uncertain-pause rules
// apply.
//
//   node scripts/fetch-discover.mjs

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const YELP_ZONES = [
  ['94301', 'Palo Alto'],
  ['94041', 'Mountain View'],
  ['94063', 'Redwood City'],
  ['94110', 'SF Mission'],
  ['94133', 'SF North Beach'],
  ['94607', 'Oakland'],
  ['94709', 'Berkeley'],
  ['95113', 'San Jose'],
]

// Specific Yelp category aliases rather than the broad umbrellas — keeps the
// search anchored on consumer destinations and drops service categories
// (vocal coaches, interior designers, custom-cake delivery, social clubs).
const YELP_CATEGORIES = [
  'restaurants,cafes,bakeries,bars,breweries,wineries',
  'museums,galleries,gardens,landmarks',
  'bookstores,secondhandstores,giftshops,comicbooks,antiques,vintage',
  'parks,hiking,beaches,brewpubs',
]

// A business is kept only if at least one of its category titles matches one
// of these substrings — a positive allow-list that filters out
// service-provider categories the umbrella search still returns.
const VISITABLE_KEYWORDS = [
  'Restaurant', 'Cafe', 'Café', 'Bar', 'Brewery', 'Brewpub', 'Bakery',
  'Pizza', 'Sushi', 'Ramen', 'Noodle', 'Burger', 'Taco', 'BBQ', 'Korean',
  'Chinese', 'Japanese', 'Mexican', 'Italian', 'Indian', 'Thai', 'Vietnamese',
  'Coffee', 'Tea', 'Ice Cream', 'Patisserie', 'Donut', 'Dessert', 'Gelato',
  'Wine', 'Cocktail',
  'Museum', 'Gallery', 'Garden', 'Park', 'Beach', 'Hiking', 'Botanical', 'Landmark',
  'Bookstore', 'Vintage', 'Antique', 'Toy', 'Gift', 'Comic', 'Record', 'Specialty Food',
]

const PALO_ALTO_LATLNG = '37.4419,-122.1430'
const TM_RADIUS_MI = 30
const TM_DAYS_AHEAD = 14

async function readEnv(key) {
  const env = await readFile('.env', 'utf8')
  const line = env.split('\n').find((l) => l.startsWith(`${key}=`))
  return line ? line.slice(key.length + 1).trim() : ''
}

// ---- Yelp Fusion: niche finds ----------------------------------------------

async function fetchYelpNicheFinds(yelpKey) {
  const all = new Map() // id → business
  for (const [zip, area] of YELP_ZONES) {
    for (const cat of YELP_CATEGORIES) {
      const u = new URL('https://api.yelp.com/v3/businesses/search')
      u.searchParams.set('location', zip)
      u.searchParams.set('categories', cat)
      u.searchParams.set('sort_by', 'rating')
      u.searchParams.set('limit', '20')
      try {
        const res = await fetch(u, {
          headers: { Authorization: 'Bearer ' + yelpKey },
          signal: AbortSignal.timeout(25000),
        })
        if (!res.ok) {
          console.error(`  ⚠️  yelp ${zip}/${cat}: HTTP ${res.status}`)
          continue
        }
        const data = await res.json()
        for (const b of data.businesses || []) {
          if (all.has(b.id)) continue
          // Niche-find signature: high rating, real reviews, open, and the
          // business is a visitable consumer destination (not a service).
          if (b.is_closed) continue
          if (b.rating < 4.5) continue
          if (b.review_count < 20 || b.review_count > 300) continue
          const titles = (b.categories || []).map((c) => c.title)
          if (!titles.some((t) => VISITABLE_KEYWORDS.some((k) => t.includes(k))))
            continue
          all.set(b.id, {
            source: 'yelp',
            id: b.id,
            name: b.name,
            rating: b.rating,
            reviewCount: b.review_count,
            price: b.price ?? null,
            categories: (b.categories || []).map((c) => c.title),
            searchedNear: area,
            address: (b.location?.display_address || []).join(', '),
            city: b.location?.city ?? '',
            coordinates: b.coordinates,
            image: b.image_url || '',
            yelpUrl: (b.url || '').split('?')[0],
            phone: b.phone || '',
          })
        }
      } catch (e) {
        console.error(`  ⚠️  yelp ${zip}/${cat}:`, e.message)
      }
    }
  }
  return [...all.values()]
}

// ---- Ticketmaster Discovery: nearby events ---------------------------------

async function fetchTicketmasterEvents(tmKey) {
  const start = new Date()
  const end = new Date(start.getTime() + TM_DAYS_AHEAD * 24 * 3600 * 1000)
  const iso = (d) => d.toISOString().slice(0, 19) + 'Z'
  const u = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
  u.searchParams.set('apikey', tmKey)
  u.searchParams.set('latlong', PALO_ALTO_LATLNG)
  u.searchParams.set('radius', String(TM_RADIUS_MI))
  u.searchParams.set('unit', 'miles')
  u.searchParams.set('startDateTime', iso(start))
  u.searchParams.set('endDateTime', iso(end))
  u.searchParams.set('size', '50')
  u.searchParams.set('sort', 'relevance,desc')
  try {
    const res = await fetch(u, { signal: AbortSignal.timeout(25000) })
    if (!res.ok) {
      console.error(`  ⚠️  ticketmaster: HTTP ${res.status}`)
      return []
    }
    const data = await res.json()
    const events = data._embedded?.events || []
    return events.map((e) => ({
      source: 'ticketmaster',
      id: e.id,
      name: e.name,
      date: e.dates?.start?.localDate || '',
      time: e.dates?.start?.localTime || '',
      classification: e.classifications?.[0]?.segment?.name || '',
      genre: e.classifications?.[0]?.genre?.name || '',
      venue: e._embedded?.venues?.[0]?.name || '',
      venueCity: e._embedded?.venues?.[0]?.city?.name || '',
      image:
        e.images?.find((i) => i.ratio === '16_9' && i.width >= 1024)?.url ||
        e.images?.[0]?.url ||
        '',
      url: e.url || '',
      priceMin: e.priceRanges?.[0]?.min ?? null,
      priceMax: e.priceRanges?.[0]?.max ?? null,
      priceCurrency: e.priceRanges?.[0]?.currency || '',
    }))
  } catch (e) {
    console.error('  ⚠️  ticketmaster:', e.message)
    return []
  }
}

// ---- Main ------------------------------------------------------------------

async function main() {
  const yelpKey = await readEnv('YELP_API_KEY')
  const tmKey = await readEnv('TICKETMASTER_API_KEY')
  if (!yelpKey || !tmKey) {
    throw new Error('missing YELP_API_KEY or TICKETMASTER_API_KEY in .env')
  }

  console.log('[yelp] searching for niche finds across zones...')
  const yelp = await fetchYelpNicheFinds(yelpKey)
  console.log(`  ${yelp.length} unique (★≥4.5 · 10–300 reviews · open)`)

  console.log(
    `[ticketmaster] events within ${TM_RADIUS_MI} mi · next ${TM_DAYS_AHEAD} days...`,
  )
  const tm = await fetchTicketmasterEvents(tmKey)
  console.log(`  ${tm.length} events`)

  const out = {
    fetchedAt: new Date().toISOString(),
    sources: {
      yelp: { zones: YELP_ZONES.map(([z, a]) => `${z} ${a}`), categories: YELP_CATEGORIES },
      ticketmaster: { center: PALO_ALTO_LATLNG, radiusMi: TM_RADIUS_MI, daysAhead: TM_DAYS_AHEAD },
    },
    yelp,
    ticketmaster: tm,
  }

  const dir = join(dirname(fileURLToPath(import.meta.url)), '.cache')
  await mkdir(dir, { recursive: true })
  const path = join(dir, 'discover-candidates.json')
  await writeFile(path, JSON.stringify(out, null, 2))

  console.log(`\n✅ ${yelp.length} yelp + ${tm.length} ticketmaster\n   → ${path}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
