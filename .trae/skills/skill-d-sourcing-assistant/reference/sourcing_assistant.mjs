function estimateCost(item) {
  const base = item.temu_price_anchor_usd * 7.2 * 0.32;
  const strategyOffset =
    item.anti_involution_strategy === "Bundle"
      ? 3
      : item.anti_involution_strategy === "Premium"
        ? 12
        : 1.5;
  return Math.round((base + strategyOffset) * 100) / 100;
}

function buildKeywords(item) {
  return [
    item.keyword_en,
    item.product_name_cn,
    `${item.product_name_cn} 工厂`,
    `${item.product_name_cn} 批发`
  ];
}

function buildInquiry(item, cost) {
  return `您好，我们做 ${item.product_name_cn} 跨境项目，目标到厂价 ¥${cost} 左右，请提供材质规格、最小起订量、打样周期、质检标准、售后补发条款。`;
}

export function buildSourcingPlan(input = {}) {
  const candidates = Array.isArray(input.candidates) ? input.candidates : [];
  const sourced = candidates.map((item) => {
    const cost = estimateCost(item);
    return {
      ...item,
      supplier_keywords_1688: buildKeywords(item),
      inquiry_script: buildInquiry(item, cost),
      risk_checklist: [
        "确认材质与认证声明一致",
        "确认起订量与阶梯报价",
        "确认打样与大货交期",
        "确认不良率责任与补发规则"
      ],
      cost_1688_cny: cost
    };
  });

  return {
    ok: true,
    sourced
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const payload = process.argv[2] ? JSON.parse(process.argv[2]) : {};
    const result = buildSourcingPlan(payload);
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
