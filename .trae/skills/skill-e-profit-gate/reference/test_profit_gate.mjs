import assert from "node:assert/strict";
import { evaluateProfitGate } from "./profit_gate.mjs";

function runTests() {
  const passBoundary = evaluateProfitGate({
    temu_king_price_usd: 10,
    cost_1688_cny: 23.91
  });
  assert.equal(passBoundary.ok, true);
  assert.equal(passBoundary.metrics.net_profit_cny, 4.99);
  assert.equal(passBoundary.decision, "PASS");

  const goBoundary = evaluateProfitGate({
    temu_king_price_usd: 10,
    cost_1688_cny: 23.89
  });
  assert.equal(goBoundary.ok, true);
  assert.equal(goBoundary.metrics.net_profit_cny, 5.01);
  assert.equal(goBoundary.decision, "GO");

  const missingField = evaluateProfitGate({
    temu_king_price_usd: 10
  });
  assert.equal(missingField.ok, false);
  assert.equal(missingField.error.code, "MISSING_REQUIRED_FIELD");
  assert.deepEqual(missingField.error.missing_fields, ["cost_1688_cny"]);

  const typeError = evaluateProfitGate({
    temu_king_price_usd: "10",
    cost_1688_cny: 20
  });
  assert.equal(typeError.ok, false);
  assert.equal(typeError.error.code, "INVALID_FIELD_TYPE");
}

runTests();
process.stdout.write("Skill E tests passed\n");
