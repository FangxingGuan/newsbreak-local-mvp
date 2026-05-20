// Build-time data snapshot.
// Calls real APIs with the keys in .env and writes src/feed.generated.json.
// The app imports that JSON, so the deployed site stays fully static — no
// backend, no keys in the browser.
//
//   node scripts/snapshot.mjs        (or: npm run snapshot)
//
// Source → vertical mapping:
//   Yelp Fusion          → dining   (restaurants)
//   Google Places (New)  → family   (museums / parks / kid spots)
//   Ticketmaster         → weekend  (events)
//   Amadeus              → weekend  (tours & activities)

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// Load .env if present (Node 22+). Otherwise rely on the real environment.
try {
  process.loadEnvFile(join(ROOT, '.env'))
} catch {
  /* no .env file — keys may still come from the shell environment */
}

const LOCATION = 'Palo Alto, CA'
const PA = { lat: 37.4419, lng: -122.143 } // Palo Alto, CA center
const SF = { lat: 37.7749, lng: -122.4194 } // San Francisco (Amadeus fallback)

const INTENT = { dining: '策划一次约会', weekend: '规划这个周末', family: '安排家庭日' }

// Gradient covers — used as a fallback when an item has no photo.
const COVERS = [
  'linear-gradient(135deg,#ff7a59,#ef2d56)',
  'linear-gradient(135deg,#f9a826,#e8112d)',
  'linear-gradient(135deg,#b06ab3,#4568dc)',
  'linear-gradient(135deg,#2193b0,#6dd5ed)',
  'linear-gradient(135deg,#56ab2f,#a8e063)',
  'linear-gradient(135deg,#3a1c71,#d76d77)',
  'linear-gradient(135deg,#f7971e,#ffd200)',
  'linear-gradient(135deg,#11998e,#38ef7d)',
  'linear-gradient(135deg,#ee0979,#ff6a00)',
]
let coverSeq = 0
const nextCover = () => COVERS[coverSeq++ % COVERS.length]

