import { evaluateProfitGate } from "../../skill-e-profit-gate/reference/profit_gate.mjs";
import { generateSkillFReport } from "./report_generator.mjs";

const pricingInput = {
  temu_king_price_usd: 12.8,
  cost_1688_cny: 30.5
};

const marketingInput = {
  amazon_heat: "开学季与居家办公场景叠加，近期搜索和成交同步上升。",
  blue_ocean_competition: "采用桌面整理+走线配件套装，避免单一线夹的地板价竞争。",
  safety_compliance: "常规塑胶件关注 REACH/RoHS，避免宣称医疗级功能。",
  factory_instruction: "询盘要求 ABS 阻燃等级、3M 胶型号、承重测试与返工补发条款。"
};

const productInput = {
  index: 1,
  name_cn: "桌面理线夹套装",
  keyword_en: "desk cable management clips bundle"
};

const profitResult = evaluateProfitGate(pricingInput);

if (!profitResult.ok) {
  process.stdout.write(`${JSON.stringify(profitResult, null, 2)}\n`);
  process.exit(1);
}

const reportResult = generateSkillFReport({
  product: productInput,
  marketing: marketingInput,
  profit: {
    decision: profitResult.decision,
    metrics: profitResult.metrics
  }
});

process.stdout.write(`${JSON.stringify(reportResult, null, 2)}\n`);
