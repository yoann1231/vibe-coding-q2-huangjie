function strategyForCandidate(item) {
  if (item.temu_price_anchor_usd <= 10) {
    return {
      anti_involution_strategy: "Bundle",
      differentiation_points: "同价位做多件组合，提升单笔感知价值并降低比价敏感度。",
      bundle_or_variant_hint: "主件+收纳/替换件的 3 合 1 组合"
    };
  }
  if (item.red_ocean_risk >= 50) {
    return {
      anti_involution_strategy: "Premium",
      differentiation_points: "强化材质与设计语言，主打高感知品质并避开地板价。",
      bundle_or_variant_hint: "哑光金属色或抗菌材质升级款"
    };
  }
  return {
    anti_involution_strategy: "Lightweight",
    differentiation_points: "优先轻小件规格，控制物流成本并提高周转效率。",
    bundle_or_variant_hint: "折叠便携版与薄型版双规格"
  };
}

export function generateStrategies(input = {}) {
  const candidates = Array.isArray(input.candidates) ? input.candidates : [];
  const strategized = candidates.map((item) => {
    const strategy = strategyForCandidate(item);
    return {
      ...item,
      ...strategy
    };
  });

  return {
    ok: true,
    strategized
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const payload = process.argv[2] ? JSON.parse(process.argv[2]) : {};
    const result = generateStrategies(payload);
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
