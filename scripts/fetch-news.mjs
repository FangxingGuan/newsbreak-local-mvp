// Local-news fetch step of the article pipeline.
//
// Pulls the NewsBreak local feed across the 8 priority Bay Area zipcodes,
// dedupes (by docid first, then by normalised title — so the same story
// surfaced under different ids in different zips collapses to one), strips
// HTML from the article body, and writes the unique set to
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

const API = 'http://server-eks-feed.k8s.nb-prod.com/Website/channel/news-list-for-channel'

const stripHtml = (s) =>
  (s || '')
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Normalised title — lowercase, alphanumerics only — for cross-zip dedup. */
const normTitle = (s) =>
  (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

async function fetchZip(zip) {
  const url = `${API}?channel_id=k1174&zip=${zip}&cstart=0&cend=15&infinite=true&newfeed=true&platform=0&__hipu__test__=-1`
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
  if (!res.ok) throw new Error(`zip ${zip}: HTTP ${res.status}`)
  const data = await res.json()
  return (data.result || []).filter((x) => x.ctype === 'news')
}

async function main() {
  const byDocid = new Map()
  const byTitle = new Map()
  let dupDocid = 0
  let dupTitle = 0

  for (const [zip, area] of Object.entries(ZIPS)) {
    let news
    try {
      news = await fetchZip(zip)
    } catch (e) {
      console.error(`  ⚠️  ${zip} ${area}: ${e.message}`)
      continue
    }
    console.log(`  ${zip} ${area}: ${news.length} news items`)

    for (const x of news) {
      const docid = x.docid || x.url || x.original_url
      const title = normTitle(x.title)

      // Dedup pass 1 — docid.
      if (byDocid.has(docid)) {
        byDocid.get(docid).zips.push(zip)
        dupDocid++
        continue
      }
      // Dedup pass 2 — normalised title (same story, different docid).
      if (title && byTitle.has(title)) {
        byTitle.get(title).zips.push(zip)
        dupTitle++
        continue
      }

      const entry = {
        docid,
        title: x.title,
        url: x.original_url || x.url,
        source: x.source,
        city: x.city_name,
        isLocalNews: x.is_local_news,
        category: x.unified_category,
        date: x.date_str || x.date,
        summary: x.summary || '',
        content: stripHtml(x.content),
        zips: [zip],
      }
      byDocid.set(docid, entry)
      if (title) byTitle.set(title, entry)
    }
  }

  const items = [...byDocid.values()]
  const out = {
    fetchedAt: new Date().toISOString(),
    zipcodes: ZIPS,
    counts: {
      unique: items.length,
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
      `(${dupDocid} dupes by docid, ${dupTitle} by title)\n   → ${path}`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
