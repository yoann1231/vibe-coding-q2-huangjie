import assert from "node:assert/strict";
import { discoverTrends } from "./trend_discovery.mjs";

function runTests() {
  const result = discoverTrends();
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "LIVE_FETCH_REQUIRED");

  const custom = discoverTrends({
    candidates: [
      {
        product_id: "A-900",
        product_name_cn: "测试品",
        keyword_en: "test",
        amazon_growth_score: 90,
        demand_signal: 80,
        red_ocean_risk: 20,
        temu_price_anchor_usd: 9,
        target_scene: "测试场景",
        amazon_heat_reason: "测试原因"
      }
    ]
  });
  assert.equal(custom.candidates.length, 1);
}

runTests();
process.stdout.write("Skill A tests passed\n");
