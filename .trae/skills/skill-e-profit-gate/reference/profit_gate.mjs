const DEFAULT_EXCHANGE_RATE = 7.2;
const DEFAULT_FULFILLMENT_FEE = 3.5;
const INCOME_RATIO = 0.45;
const GO_THRESHOLD_CNY = 5;

function round2(value) {
  return Math.round(value * 100) / 100;
}

function isValidNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function buildMissingFieldError(missingFields) {
  return {
    ok: false,
    error: {
      code: "MISSING_REQUIRED_FIELD",
      message: "Required fields are missing",
      missing_fields: missingFields
    }
  };
}

function buildInvalidFieldError(invalidFields) {
  return {
    ok: false,
    error: {
      code: "INVALID_FIELD_TYPE",
      message: "Fields must be valid finite numbers",
      invalid_fields: invalidFields
    }
  };
}

export function evaluateProfitGate(input) {
  const missingFields = [];

  if (input?.temu_king_price_usd === undefined) {
    missingFields.push("temu_king_price_usd");
  }

  if (input?.cost_1688_cny === undefined) {
    missingFields.push("cost_1688_cny");
  }

  if (missingFields.length > 0) {
    return buildMissingFieldError(missingFields);
  }

  const exchangeRate = input.exchange_rate_cny_per_usd ?? DEFAULT_EXCHANGE_RATE;
  const fulfillmentFee = input.fulfillment_fee_cny ?? DEFAULT_FULFILLMENT_FEE;

  const invalidFields = [];
  const numberFields = [
    "temu_king_price_usd",
    "cost_1688_cny",
    "exchange_rate_cny_per_usd",
    "fulfillment_fee_cny"
  ];

  for (const field of numberFields) {
    const value =
      field === "exchange_rate_cny_per_usd"
        ? exchangeRate
        : field === "fulfillment_fee_cny"
          ? fulfillmentFee
          : input[field];
    if (!isValidNumber(value)) {
      invalidFields.push(field);
    }
  }

  if (invalidFields.length > 0) {
    return buildInvalidFieldError(invalidFields);
  }

  if (input.temu_king_price_usd <= 0) {
    return {
      ok: false,
      error: {
        code: "INVALID_VALUE_RANGE",
        message: "temu_king_price_usd must be greater than 0"
      }
    };
  }

  if (input.cost_1688_cny < 0 || exchangeRate <= 0 || fulfillmentFee < 0) {
    return {
      ok: false,
      error: {
        code: "INVALID_VALUE_RANGE",
        message: "cost_1688_cny and fulfillment_fee_cny must be >= 0, exchange_rate_cny_per_usd must be > 0"
      }
    };
  }

  const incomeEstimateUsd = round2(input.temu_king_price_usd * INCOME_RATIO);
  const incomeEstimateCny = round2(incomeEstimateUsd * exchangeRate);
  const totalCostCny = round2(input.cost_1688_cny + fulfillmentFee);
  const netProfitCny = round2(incomeEstimateCny - totalCostCny);
  const decision = netProfitCny > GO_THRESHOLD_CNY ? "GO" : "PASS";

  return {
    ok: true,
    decision,
    metrics: {
      temu_king_price_usd: round2(input.temu_king_price_usd),
      income_estimate_usd: incomeEstimateUsd,
      exchange_rate_cny_per_usd: round2(exchangeRate),
      income_estimate_cny: incomeEstimateCny,
      cost_1688_cny: round2(input.cost_1688_cny),
      fulfillment_fee_cny: round2(fulfillmentFee),
      total_cost_cny: totalCostCny,
      net_profit_cny: netProfitCny
    },
    rule: {
      income_ratio: INCOME_RATIO,
      go_threshold_cny: GO_THRESHOLD_CNY,
      decision_rule: "net_profit_cny > 5 => GO, otherwise PASS"
    }
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const payload = process.argv[2] ? JSON.parse(process.argv[2]) : {};
    const result = evaluateProfitGate(payload);
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
