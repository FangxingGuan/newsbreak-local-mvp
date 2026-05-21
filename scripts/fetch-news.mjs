// Local-news fetch step of the article pipeline.
//
// Pulls local news from two sources and merges them into one deduped set:
//   1. NewsBreak local feed — across the 8 priority Bay Area zipcodes
//   2. Eater SF — Bay Area food-news RSS (POI-dense: openings, closings,
//      dining reports — almost every item carries a go-there intent)
//
// Dedup is by docid first, then by normalised title — so the same story
// surfaced under different ids, different zips, or different feeds collapses
// to one. HTML is stripped from article bodies. The unique set is written to
// scripts/.cache/news-feed-latest.json.
//
// It does NOT decide which articles are decision-driving and does NOT touch
// the demo — that judgement, the POI enrichment and the data.ts update are
// done by Claude at review time, only after the user confirms.
//
//   node scripts/fetch-news.mjs

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ZIPS = {
  '94110': 'SF Mission',
  '94133': 'SF North Beach',
  '94607': 'Oakland Jack London',
  '94709': 'Berkeley Gourmet Ghetto',
  '95113': 'San Jose Downtown',
  '94041': 'Mountain View Castro St',
  '94301': 'Palo Alto University Ave',
  '94063': 'Redwood City Downtown',
}

const NEWSBREAK_API =
  'http://server-eks-feed.k8s.nb-prod.com/Website/channel/news-list-for-channel'
const EATER_SF_RSS = 'https://sf.eater.com/rss/index.xml'

const stripHtml = (s) =>
  (s || '')
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()

/** Normalised title — lowercase, alphanumerics only — for cross-source dedup. */
const normTitle = (s) =>
  (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

// ---- Source 1: NewsBreak local feed ----------------------------------------

async function fetchNewsBreakZip(zip) {
  const url =
    `${NEWSBREAK_API}?channel_id=k1174&zip=${zip}&cstart=0&cend=15` +
    `&infinite=true&newfeed=true&platform=0&__hipu__test__=-1`
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
  if (!res.ok) throw new Error(`zip ${zip}: HTTP ${res.status}`)
  const data = await res.json()
  return (data.result || [])
    .filter((x) => x.ctype === 'news')
    .map((x) => ({
      feed: 'newsbreak',
      docid: x.docid || x.url || x.original_url,
      title: x.title,
      url: x.original_url || x.url,
      source: x.source,
      city: x.city_name || '',
      isLocalNews: x.is_local_news,
      category: x.unified_category || '',
      date: x.date_str || x.date || '',
      summary: x.summary || '',
      content: stripHtml(x.content),
      zips: [zip],
    }))
}

// ---- Source 2: Eater SF (Atom RSS) -----------------------------------------

const tag = (entry, name) => {
  const m = entry.match(
    new RegExp(`<${name}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${name}>`),
  )
  return m ? m[1] : ''
}

async function fetchEaterSF() {
  const res = await fetch(EATER_SF_RSS, {
    headers: { 'User-Agent': 'Mozilla/5.0 (NewsBreak Local MVP pipeline)' },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error(`Eater SF: HTTP ${res.status}`)
  const xml = await res.text()
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || []
  return entries.map((e) => {
    const link = e.match(/<link rel="alternate"[^>]*href="([^"]+)"/)
    const id = e.match(/<id>([^<]+)<\/id>/)
    const published = e.match(/<published>([^<]+)<\/published>/)
    const term = e.match(/<category[^>]*term="([^"]+)"/)
    const body = tag(e, 'content') || tag(e, 'summary')
    return {
      feed: 'eater-sf',
      docid: (id && id[1]) || (link && link[1]),
      title: tag(e, 'title'),
      url: link ? link[1] : '',
      source: 'Eater SF',
      city: '',
      isLocalNews: true,
      category: term ? term[1] : '',
      date: published ? published[1] : '',
      summary: stripHtml(body).slice(0, 400),
      content: stripHtml(body),
      zips: [],
    }
  })
}

// ---- Merge + dedup ----------------------------------------------------------

async function main() {
  const collected = []

  for (const [zip, area] of Object.entries(ZIPS)) {
    try {
      const items = await fetchNewsBreakZip(zip)
      console.log(`  [newsbreak] ${zip} ${area}: ${items.length} news items`)
      collected.push(...items)
    } catch (e) {
      console.error(`  ⚠️  [newsbreak] ${zip} ${area}: ${e.message}`)
    }
  }

  try {
    const items = await fetchEaterSF()
    console.log(`  [eater-sf]  ${items.length} food-news items`)
    collected.push(...items)
  } catch (e) {
    console.error(`  ⚠️  [eater-sf] ${e.message}`)
  }

  const byDocid = new Map()
  const byTitle = new Map()
  let dupDocid = 0
  let dupTitle = 0

  for (const x of collected) {
    const title = normTitle(x.title)

    // Dedup pass 1 — docid.
    if (byDocid.has(x.docid)) {
      const e = byDocid.get(x.docid)
      e.zips.push(...x.zips)
      dupDocid++
      continue
    }
    // Dedup pass 2 — normalised title (same story, different docid or feed).
    if (title && byTitle.has(title)) {
      const e = byTitle.get(title)
      e.zips.push(...x.zips)
      if (!e.alsoIn?.includes(x.feed))
        e.alsoIn = [...(e.alsoIn || []), x.feed]
      dupTitle++
      continue
    }

    byDocid.set(x.docid, x)
    if (title) byTitle.set(title, x)
  }

  const items = [...byDocid.values()]
  const byFeed = items.reduce((a, x) => ((a[x.feed] = (a[x.feed] || 0) + 1), a), {})
  const out = {
    fetchedAt: new Date().toISOString(),
    sources: { newsbreakZips: ZIPS, eaterSf: EATER_SF_RSS },
    counts: {
      unique: items.length,
      byFeed,
      dedupedByDocid: dupDocid,
      dedupedByTitle: dupTitle,
    },
    items,
  }

  const dir = join(dirname(fileURLToPath(import.meta.url)), '.cache')
  await mkdir(dir, { recursive: true })
  const path = join(dir, 'news-feed-latest.json')
  await writeFile(path, JSON.stringify(out, null, 2))

  console.log(
    `\n✅ ${items.length} unique items ` +
      `(${JSON.stringify(byFeed)}; ${dupDocid} dupes by docid, ` +
      `${dupTitle} by title)\n   → ${path}`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
