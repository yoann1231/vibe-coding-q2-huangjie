import { readFileSync, writeFileSync } from "node:fs";

const templatePath = process.argv[2] ?? "deliverables/day4/p0/manual_price_input.template.json";
const outputPath = process.argv[3] ?? "deliverables/day4/p0/manual_price_input.filled.json";

const payload = JSON.parse(readFileSync(templatePath, "utf8"));
const filled = {
  ...payload,
  generated_from: "auto_example_fill",
  items: (payload.items ?? []).slice(0, 5).map((item, index) => ({
    ...item,
    temu_king_price_usd: Number((11.8 + index * 2.2).toFixed(2)),
    source_platform: index % 2 === 0 ? "temu" : "4supply",
    source_url: item.source_url || "https://www.4supply.com/home",
    cost_1688_cny: Number((25.5 + index * 6.3).toFixed(2)),
    inquiry_supplier_name: `supplier_${index + 1}`,
    inquiry_note: "样例填充，实际请替换为真实询盘价格"
  }))
};

writeFileSync(outputPath, `${JSON.stringify(filled, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({ ok: true, output_path: outputPath, count: filled.items.length }, null, 2)}\n`);
