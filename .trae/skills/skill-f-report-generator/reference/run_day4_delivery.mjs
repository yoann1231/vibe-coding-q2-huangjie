import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { discoverTrends } from "../../skill-a-trend-discovery/reference/trend_discovery.mjs";
import { analyzeGaps } from "../../skill-b-gap-analyzer/reference/gap_analyzer.mjs";
import { generateStrategies } from "../../skill-c-anti-involution-strategy/reference/strategy_generator.mjs";
import { buildSourcingPlan } from "../../skill-d-sourcing-assistant/reference/sourcing_assistant.mjs";
import { evaluateProfitGate } from "../../skill-e-profit-gate/reference/profit_gate.mjs";
import { generateSkillFReport } from "./report_generator.mjs";

const OUTPUT_DIR = "deliverables/day4";

const DAY4_CANDIDATES = [
  {
    product_id: "A-101",
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
    product_id: "A-102",
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
    product_id: "A-103",
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
    product_id: "A-104",
    product_name_cn: "折叠硅胶手机支架",
    keyword_en: "foldable silicone phone stand",
    category: "electronics-accessory",
    amazon_growth_score: 84,
    demand_signal: 80,
    red_ocean_risk: 45,
    temu_price_anchor_usd: 9.8,
    target_scene: "轻小件配件搭售",
    amazon_heat_reason: "短视频内容创作场景增长，支架类小件成交加速。"
  },
  {
    product_id: "A-105",
    product_name_cn: "铝合金显示器增高架",
    keyword_en: "premium aluminum monitor riser",
    category: "home-office",
    amazon_growth_score: 90,
    demand_signal: 83,
    red_ocean_risk: 57,
    temu_price_anchor_usd: 25,
    target_scene: "高客单办公桌面升级",
    amazon_heat_reason: "办公空间升级需求上行，金属材质款评价增速明显。"
  }
];

function buildMarketing(item) {
  return {
    amazon_heat: item.amazon_heat_reason,
    blue_ocean_competition: item.differentiation_points,
    safety_compliance: "常规品需关注 RoHS/REACH 声明与材质一致性。",
    factory_instruction: item.inquiry_script
  };
}

function buildPipeline() {
  const trends = discoverTrends({ candidates: DAY4_CANDIDATES });
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

  return { trends, gaps, strategies, sourcing, reports };
}

function runAcceptance(pipeline) {
  const caseBoundaryPass = evaluateProfitGate({ temu_king_price_usd: 10, cost_1688_cny: 23.91 });
  const caseBoundaryGo = evaluateProfitGate({ temu_king_price_usd: 10, cost_1688_cny: 23.89 });
  const missingField = evaluateProfitGate({ temu_king_price_usd: 10 });
  const strategyReady = pipeline.strategies.strategized.every((item) => typeof item.anti_involution_strategy === "string");
  const reportStructureReady = pipeline.reports.every(
    (item) => item.ok && item.report_markdown.includes("第一部分：前端营销逻辑") && item.report_markdown.includes("第二部分：后端生存逻辑")
  );

  assert.equal(caseBoundaryPass.ok, true);
  assert.equal(caseBoundaryPass.metrics.net_profit_cny, 4.99);
  assert.equal(caseBoundaryPass.decision, "PASS");
  assert.equal(caseBoundaryGo.ok, true);
  assert.equal(caseBoundaryGo.metrics.net_profit_cny, 5.01);
  assert.equal(caseBoundaryGo.decision, "GO");
  assert.equal(strategyReady, true);
  assert.equal(reportStructureReady, true);
  assert.equal(missingField.ok, false);
  assert.equal(missingField.error.code, "MISSING_REQUIRED_FIELD");
  assert.equal(pipeline.reports.length, 5);

  return {
    case_1_boundary_4_99: "PASS",
    case_2_boundary_5_01: "GO",
    case_3_each_candidate_has_strategy: "PASS",
    case_4_report_has_two_parts: "PASS",
    case_5_missing_field_error: "PASS",
    final_report_count: pipeline.reports.length,
    go_count: pipeline.reports.filter((item) => item.ok && item.report.part_2_survival.decision === "GO").length,
    pass_count: pipeline.reports.filter((item) => item.ok && item.report.part_2_survival.decision === "PASS").length
  };
}

function buildMarkdownReports(reports) {
  return reports.map((item) => item.report_markdown).join("\n\n---\n\n");
}

function writeDeliverables(acceptance, pipeline) {
  const markdownReport = `${buildMarkdownReports(pipeline.reports)}\n`;
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(`${OUTPUT_DIR}/acceptance_result.json`, `${JSON.stringify(acceptance, null, 2)}\n`, "utf8");
  writeFileSync(`${OUTPUT_DIR}/final_reports.json`, `${JSON.stringify(pipeline.reports, null, 2)}\n`, "utf8");
  writeFileSync(`${OUTPUT_DIR}/final_reports.md`, markdownReport, "utf8");
  writeFileSync("final_reports.md", markdownReport, "utf8");
  writeFileSync(
    `${OUTPUT_DIR}/install_and_branch.md`,
    [
      "# Day4 安装与分支说明",
      "",
      "- 预设提交分支：`skills-suite-huangjie`",
      "- 目标仓库：`https://github.com/global-ecom-skills/global-ecom-skills`",
      "",
      "## 一行命令安装（示例）",
      "",
      "```bash",
      "npx skills add global-ecom-skills/global-ecom-skills@skill-a-trend-discovery -y --agent codex && npx skills add global-ecom-skills/global-ecom-skills@skill-b-gap-analyzer -y --agent codex && npx skills add global-ecom-skills/global-ecom-skills@skill-c-anti-involution-strategy -y --agent codex && npx skills add global-ecom-skills/global-ecom-skills@skill-d-sourcing-assistant -y --agent codex && npx skills add global-ecom-skills/global-ecom-skills@skill-e-profit-gate -y --agent codex && npx skills add global-ecom-skills/global-ecom-skills@skill-f-report-generator -y --agent codex",
      "```",
      "",
      "## 录屏自检清单",
      "",
      "- 展示 Skills 列表识别成功",
      "- 展示 A-B-C-D-E-F 全链路执行",
      "- 展示 5 款最终报告输出文件",
      "- 展示验收用例结果文件"
    ].join("\n"),
    "utf8"
  );
}

const pipeline = buildPipeline();
const acceptance = runAcceptance(pipeline);
writeDeliverables(acceptance, pipeline);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      output_dir: OUTPUT_DIR,
      acceptance,
      report_count: pipeline.reports.length
    },
    null,
    2
  )}\n`
);
