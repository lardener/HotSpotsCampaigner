#!/usr/bin/env node
/*
 * HotSpots Campaigner - Battletech Mercenaries campaign management SaaS.
 * Copyright (C) 2026 Jose Ferrer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Fetches live data from the Master Unit List site
 * (masterunitlist.battletech.com) and generates a normalized
 * mul-units.json snapshot for the backend scraper.
 *
 * The site is behind a Cloudflare JS challenge, so plain HTTP (fetch/axios)
 * returns 403. We drive a real browser via Playwright to fetch:
 *   1. /data/manifest.json (data bundle manifest)
 *   2. /data/<units-file>.json (compact unit records)
 *   3. Vocabulary bundles: unit_types, unit_sub_types, technologies, roles, abilities
 *
 * Alpha Strike sizes (`asSize`) are resolved by cross-referencing MekBay's
 * open database (https://db.mekbay.com/units.json) and falling back to
 * deterministic BattleTech Alpha Strike tonnage-based rules.
 *
 * Usage:
 *   node gen_mul_data.js [--out <path>] [--headless]
 *
 * Defaults:
 *   --out  backend/src/main/resources/scraper/mul-units.json
 */

const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const SITE_URL = 'https://masterunitlist.battletech.com'
const DATA_PREFIX = '/data/'
const MEKBAY_DB_URL = 'https://db.mekbay.com/units.json'

const DEFAULT_OUT = path.resolve(
  __dirname,
  '..',
  'src',
  'main',
  'resources',
  'scraper',
  'mul-units.json',
)

function parseArgs(argv) {
  const opts = { out: DEFAULT_OUT, headless: false }
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--out' || arg === '-o') {
      opts.out = argv[++i]
    } else if (arg.startsWith('--out=')) {
      opts.out = arg.split('=')[1]
    } else if (arg === '--headless') {
      opts.headless = true
    }
  }
  return opts
}

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Fetch a JSON document through the browser page context (so Cloudflare's
 * challenge is satisfied), returning {ok, status, json|null, text}.
 */
async function fetchJson(page, urlPath, retries = 3) {
  const fullUrl = urlPath.startsWith('http') ? urlPath : SITE_URL + urlPath
  let last
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      const delay = 1000 * Math.pow(2, attempt - 1)
      console.log(`  retry ${attempt}/${retries} for ${urlPath} after ${delay}ms...`)
      await new Promise((r) => setTimeout(r, delay))
    }
    const result = await page.evaluate(
      async (payload) => {
        const { url } = payload
        try {
          const resp = await fetch(url, {
            headers: {
              Accept: 'application/json,text/plain,*/*',
              'Accept-Language': 'en-US,en;q=0.9',
            },
          })
          const text = await resp.text()
          let json = null
          try {
            json = JSON.parse(text)
          } catch (e) {
            json = null
          }
          return { ok: resp.ok, status: resp.status, text, json }
        } catch (e) {
          return { ok: false, status: 0, text: String(e && e.message ? e.message : e), json: null }
        }
      },
      { url: fullUrl },
    )
    last = result
    if (result.ok && result.json) {
      return result
    }
  }
  return last
}

/**
 * Fetch MekBay units database to cross-reference verified Alpha Strike sizes.
 */
async function fetchMekbayDatabase() {
  try {
    console.log(`Fetching MekBay database from ${MEKBAY_DB_URL} ...`)
    const resp = await fetch(MEKBAY_DB_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    })
    if (!resp.ok) {
      console.warn(`MekBay database fetch returned HTTP ${resp.status}; skipping MekBay cross-ref.`)
      return null
    }
    const data = await resp.json()
    console.log(`Loaded ${data.units?.length || 0} units from MekBay database.`)
    return data
  } catch (err) {
    console.warn('Failed to fetch MekBay database:', err.message)
    return null
  }
}

/**
 * Deterministically calculate Alpha Strike Size based on official BT rules.
 */
