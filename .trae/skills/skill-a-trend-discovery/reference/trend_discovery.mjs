const DEFAULT_MARKET = "amazon_movers";

const DEFAULT_CANDIDATES = [
  {
    product_id: "A-001",
    product_name_cn: "桌面理线夹套装",
    keyword_en: "desk cable clips bundle",
    category: "home-office",
    amazon_growth_score: 92,
    demand_signal: 88,
    red_ocean_risk: 42,
    temu_price_anchor_usd: 12.8,
    target_scene: "开学季桌面整理",
    amazon_heat_reason: "返校季与居家办公叠加，桌面收纳需求持续抬升。"
  },
  {
    product_id: "A-002",
    product_name_cn: "人体工学脚踏板",
    keyword_en: "ergonomic under desk foot rest",
    category: "home-office",
    amazon_growth_score: 86,
    demand_signal: 81,
    red_ocean_risk: 54,
    temu_price_anchor_usd: 18.5,
    target_scene: "久坐办公舒适升级",
    amazon_heat_reason: "久坐健康场景升温，客单与评价增长同步。"
  },
  {
    product_id: "A-003",
    product_name_cn: "可折叠笔记本增高架",
    keyword_en: "foldable laptop stand lightweight",
    category: "home-office",
    amazon_growth_score: 79,
    demand_signal: 76,
    red_ocean_risk: 49,
    temu_price_anchor_usd: 15.2,
    target_scene: "移动办公与咖啡馆办公",
    amazon_heat_reason: "移动办公增多，轻量便携支架热度走高。"
  },
  {
    product_id: "A-004",
    product_name_cn: "基础手机壳",
    keyword_en: "plain phone case",
    category: "electronics-accessory",
    amazon_growth_score: 65,
    demand_signal: 70,
    red_ocean_risk: 87,
    temu_price_anchor_usd: 3.5,
    target_scene: "通用配件补货",
    amazon_heat_reason: "需求常年存在但同质竞争极强。"
  }
];

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

export function discoverTrends(input = {}) {
  const market = input.market ?? DEFAULT_MARKET;
  const sourceCandidates = Array.isArray(input.candidates) ? input.candidates : DEFAULT_CANDIDATES;
  const validCandidates = sourceCandidates.filter(isValidCandidate);
  const filtered = validCandidates.filter((item) => item.amazon_growth_score >= 75 && item.demand_signal >= 72 && item.red_ocean_risk <= 70);

  return {
    ok: true,
    market,
    generated_at: new Date().toISOString(),
    candidates: filtered
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const payload = process.argv[2] ? JSON.parse(process.argv[2]) : {};
    const result = discoverTrends(payload);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
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
