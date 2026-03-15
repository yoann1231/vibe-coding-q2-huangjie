import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const AMAZON_MOVERS_URL = "https://www.amazon.com/gp/movers-and-shakers";

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function toKeyword(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
    .join(" ");
}

function titleFromHref(rawHref) {
  const url = rawHref.startsWith("http") ? rawHref : `https://www.amazon.com${rawHref}`;
  const path = new URL(url).pathname;
  const slugMatch = path.match(/\/([^/]+)\/dp\/[A-Z0-9]{10}/);
  if (!slugMatch) return "";
  return decodeURIComponent(slugMatch[1].replace(/[-_]+/g, " ")).trim();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function scoreFromGrowth(growthPercent) {
  const base = 60 + growthPercent / 5;
  return Math.round(clamp(base, 60, 99));
}

export function parseAmazonMoversHtml(html, limit = 20) {
  const anchorRegex = /<a[^>]*href="([^"]*\/dp\/([A-Z0-9]{10})[^"]*)"[^>]*>[\s\S]{0,1600}?<img[^>]*alt="([^"]+)"[^>]*>/g;

  const result = [];
  const seen = new Set();
  let match;

  while ((match = anchorRegex.exec(html)) !== null) {
    const [, rawHref, asin, rawTitle] = match;
    if (seen.has(asin)) continue;

    let title = decodeHtml(rawTitle);
    if (!title || /green up arrow/i.test(title)) {
      title = titleFromHref(rawHref);
    }
    if (!title) continue;

    const windowStart = Math.max(0, match.index - 1200);
    const windowEnd = Math.min(html.length, match.index + match[0].length + 1200);
    const nearHtml = html.slice(windowStart, windowEnd);

    const rankMatch = nearHtml.match(/zg-bdg-text[^>]*>#\s*([0-9]+)/);
    const growthMatch = nearHtml.match(/([0-9][0-9,]*)%/);
    const rank = rankMatch ? Number.parseInt(rankMatch[1], 10) : result.length + 1;
    const growthPercent = growthMatch ? Number.parseInt(growthMatch[1].replace(/,/g, ""), 10) : 0;

    result.push({
      rank,
      asin,
      title,
      keyword_en: toKeyword(title),
      product_name_cn: title,
      detail_url: rawHref.startsWith("http") ? rawHref : `https://www.amazon.com${rawHref}`,
      growth_percent_24h: growthPercent,
      amazon_growth_score: scoreFromGrowth(growthPercent),
      demand_signal: clamp(scoreFromGrowth(growthPercent) - 4, 55, 95),
      red_ocean_risk: 52
    });
    seen.add(asin);
    if (result.length >= limit) break;
  }

  return result.sort((a, b) => a.rank - b.rank);
}

function fetchHtmlByPython() {
  const script = [
    "import requests",
    "url='https://www.amazon.com/gp/movers-and-shakers'",
    "headers={'User-Agent':'Mozilla/5.0','Accept-Language':'en-US,en;q=0.9'}",
    "r=requests.get(url,headers=headers,timeout=30)",
    "print(r.text)"
  ].join(";");
  const run = spawnSync("python3", ["-c", script], {
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024
  });
  if (run.status !== 0) {
    throw new Error(`Python fallback failed: ${run.stderr || "unknown error"}`);
  }
  return run.stdout;
}

export async function fetchAmazonMovers(limit = 20) {
  const response = await fetch(AMAZON_MOVERS_URL, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "accept-language": "en-US,en;q=0.9"
    }
  });

  if (!response.ok) {
    throw new Error(`Amazon request failed with status ${response.status}`);
  }

  const html = await response.text();
  let products = parseAmazonMoversHtml(html, limit);
  let sourceTransport = "node_fetch";
  if (products.length === 0) {
    const fallbackHtml = fetchHtmlByPython();
    products = parseAmazonMoversHtml(fallbackHtml, limit);
    sourceTransport = "python_requests_fallback";
  }

  return {
    ok: true,
    source: "amazon_movers_and_shakers",
    transport: sourceTransport,
    fetched_at: new Date().toISOString(),
    count: products.length,
    products
  };
}

function buildManualTemplate(records) {
  return {
    version: "p0-manual-input-v1",
    generated_at: new Date().toISOString(),
    items: records.slice(0, 10).map((item) => ({
      asin: item.asin,
      title: item.title,
      keyword_en: item.keyword_en,
      temu_king_price_usd: null,
      source_platform: "temu_or_4supply",
      source_url: "",
      cost_1688_cny: null,
      inquiry_supplier_name: "",
      inquiry_note: ""
    }))
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const outputDir = process.argv[2] ?? "deliverables/day4/p0";
  const limitArg = process.argv[3] ? Number.parseInt(process.argv[3], 10) : 20;
  const limit = Number.isFinite(limitArg) && limitArg > 0 ? limitArg : 20;

  try {
    const payload = await fetchAmazonMovers(limit);
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(`${outputDir}/amazon_movers_raw.json`, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    writeFileSync(`${outputDir}/manual_price_input.template.json`, `${JSON.stringify(buildManualTemplate(payload.products), null, 2)}\n`, "utf8");
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  } catch (error) {
    process.stdout.write(
      `${JSON.stringify(
        {
          ok: false,
          error: {
            code: "AMAZON_FETCH_FAILED",
            message: error.message
          }
        },
        null,
        2
      )}\n`
    );
    process.exitCode = 1;
  }
}
