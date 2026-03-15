import assert from "node:assert/strict";
import { discoverTrends } from "../../skill-a-trend-discovery/reference/trend_discovery.mjs";
import { analyzeGaps } from "./gap_analyzer.mjs";

function runTests() {
  const trends = discoverTrends();
  const analyzed = analyzeGaps({ candidates: trends.candidates });
  assert.equal(analyzed.ok, true);
  assert.ok(analyzed.evaluated.length >= 3);
  assert.ok(analyzed.selected.length >= 2);
  assert.ok(analyzed.selected.every((item) => item.opportunity_score >= 60));

  const strict = analyzeGaps({ candidates: trends.candidates, threshold: 90 });
  assert.equal(strict.selected.length <= analyzed.selected.length, true);
}

runTests();
process.stdout.write("Skill B tests passed\n");
