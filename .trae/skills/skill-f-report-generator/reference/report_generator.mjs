import { writeFileSync } from "node:fs";

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateInput(input) {
  const missing = [];

  if (!input || typeof input !== "object") {
    return ["input"];
  }

  if (!input.product) missing.push("product");
  if (!input.marketing) missing.push("marketing");
  if (!input.profit) missing.push("profit");

  if (missing.length > 0) {
    return missing;
  }

  const product = input.product;
  const marketing = input.marketing;
  const profit = input.profit;

  if (!Number.isInteger(product.index) || product.index < 1) missing.push("product.index");
  if (!hasText(product.name_cn)) missing.push("product.name_cn");
  if (!hasText(product.keyword_en)) missing.push("product.keyword_en");

  if (!hasText(marketing.amazon_heat)) missing.push("marketing.amazon_heat");
  if (!hasText(marketing.blue_ocean_competition)) missing.push("marketing.blue_ocean_competition");
  if (!hasText(marketing.safety_compliance)) missing.push("marketing.safety_compliance");
  if (!hasText(marketing.factory_instruction)) missing.push("marketing.factory_instruction");

  if (!["GO", "PASS"].includes(profit.decision)) missing.push("profit.decision");
  if (!profit.metrics || typeof profit.metrics !== "object") missing.push("profit.metrics");

  return missing;
}

function toMoney(value) {
  return Number(value).toFixed(2);
}

export function generateSkillFReport(input) {
  const missingFields = validateInput(input);
  if (missingFields.length > 0) {
    return {
      ok: false,
      error: {
        code: "INVALID_INPUT",
        message: "Missing or invalid required fields",
        fields: missingFields
      }
    };
  }

  const { product, marketing, profit } = input;
  const metrics = profit.metrics;
  const recommendation = profit.decision === "GO" ? "推荐" : "不推荐";
  const decisionText = profit.decision === "GO" ? "✅ GO (利润达标)" : "❌ PASS (利润不足)";

  const report = {
    product_index: product.index,
    product_title: `${product.name_cn} + ${product.keyword_en}`,
    part_1_marketing: {
      amazon_heat: marketing.amazon_heat,
      blue_ocean_competition: marketing.blue_ocean_competition,
      safety_compliance: marketing.safety_compliance,
      factory_instruction: marketing.factory_instruction
    },
    part_2_survival: {
      temu_king_price_usd: metrics.temu_king_price_usd,
      income_estimate_usd: metrics.income_estimate_usd,
      income_estimate_cny: metrics.income_estimate_cny,
      cost_1688_cny: metrics.cost_1688_cny,
      fulfillment_fee_cny: metrics.fulfillment_fee_cny,
      total_cost_cny: metrics.total_cost_cny,
      net_profit_cny: metrics.net_profit_cny,
      decision: profit.decision
    },
    recommendation
  };

  const markdown = [
    `## 📦 ${product.index}. ${product.name_cn} + ${product.keyword_en}`,
    "",
    "### 第一部分：前端营销逻辑 (卖给谁？怎么卖？)",
    `- 亚马逊热度：${marketing.amazon_heat}`,
    `- 蓝海竞争：${marketing.blue_ocean_competition}`,
    `- 安全合规：${marketing.safety_compliance}`,
    `- 义乌或工厂找货指令：${marketing.factory_instruction}`,
    "",
    "### 第二部分：后端生存逻辑 (V4.1 核价模型)",
    `- Temu 卷王价：$${toMoney(metrics.temu_king_price_usd)}`,
    `- 你的收入预估 (45%)：$${toMoney(metrics.income_estimate_usd)} ≈ ¥${toMoney(metrics.income_estimate_cny)}`,
    "- 你的成本核算：",
    `  - 1688 拿货价：¥${toMoney(metrics.cost_1688_cny)}`,
    `  - 国内履约费：¥${toMoney(metrics.fulfillment_fee_cny)} (固定)`,
    `  - 总成本：¥${toMoney(metrics.total_cost_cny)}`,
    "- 最终生死判定：",
    `  - 净利：¥${toMoney(metrics.net_profit_cny)}`,
    `  - 结论：${decisionText}`,
    `- 推荐结论：${recommendation}`
  ].join("\n");

  return {
    ok: true,
    report,
    report_markdown: markdown
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const payload = process.argv[2] ? JSON.parse(process.argv[2]) : {};
    const result = generateSkillFReport(payload);
    if (result.ok) {
      writeFileSync("final_report.md", `${result.report_markdown}\n`, "utf8");
      result.output_markdown_path = "final_report.md";
    }
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
