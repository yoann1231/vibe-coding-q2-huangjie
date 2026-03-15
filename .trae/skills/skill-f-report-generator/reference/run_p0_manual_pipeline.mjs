import { readFileSync, writeFileSync } from "node:fs";
import { analyzeGaps } from "../../skill-b-gap-analyzer/reference/gap_analyzer.mjs";
import { generateStrategies } from "../../skill-c-anti-involution-strategy/reference/strategy_generator.mjs";
import { evaluateProfitGate } from "../../skill-e-profit-gate/reference/profit_gate.mjs";
import { generateSkillFReport } from "./report_generator.mjs";

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function buildMarkdownReports(reports) {
  return reports
    .filter((item) => item.ok)
    .map((item) => item.report_markdown)
    .join("\n\n---\n\n");
}

function toCandidate(raw, manual, index) {
  return {
    product_id: `P0-${index + 1}`,
    product_name_cn: raw.title,
    keyword_en: manual.keyword_en || raw.keyword_en,
    category: "amazon-movers",
    amazon_growth_score: raw.amazon_growth_score,
    demand_signal: raw.demand_signal,
    red_ocean_risk: raw.red_ocean_risk,
    temu_price_anchor_usd: manual.temu_king_price_usd,
    target_scene: "基于飙升榜的快速试销验证",
    amazon_heat_reason: `24小时飙升幅度约 ${raw.growth_percent_24h}%（榜单位次 #${raw.rank}）`,
    source_links: {
      amazon: raw.detail_url,
      temu_or_4supply: manual.source_url
    },
    manual_inputs: {
      temu_king_price_usd: manual.temu_king_price_usd,
      cost_1688_cny: manual.cost_1688_cny,
      inquiry_supplier_name: manual.inquiry_supplier_name,
      inquiry_note: manual.inquiry_note
    }
  };
}

function buildMarketings(item) {
  return {
    amazon_heat: item.amazon_heat_reason,
    blue_ocean_competition: item.differentiation_points,
    safety_compliance: "需按类目核验 CE/FCC/RoHS 等要求并保持材质声明一致。",
    factory_instruction: `请按询盘备注优先确认 MOQ、交期与不良率条款。供应商：${item.manual_inputs.inquiry_supplier_name || "待补充"}。备注：${item.manual_inputs.inquiry_note || "待补充"}。`
  };
}

export function runP0ManualPipeline(rawData, manualData) {
  const manualMap = new Map();
  for (const item of manualData.items ?? []) {
    manualMap.set(item.asin, item);
  }

  const merged = (rawData.products ?? [])
    .map((raw, index) => ({ raw, manual: manualMap.get(raw.asin), index }))
    .filter(({ manual }) => manual && typeof manual.temu_king_price_usd === "number" && typeof manual.cost_1688_cny === "number")
    .slice(0, 5)
    .map(({ raw, manual, index }) => toCandidate(raw, manual, index));

  const gaps = analyzeGaps({ candidates: merged, threshold: 60 });
  const strategized = generateStrategies({ candidates: gaps.selected });

  const reports = strategized.strategized.map((item, index) => {
    const profit = evaluateProfitGate({
      temu_king_price_usd: item.manual_inputs.temu_king_price_usd,
      cost_1688_cny: item.manual_inputs.cost_1688_cny
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
      marketing: buildMarketings(item),
      profit: {
        decision: profit.decision,
        metrics: profit.metrics
      }
    });
  });

  return {
    ok: true,
    counts: {
      raw_count: rawData.products?.length ?? 0,
      manual_valid_count: merged.length,
      selected_count: gaps.selected.length,
      report_count: reports.length,
      go_count: reports.filter((item) => item.ok && item.report.part_2_survival.decision === "GO").length,
      pass_count: reports.filter((item) => item.ok && item.report.part_2_survival.decision === "PASS").length
    },
    reports
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rawPath = process.argv[2] ?? "deliverables/day4/p0/amazon_movers_raw.json";
  const manualPath = process.argv[3] ?? "deliverables/day4/p0/manual_price_input.filled.json";
  const outputPath = process.argv[4] ?? "deliverables/day4/p0/p0_pipeline_output.json";

  try {
    const rawData = readJson(rawPath);
    const manualData = readJson(manualPath);
    const result = runP0ManualPipeline(rawData, manualData);
    writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
    writeFileSync("final_reports.md", `${buildMarkdownReports(result.reports)}\n`, "utf8");
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stdout.write(
      `${JSON.stringify(
        {
          ok: false,
          error: {
            code: "P0_PIPELINE_FAILED",
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
