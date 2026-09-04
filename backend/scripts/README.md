# MUL Data Generator

Regenerates the normalized MulBtlScraper snapshot
(`backend/src/main/resources/scraper/mul-units.json`) from the live Master
Unit List site (`masterunitlist.battletech.com`).

## Why a browser?

The MUL site is behind a Cloudflare JS challenge, so plain HTTP clients
(`fetch`, `axios`, Jsoup) are blocked with a 403. This script drives a real
browser through [Playwright](https://playwright.dev/) to fetch the manifest and
the static `/data/*.json` bundles it references, then normalizes the raw records into
the shape the backend expects.

The Cloudflare challenge detects headless Chromium, so the script launches a
**visible headed browser** by default (which passes the challenge) and waits a
few seconds for it to clear. Headless mode is available with `--headless` but
may still be blocked.

## Requirements

- Node.js 18+
- Playwright (installed locally in this folder via `npm install`)

## Setup (one time)

```powershell
cd backend\scripts
npm install
```

## Usage

```powershell
cd backend\scripts

# Default: writes backend/src/main/resources/scraper/mul-units.json
node gen_mul_data.js

# Write to a custom path (useful to diff before overwriting)
node gen_mul_data.js --out ./mul-units.new.json
node gen_mul_data.js --out ./mul-units.new.json --headless
```

Or via the local npm script:

```powershell
npm run generate
```

## What it fetches

- `/data/manifest.json` — file list and `unit_keys` map
- `units.<hash>.json` — the full compact unit table
- Static vocabulary files (`unit_types`, `unit_sub_types`, `roles`, `technologies`, `abilities`) to map compact numeric IDs into readable names and ability codes.
- `https://db.mekbay.com/units.json` — open database for verified Alpha Strike stats (`as.SZ`), with deterministic BattleTech Alpha Strike tonnage-based rule fallback.

## Output shape

```json
{
  "total": 8713,
  "units": [
    {
      "id": "000RM4HYJ9",
      "slug": "black-knight-bl-7-knt",
      "name": "BL-7-KNT",
      "model": "Black Knight",
      "type": "BattleMech",
      "subType": "Standard BattleMech",
      "techBase": "Inner Sphere",
      "role": "Brawler",
      "tonnage": 75,
      "pv": 34,
      "bv": 1443,
      "introYear": 2809,
      "asSize": 3,
      "abilities": ["ENE"]
    }
  ]
}
```

After regenerating, commit the updated `mul-units.json` — it is checked into
version control and served from the classpath by `MulBtlScraper`.
