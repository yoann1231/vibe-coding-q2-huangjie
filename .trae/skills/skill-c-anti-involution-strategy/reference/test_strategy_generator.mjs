import assert from "node:assert/strict";
import { discoverTrends } from "../../skill-a-trend-discovery/reference/trend_discovery.mjs";
import { analyzeGaps } from "../../skill-b-gap-analyzer/reference/gap_analyzer.mjs";
import { generateStrategies } from "./strategy_generator.mjs";

function runTests() {
  const trends = discoverTrends();
  const gaps = analyzeGaps({ candidates: trends.candidates });
  const strategies = generateStrategies({ candidates: gaps.selected });
  assert.equal(strategies.ok, true);
  assert.ok(strategies.strategized.length >= 2);
  assert.ok(
    strategies.strategized.every((item) =>
      ["Bundle", "Premium", "Lightweight"].includes(item.anti_involution_strategy)
    )
  );
}

runTests();
process.stdout.write("Skill C tests passed\n");
