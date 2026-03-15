import assert from "node:assert/strict";
import { discoverTrends } from "../../skill-a-trend-discovery/reference/trend_discovery.mjs";
import { analyzeGaps } from "../../skill-b-gap-analyzer/reference/gap_analyzer.mjs";
import { generateStrategies } from "../../skill-c-anti-involution-strategy/reference/strategy_generator.mjs";
import { buildSourcingPlan } from "./sourcing_assistant.mjs";

function runTests() {
  const trends = discoverTrends();
  const gaps = analyzeGaps({ candidates: trends.candidates });
  const strategies = generateStrategies({ candidates: gaps.selected });
  const sourcing = buildSourcingPlan({ candidates: strategies.strategized });
  assert.equal(sourcing.ok, true);
  assert.ok(sourcing.sourced.length >= 2);
  assert.ok(sourcing.sourced.every((item) => typeof item.cost_1688_cny === "number"));
  assert.ok(sourcing.sourced.every((item) => Array.isArray(item.supplier_keywords_1688)));
}

runTests();
process.stdout.write("Skill D tests passed\n");
