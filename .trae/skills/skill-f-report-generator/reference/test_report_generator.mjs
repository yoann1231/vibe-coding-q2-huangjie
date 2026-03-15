import assert from "node:assert/strict";
import { evaluateProfitGate } from "../../skill-e-profit-gate/reference/profit_gate.mjs";
import { generateSkillFReport } from "./report_generator.mjs";

function runTests() {
  const profit = evaluateProfitGate({
    temu_king_price_usd: 10,
    cost_1688_cny: 23.89
  });
  assert.equal(profit.ok, true);
  assert.equal(profit.decision, "GO");

  const report = generateSkillFReport({
    product: {
      index: 1,
      name_cn: "桌面理线夹套装",
      keyword_en: "desk cable clips bundle"
    },
    marketing: {
      amazon_heat: "办公场景需求持续增长。",
      blue_ocean_competition: "套装化交付避免同质低价竞争。",
      safety_compliance: "关注 RoHS 与材质安全声明。",
      factory_instruction: "要求提供材质报告、胶贴规格与耐久测试。"
    },
    profit: {
      decision: profit.decision,
      metrics: profit.metrics
    }
  });

  assert.equal(report.ok, true);
  assert.equal(report.report.part_2_survival.decision, "GO");
  assert.equal(report.report.recommendation, "推荐");
  assert.match(report.report_markdown, /第一部分：前端营销逻辑/);
  assert.match(report.report_markdown, /第二部分：后端生存逻辑/);

  const invalid = generateSkillFReport({
    product: {
      index: 1,
      name_cn: "",
      keyword_en: "x"
    },
    marketing: {
      amazon_heat: "x",
      blue_ocean_competition: "x",
      safety_compliance: "x",
      factory_instruction: "x"
    },
    profit: {
      decision: "GO",
      metrics: profit.metrics
    }
  });

  assert.equal(invalid.ok, false);
  assert.equal(invalid.error.code, "INVALID_INPUT");
}

runTests();
process.stdout.write("Skill F tests passed\n");