function deriveAlphaStrikeSize(type, ton) {
  if (ton === null || ton === undefined || !Number.isFinite(ton)) return null
  const t = (type || '').toLowerCase()

  // 'Mechs
  if (t.includes('battlemech') || t.includes('industrialmech')) {
    if (ton <= 35) return 1
    if (ton <= 55) return 2
    if (ton <= 75) return 3
    if (ton <= 100) return 4
    return 5 // Superheavy
  }

  // Vehicles
  if (t.includes('vehicle') || t.includes('tank')) {
    if (ton <= 39) return 1
    if (ton <= 59) return 2
    if (ton <= 79) return 3
    if (ton <= 100) return 4
    return 5
  }

  // Small craft / Infantry
  if (t.includes('protomech') || t.includes('battle armor') || t.includes('infantry')) {
    return 1
  }

  // Fighters / Aerospace
  if (t.includes('fighter')) {
    if (ton <= 45) return 1
    if (ton <= 70) return 2
    return 3
  }
  if (t.includes('aerospace') || t.includes('craft') || t.includes('dropship') || t.includes('warship')) {
    if (ton <= 500) return 3
    return 4
  }

  // Buildings / Structures
  if (t.includes('building') || t.includes('structure')) {
    return ton > 100 ? 5 : 4
  }

  return 1
}

