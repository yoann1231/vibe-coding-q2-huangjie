import assert from "node:assert/strict";
import { parseAmazonMoversHtml } from "./fetch_amazon_movers.mjs";

const SAMPLE_HTML = `
<div class="zg-grid-general-faceout">
  <span class="zg-bdg-text">#1</span>
  <span class="a-size-small">500%</span>
  <a class="a-link-normal aok-block" href="/Test-Item/dp/B012345678">
    <img alt="Desk Cable Clips 8 Pack" src="demo.jpg" />
  </a>
</div>
<div class="zg-grid-general-faceout">
  <span class="zg-bdg-text">#2</span>
  <span class="a-size-small">220%</span>
  <a class="a-link-normal aok-block" href="/Another-Item/dp/B0ABCDE123">
    <img alt="Foldable Laptop Stand" src="demo2.jpg" />
  </a>
</div>
`;

function runTests() {
  const parsed = parseAmazonMoversHtml(SAMPLE_HTML, 5);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].asin, "B012345678");
  assert.equal(parsed[0].rank, 1);
  assert.equal(parsed[0].growth_percent_24h, 500);
  assert.equal(parsed[0].keyword_en, "desk cable clips 8 pack");
  assert.ok(parsed[0].amazon_growth_score >= 60);
  assert.equal(parsed[1].asin, "B0ABCDE123");
}

runTests();
process.stdout.write("Amazon fetch parser tests passed\n");