/** Great-circle distance from Palo Alto, formatted as "X.X mi". */
function miles(lat, lng) {
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return ''
  const R = 3958.8
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat - PA.lat)
  const dLng = toRad(lng - PA.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(PA.lat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2
  return `${(2 * R * Math.asin(Math.sqrt(a))).toFixed(1)} mi`
}

const stripHtml = (s = '') =>
  s.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()

// ---- emoji pickers --------------------------------------------------------

const YELP_EMOJI = {
  italian: '🍝', pizza: '🍕', ramen: '🍜', japanese: '🍣', sushi: '🍣',
  wine_bars: '🍷', cocktailbars: '🍸', bars: '🍸', bbq: '🍖', mexican: '🌮',
  french: '🥐', cafes: '☕️', breakfast_brunch: '🥞', seafood: '🦞',
  steak: '🥩', indpak: '🍛', thai: '🍜', chinese: '🥡', korean: '🍲',
  newamerican: '🍽️', tradamerican: '🍔', vegan: '🥗', mediterranean: '🥙',
  desserts: '🍰', vietnamese: '🍲', spanish: '🥘', greek: '🥙',
}
const emojiYelp = (cats) => {
  for (const c of cats) if (YELP_EMOJI[c.alias]) return YELP_EMOJI[c.alias]
  return '🍽️'
}

const SEGMENT_EMOJI = {
  Music: '🎵', Sports: '🏟️', 'Arts & Theatre': '🎭', Film: '🎬',
  Miscellaneous: '🎟️',
}
const emojiSegment = (seg) => SEGMENT_EMOJI[seg] || '🎟️'

const TYPE_NICE = {
  museum: 'Museum', park: 'Park', zoo: 'Zoo', aquarium: 'Aquarium',
  amusement_park: 'Amusement Park', library: 'Library',
  art_gallery: 'Art Gallery', tourist_attraction: 'Attraction',
  playground: 'Playground', national_park: 'Nature Preserve',
  garden: 'Garden', hiking_area: 'Trail',
}
const TYPE_EMOJI = {
  museum: '🏛️', park: '🌳', zoo: '🦁', aquarium: '🐠',
  amusement_park: '🎡', library: '📚', art_gallery: '🎨',
  playground: '🛝', garden: '🌷', hiking_area: '🥾',
}
const emojiPlace = (types) => {
  for (const t of types) if (TYPE_EMOJI[t]) return TYPE_EMOJI[t]
  return '🧸'
}

const GP_PRICE = {
  PRICE_LEVEL_FREE: '免费',
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
}

const uniq = (arr) => [...new Set(arr.filter(Boolean))]

// ---- Yelp Fusion → dining -------------------------------------------------

async function fromYelp() {
  const key = process.env.YELP_API_KEY
  if (!key) return skip('Yelp Fusion', 'YELP_API_KEY')
  const url = new URL('https://api.yelp.com/v3/businesses/search')
  url.searchParams.set('location', LOCATION)
  url.searchParams.set('term', 'date night restaurant')
  url.searchParams.set('categories', 'restaurants')
  url.searchParams.set('sort_by', 'best_match')
  url.searchParams.set('limit', '12')
  const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } })
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${(await res.text()).slice(0, 160)}`)
  const { businesses = [] } = await res.json()
  return businesses.slice(0, 7).map((b) => {
    const cats = b.categories || []
    const titles = cats.map((c) => c.title)
    return {
      id: `yelp-${b.id}`,
      vertical: 'dining',
      kind: '地点',
      title: b.name,
      category: titles.slice(0, 2).join(' · ') || 'Restaurant',
      emoji: emojiYelp(cats),
      cover: nextCover(),
      image: b.image_url || undefined,
      neighborhood: b.location?.city || 'Palo Alto',
      distance: miles(b.coordinates?.latitude, b.coordinates?.longitude),
      rating: typeof b.rating === 'number' ? b.rating : undefined,
      price: b.price || '',
      blurb: `${titles.join(' · ') || '本地热门'} · Yelp ${b.rating ?? '–'}★ · ${b.review_count ?? 0} 条评价`,
      tags: titles.slice(0, 3),
      intentLabel: INTENT.dining,
    }
  })
}

// ---- Google Places (New) → family ----------------------------------------

async function fromGooglePlaces() {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return skip('Google Places', 'GOOGLE_PLACES_API_KEY')
  const queries = [
    "children's museum near Palo Alto, CA",
    'family-friendly park in Palo Alto, CA',
    'kid activities near Palo Alto, CA',
  ]
  const seen = new Set()
  const places = []
  for (const textQuery of queries) {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.rating,places.userRatingCount,' +
          'places.priceLevel,places.formattedAddress,places.location,' +
          'places.types,places.editorialSummary',
      },
      body: JSON.stringify({ textQuery, maxResultCount: 6 }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${(await res.text()).slice(0, 160)}`)
    const { places: got = [] } = await res.json()
    for (const p of got) {
      if (!seen.has(p.id)) {
        seen.add(p.id)
        places.push(p)
      }
    }
  }
  return places.slice(0, 7).map((p) => {
    const types = p.types || []
    const nice = uniq(types.map((t) => TYPE_NICE[t]))
    const city = (p.formattedAddress || '').split(', ')[1] || 'Palo Alto'
    return {
      id: `gp-${p.id}`,
      vertical: 'family',
      kind: '地点',
      title: p.displayName?.text || 'Family Spot',
      category: nice[0] || 'Family Spot',
      emoji: emojiPlace(types),
      cover: nextCover(),
      image: undefined, // Google photos need a keyed URL — keep gradient covers
      neighborhood: city,
      distance: miles(p.location?.latitude, p.location?.longitude),
      rating: typeof p.rating === 'number' ? p.rating : undefined,
      price: GP_PRICE[p.priceLevel] || '',
      blurb:
        p.editorialSummary?.text ||
        `${nice.join(' · ') || '亲子友好场所'} · Google ${p.rating ?? '–'}★ · ${p.userRatingCount ?? 0} 条评价`,
      tags: nice.slice(0, 3),
      intentLabel: INTENT.family,
    }
  })
}

// ---- Ticketmaster Discovery → weekend -------------------------------------

function pickImage(images) {
  const wide = images
    .filter((i) => i.ratio === '16_9' && i.width >= 600)
    .sort((a, b) => a.width - b.width)
  return (wide[0] || images.sort((a, b) => (b.width || 0) - (a.width || 0))[0])?.url
}

