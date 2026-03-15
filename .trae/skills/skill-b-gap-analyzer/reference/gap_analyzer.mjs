function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function calcOpportunity(item) {
  const trendPart = item.amazon_growth_score * 0.35;
  const demandPart = item.demand_signal * 0.35;
  const oceanPart = (100 - item.red_ocean_risk) * 0.2;
  const pricePart = clamp(20 - Math.abs(item.temu_price_anchor_usd - 12), 0, 20) * 0.5;
  const score = Math.round((trendPart + demandPart + oceanPart + pricePart) * 100) / 100;
  return score;
}

function levelFromScore(score) {
  if (score >= 80) return "high";
  if (score >= 65) return "medium";
  return "low";
}

function reasonFromScore(score, redOceanRisk) {
  if (score >= 80) return "趋势与需求强，价格带可切入。";
  if (score >= 65 && redOceanRisk < 65) return "具备机会，需差异化策略配合。";
  return "同质化或需求强度不足，建议淘汰。";
}

export function analyzeGaps(input = {}) {
  const candidates = Array.isArray(input.candidates) ? input.candidates : [];
  const threshold = typeof input.threshold === "number" && Number.isFinite(input.threshold) ? input.threshold : 60;

  const evaluated = candidates.map((item) => {
    const opportunityScore = calcOpportunity(item);
    const opportunityLevel = levelFromScore(opportunityScore);
    return {
      ...item,
      opportunity_score: opportunityScore,
      opportunity_level: opportunityLevel,
      gap_reason: reasonFromScore(opportunityScore, item.red_ocean_risk)
    };
  });

  const selected = evaluated.filter((item) => item.opportunity_score >= threshold);

  return {
    ok: true,
    threshold,
    evaluated,
    selected
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const payload = process.argv[2] ? JSON.parse(process.argv[2]) : {};
    const result = analyzeGaps(payload);
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
