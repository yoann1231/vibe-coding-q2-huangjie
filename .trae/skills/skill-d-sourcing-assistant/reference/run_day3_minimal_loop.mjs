import { discoverTrends } from "../../skill-a-trend-discovery/reference/trend_discovery.mjs";
import { analyzeGaps } from "../../skill-b-gap-analyzer/reference/gap_analyzer.mjs";
import { generateStrategies } from "../../skill-c-anti-involution-strategy/reference/strategy_generator.mjs";
import { buildSourcingPlan } from "./sourcing_assistant.mjs";
import { evaluateProfitGate } from "../../skill-e-profit-gate/reference/profit_gate.mjs";
import { generateSkillFReport } from "../../skill-f-report-generator/reference/report_generator.mjs";

function buildMarketing(item) {
  return {
    amazon_heat: item.amazon_heat_reason,
    blue_ocean_competition: item.differentiation_points,
    safety_compliance: "常规品需关注 RoHS/REACH 声明与材质一致性。",
    factory_instruction: item.inquiry_script
  };
}

const trends = discoverTrends();
const gaps = analyzeGaps({ candidates: trends.candidates });
const strategies = generateStrategies({ candidates: gaps.selected });
const sourcing = buildSourcingPlan({ candidates: strategies.strategized });

const reports = sourcing.sourced.map((item, index) => {
  const profit = evaluateProfitGate({
    temu_king_price_usd: item.temu_price_anchor_usd,
    cost_1688_cny: item.cost_1688_cny
  });

  if (!profit.ok) {
    return {
      ok: false,
      product_id: item.product_id,
      error: profit.error
    };
  }

  return generateSkillFReport({
    product: {
      index: index + 1,
      name_cn: item.product_name_cn,
      keyword_en: item.keyword_en
    },
    marketing: buildMarketing(item),
    profit: {
      decision: profit.decision,
      metrics: profit.metrics
    }
  });
});

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      counts: {
        trends: trends.candidates.length,
        selected: gaps.selected.length,
        reports: reports.length,
        go_count: reports.filter((item) => item.ok && item.report.part_2_survival.decision === "GO").length,
        pass_count: reports.filter((item) => item.ok && item.report.part_2_survival.decision === "PASS").length
      },
      reports
    },
    null,
    2
  )}\n`
);
