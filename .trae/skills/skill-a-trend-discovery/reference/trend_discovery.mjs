import { fetchAmazonMovers } from "./fetch_amazon_movers.mjs";
const DEFAULT_MARKET = "amazon_movers";

function isValidCandidate(item) {
  if (!item || typeof item !== "object") return false;
  const requiredText = ["product_id", "product_name_cn", "keyword_en", "target_scene", "amazon_heat_reason"];
  for (const field of requiredText) {
    if (typeof item[field] !== "string" || item[field].trim().length === 0) return false;
  }
  const requiredNumber = ["amazon_growth_score", "demand_signal", "red_ocean_risk", "temu_price_anchor_usd"];
  for (const field of requiredNumber) {
    if (typeof item[field] !== "number" || !Number.isFinite(item[field])) return false;
  }
  return true;
}

function normalizeLiveProducts(products = []) {
  return products.map((item, index) => ({
    product_id: `A-LIVE-${String(index + 1).padStart(3, "0")}`,
    product_name_cn: item.product_name_cn || item.title,
    keyword_en: item.keyword_en,
    category: "amazon-movers",
    amazon_growth_score: item.amazon_growth_score,
    demand_signal: item.demand_signal,
    red_ocean_risk: item.red_ocean_risk,
    temu_price_anchor_usd: Number((9.9 + (index % 5) * 1.8).toFixed(2)),
    target_scene: "Amazon飙升榜机会验证",
    amazon_heat_reason: `24小时飙升幅度约 ${item.growth_percent_24h ?? 0}%（榜单位次 #${item.rank ?? index + 1}）`
  }));
}

export function discoverTrends(input = {}) {
  const market = input.market ?? DEFAULT_MARKET;
  if (!Array.isArray(input.candidates)) {
    return {
      ok: false,
      market,
      error: {
        code: "LIVE_FETCH_REQUIRED",
        message: "Skill A 默认强制实时抓取。若要离线测试，请显式传入 candidates。"
      }
    };
  }
  const sourceCandidates = input.candidates;
  const validCandidates = sourceCandidates.filter(isValidCandidate);
  const filtered = validCandidates.filter((item) => item.amazon_growth_score >= 75 && item.demand_signal >= 72 && item.red_ocean_risk <= 70);

  return {
    ok: true,
    market,
    source: Array.isArray(input.candidates) ? "custom_input" : "built_in_sample",
    generated_at: new Date().toISOString(),
    candidates: filtered
  };
}

export async function discoverTrendsLive(input = {}) {
  const market = input.market ?? DEFAULT_MARKET;
  const limit = typeof input.limit === "number" && Number.isFinite(input.limit) ? input.limit : 20;
  const fetched = await fetchAmazonMovers(limit);
  const normalized = normalizeLiveProducts(fetched.products);
  const filtered = normalized.filter((item) => item.amazon_growth_score >= 75 && item.demand_signal >= 72 && item.red_ocean_risk <= 70);
  return {
    ok: true,
    market,
    source: fetched.source,
    transport: fetched.transport,
    generated_at: new Date().toISOString(),
    candidates: filtered
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const payload = process.argv[2] ? JSON.parse(process.argv[2]) : {};
    if (payload.use_live_fetch === false) {
      const result = discoverTrends(payload);
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      const result = await discoverTrendsLive(payload);
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    }
  } catch (error) {
    process.stdout.write(
      `${JSON.stringify(
        {
          ok: false,
          error: {
            code: "INVALID_JSON",
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