async function fromTicketmaster() {
  const key = process.env.TICKETMASTER_API_KEY
  if (!key) return skip('Ticketmaster', 'TICKETMASTER_API_KEY')
  const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
  url.searchParams.set('apikey', key)
  url.searchParams.set('latlong', `${PA.lat},${PA.lng}`)
  url.searchParams.set('radius', '35')
  url.searchParams.set('unit', 'miles')
  url.searchParams.set('sort', 'date,asc')
  url.searchParams.set('size', '24')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${(await res.text()).slice(0, 160)}`)
  const data = await res.json()
  const events = data?._embedded?.events || []
  const seen = new Set()
  const out = []
  for (const e of events) {
    if (seen.has(e.name)) continue
    seen.add(e.name)
    const venue = e._embedded?.venues?.[0]
    const seg = e.classifications?.[0]?.segment?.name
    let genre = e.classifications?.[0]?.genre?.name
    if (genre === 'Undefined') genre = undefined
    const date = e.dates?.start?.localDate || ''
    const pr = e.priceRanges?.[0]
    out.push({
      id: `tm-${e.id}`,
      vertical: 'weekend',
      kind: '活动',
      title: e.name,
      category: uniq([seg, date]).join(' · ') || 'Event',
      emoji: emojiSegment(seg),
      cover: nextCover(),
      image: pickImage(e.images || []) || undefined,
      neighborhood: venue?.city?.name || 'Bay Area',
      distance: miles(
        Number(venue?.location?.latitude),
        Number(venue?.location?.longitude),
      ),
      rating: undefined,
      price: pr ? `$${Math.round(pr.min)}+` : '门票',
      blurb: uniq([genre || seg, venue?.name, date && `${date} 开演`]).join(' · '),
      tags: uniq([seg, genre, venue?.city?.name]).slice(0, 3),
      intentLabel: INTENT.weekend,
    })
    if (out.length >= 7) break
  }
  return out
}

// ---- Amadeus → weekend (tours & activities) -------------------------------

async function fromAmadeus() {
  const id = process.env.AMADEUS_CLIENT_ID
  const secret = process.env.AMADEUS_CLIENT_SECRET
  if (!id || !secret) return skip('Amadeus', 'AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET')
  const host = process.env.AMADEUS_HOSTNAME || 'test.api.amadeus.com'

  const tokRes = await fetch(`https://${host}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: id,
      client_secret: secret,
    }),
  })
  if (!tokRes.ok) throw new Error(`token HTTP ${tokRes.status} — ${(await tokRes.text()).slice(0, 160)}`)
  const { access_token } = await tokRes.json()

  const fetchActivities = async (lat, lng, radius) => {
    const u = new URL(`https://${host}/v1/shopping/activities`)
    u.searchParams.set('latitude', String(lat))
    u.searchParams.set('longitude', String(lng))
    u.searchParams.set('radius', String(radius))
    const r = await fetch(u, { headers: { Authorization: `Bearer ${access_token}` } })
    if (!r.ok) return []
    return (await r.json()).data || []
  }

  let acts = await fetchActivities(PA.lat, PA.lng, 20)
  // Amadeus test data is sparse — fall back to SF (a realistic weekend trip).
  if (acts.length < 3) acts = acts.concat(await fetchActivities(SF.lat, SF.lng, 6))
  const seen = new Set()
  acts = acts.filter((a) => a?.id && !seen.has(a.id) && seen.add(a.id))

  return acts.slice(0, 4).map((a) => ({
    id: `amadeus-${a.id}`,
    vertical: 'weekend',
    kind: '活动',
    title: a.name,
    category: 'Tours & Activities',
    emoji: '🎟️',
    cover: nextCover(),
    image: a.pictures?.[0] || undefined,
    neighborhood: 'Bay Area',
    distance: miles(Number(a.geoCode?.latitude), Number(a.geoCode?.longitude)),
    rating: a.rating ? Number(a.rating) : undefined,
    price: a.price?.amount ? `$${Math.round(Number(a.price.amount))}` : '',
    blurb: (stripHtml(a.shortDescription || a.description) || '本地体验项目').slice(0, 130),
    tags: ['Tours & Activities'],
    intentLabel: INTENT.weekend,
  }))
}

function skip(name, missing) {
  console.warn(`· ${name}: 跳过(缺少 ${missing})`)
  return []
}

// ---- run ------------------------------------------------------------------

async function run() {
  console.log(`📍 抓取 ${LOCATION} 的真实本地数据…\n`)
  const sources = [
    ['Yelp Fusion', fromYelp],
    ['Google Places', fromGooglePlaces],
    ['Ticketmaster', fromTicketmaster],
    ['Amadeus', fromAmadeus],
  ]
  const items = []
  for (const [name, fn] of sources) {
    try {
      const got = await fn()
      if (got.length) console.log(`✓ ${name}: ${got.length} 条`)
      items.push(...got)
    } catch (e) {
      console.warn(`✗ ${name}: ${e.message}`)
    }
  }

  // De-duplicate by title within each vertical.
  const seen = new Set()
  const out = []
  for (const it of items) {
    const k = `${it.vertical}|${it.title.toLowerCase()}`
    if (seen.has(k)) continue
    seen.add(k)
    out.push(it)
  }

  const payload = { generatedAt: new Date().toISOString(), location: LOCATION, items: out }
  writeFileSync(
    join(ROOT, 'src/feed.generated.json'),
    JSON.stringify(payload, null, 2) + '\n',
  )

  const n = (v) => out.filter((i) => i.vertical === v).length
  console.log(
    `\n✅ 写入 src/feed.generated.json — 共 ${out.length} 条` +
      ` (约会聚餐 ${n('dining')} · 周末 ${n('weekend')} · 家庭 ${n('family')})`,
  )
  if (!out.length) {
    console.log('⚠️  未抓到任何数据 — demo 将回退到内置示例数据。请检查 .env 中的密钥。')
  }
}

run()