async function main() {
  const startTime = Date.now()
  const opts = parseArgs(process.argv)
  const headless = opts.headless === true || process.argv.includes('--headless')

  console.log(`Launching Chromium (Playwright) headless=${headless} ...`)
  const browser = await chromium.launch({
    headless,
    args: ['--disable-blink-features=AutomationControlled'],
  })
  const page = await browser.newPage({
    viewport: { width: 1366, height: 768 },
  })
  page.setDefaultTimeout(30000)

  try {
    // 1) Load site once to satisfy Cloudflare challenge
    console.log(`Navigating to ${SITE_URL}/ ...`)
    await page.goto(`${SITE_URL}/`, { waitUntil: 'domcontentloaded' })
    console.log('Waiting for Cloudflare verification...')
    await page.waitForTimeout(10000)

    // 2) Manifest
    console.log('Fetching manifest.json ...')
    const manRes = await fetchJson(page, `${DATA_PREFIX}manifest.json`)
    if (!manRes.ok || !manRes.json || !manRes.json.files) {
      console.error(`Failed to load manifest (status=${manRes.status}). Cannot proceed.`)
      process.exit(1)
    }
    const manifest = manRes.json
    console.log(`Manifest loaded. Version: ${manifest.version ?? 'unknown'}`)

    // 3) Vocabulary bundles
    console.log('Fetching vocabulary bundles...')
    const vocabSpecs = [
      { key: 'unit_types', file: manifest.files.unit_types },
      { key: 'unit_sub_types', file: manifest.files.unit_sub_types },
      { key: 'technologies', file: manifest.files.technologies },
      { key: 'roles', file: manifest.files.roles },
      { key: 'abilities', file: manifest.files.abilities },
    ]

    const vocabs = {}
    for (const spec of vocabSpecs) {
      if (!spec.file) {
        console.warn(`  Manifest missing file entry for ${spec.key}`)
        vocabs[spec.key] = []
        continue
      }
      const res = await fetchJson(page, `${DATA_PREFIX}${spec.file}`)
      if (res.ok && Array.isArray(res.json)) {
        vocabs[spec.key] = res.json
        console.log(`  Loaded ${spec.key}: ${res.json.length} items`)
      } else {
        console.warn(`  Failed to load ${spec.key} from ${spec.file} (status=${res.status})`)
        vocabs[spec.key] = []
      }
    }

    // Build lookup maps for vocabulary IDs
    const unitTypesMap = new Map(vocabs.unit_types.map((x) => [x.id, x.name]))
    const unitSubTypesMap = new Map(vocabs.unit_sub_types.map((x) => [x.id, x.name]))
    const technologiesMap = new Map(vocabs.technologies.map((x) => [x.id, x.name]))
    const rolesMap = new Map(vocabs.roles.map((x) => [x.id, x.name]))
    const abilitiesMap = new Map(vocabs.abilities.map((x) => [x.id, x.code || x.name]))

    // 4) Units index file
    const unitsFileName = manifest.files.units
    console.log(`Fetching units index: ${unitsFileName} ...`)
    const unitsRes = await fetchJson(page, `${DATA_PREFIX}${unitsFileName}`)
    if (!unitsRes.ok || !unitsRes.json) {
      console.error(`Failed to load units index (status=${unitsRes.status}). Cannot proceed.`)
      process.exit(1)
    }
    const unitsData = Array.isArray(unitsRes.json)
      ? unitsRes.json
      : Array.isArray(unitsRes.json.units)
        ? unitsRes.json.units
        : []
    console.log(`Loaded ${unitsData.length} compact unit records.`)

    // 5) MekBay database (for Alpha Strike SZ cross-referencing)
    const mekbayData = await fetchMekbayDatabase()
    const mekbaySizeBySlug = new Map()
    const mekbaySizeByNameModel = new Map()

    if (mekbayData && Array.isArray(mekbayData.units)) {
      for (const mu of mekbayData.units) {
        const sz = mu.as?.SZ
        if (sz !== undefined && sz !== null && Number.isFinite(sz) && sz > 0) {
          const ch = mu.chassis || ''
          const md = mu.model || ''
          const slug = slugify([ch, md].filter(Boolean).join(' '))
          if (slug) mekbaySizeBySlug.set(slug, sz)
          const nameKey = `${ch.trim().toLowerCase()}|${md.trim().toLowerCase()}`
          mekbaySizeByNameModel.set(nameKey, sz)
        }
      }
      console.log(`Indexed ${mekbaySizeBySlug.size} unit sizes from MekBay.`)
    }

    // 6) Normalize all units using vocabularies & AS size lookup
    console.log('Normalizing units...')
    const normalized = []
    let derivedSizeCount = 0
    let mekbaySizeCount = 0

    for (const u of unitsData) {
      const id = u.id || u.public_uid || ''
      const chassis = (u.n || u.name || '').trim()
      const variant = (u.m || u.model || '').trim()
      const slug = slugify([chassis, variant].filter(Boolean).join(' ') || id)

      const type = unitTypesMap.get(u.t) || (u.t ? String(u.t) : 'BattleMech')
      const subType = unitSubTypesMap.get(u.st) || (u.st ? String(u.st) : '')
      const techBase = technologiesMap.get(u.te) || null
      const role = rolesMap.get(u.r) || (u.r ? String(u.r) : 'None')

      const tonnage = Number.isFinite(parseInt(u.ton, 10)) ? parseInt(u.ton, 10) : null
      const pv = Number.isFinite(parseInt(u.pv, 10)) ? parseInt(u.pv, 10) : null
      const bv = Number.isFinite(parseInt(u.bv, 10)) ? parseInt(u.bv, 10) : null
      const introYear = Number.isFinite(parseInt(u.iy, 10)) ? parseInt(u.iy, 10) : null

      // Resolve abilities
      let abilities = []
      if (Array.isArray(u.ab)) {
        abilities = u.ab.map((aid) => abilitiesMap.get(aid) || aid)
      } else if (u.ab !== undefined && u.ab !== null) {
        abilities = [abilitiesMap.get(u.ab) || u.ab]
      }

      // Resolve Alpha Strike size: MekBay exact match -> BT rule derivation
      let asSize = mekbaySizeBySlug.get(slug)
      if (asSize === undefined || asSize === null) {
        const nameKey = `${chassis.toLowerCase()}|${variant.toLowerCase()}`
        asSize = mekbaySizeByNameModel.get(nameKey)
      }

      if (asSize !== undefined && asSize !== null && asSize > 0) {
        mekbaySizeCount++
      } else {
        asSize = deriveAlphaStrikeSize(type, tonnage)
        if (asSize !== null) derivedSizeCount++
      }

      normalized.push({
        id,
        slug,
        name: variant,
        model: chassis,
        type,
        subType,
        techBase,
        role,
        tonnage,
        pv,
        bv,
        introYear,
        asSize,
        abilities,
      })
    }

    // Sort deterministically by id
    normalized.sort((a, b) => String(a.id).localeCompare(String(b.id)))

    const out = {
      total: normalized.length,
      units: normalized,
    }

    const outPath = opts.out
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8')

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`\nSUCCESS: Generated ${normalized.length} units in ${elapsed}s`)
    console.log(`Output: ${outPath} (${(fs.statSync(outPath).size / (1024 * 1024)).toFixed(2)} MB)`)
    console.log(`Alpha Strike sizes: ${mekbaySizeCount} from MekBay, ${derivedSizeCount} derived from BT rules.`)

    // Quick sanity checks
    const missingTech = normalized.filter((u) => !u.techBase).length
    const missingSize = normalized.filter((u) => u.asSize === null).length
    console.log(`Tech base missing: ${missingTech}/${normalized.length}`)
    console.log(`AS size missing: ${missingSize}/${normalized.length}`)
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error('gen_mul_data.js failed:', err)
  process.exit(1)
})
