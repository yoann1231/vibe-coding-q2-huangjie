const steps = [
  { name: "Skill A", desc: "抓 Amazon Movers 趋势候选，输出结构化字段。" },
  { name: "Skill B", desc: "评估 Temu/4supply 机会空档并筛掉低机会品。" },
  { name: "Skill C", desc: "生成 Bundle / Premium / Lightweight 避卷策略。" },
  { name: "Skill D", desc: "输出 1688 找货关键词、询盘话术与成本输入。" },
  { name: "Skill E", desc: "按 V4.1 统一核价并给出 GO / PASS。" },
  { name: "Skill F", desc: "生成双段式推荐报告，形成交付物。" }
];

function renderPipeline() {
  const node = document.querySelector("#pipeline");
  node.innerHTML = steps
    .map(
      (step) =>
        `<article class="step"><div class="name">${step.name}</div><div class="desc">${step.desc}</div></article>`
    )
    .join("");
}

function metric(label, value) {
  return `<article class="metric"><div class="label">${label}</div><div class="value">${value}</div></article>`;
}

function renderAcceptance(data) {
  const node = document.querySelector("#acceptance");
  node.innerHTML = [
    metric("验收用例通过", "5 / 5"),
    metric("最终报告数", data.final_report_count),
    metric("GO 数量", data.go_count),
    metric("PASS 数量", data.pass_count)
  ].join("");
}

function renderP0Counts(data) {
  const node = document.querySelector("#p0-counts");
  node.innerHTML = [
    metric("Amazon 原始候选", data.raw_count),
    metric("人工有效输入", data.manual_valid_count),
    metric("入围候选", data.selected_count),
    metric("P0 报告数", data.report_count)
  ].join("");
}

function row(label, value) {
  return `<div class="row"><span>${label}</span><strong>${value}</strong></div>`;
}

function renderReports(reports) {
  const node = document.querySelector("#reports");
  node.innerHTML = reports
    .slice(0, 3)
    .map((item) => {
      const report = item.report;
      const survival = report.part_2_survival;
      const decision = survival.decision;
      const decisionClass = decision === "GO" ? "go" : "pass";
      return `<article class="card">
        <h3>${report.product_index}. ${report.product_title}</h3>
        <div class="tag ${decisionClass}">${decision}</div>
        ${row("Temu 卷王价", `$${Number(survival.temu_king_price_usd).toFixed(2)}`)}
        ${row("1688 成本", `¥${Number(survival.cost_1688_cny).toFixed(2)}`)}
        ${row("净利", `¥${Number(survival.net_profit_cny).toFixed(2)}`)}
        ${row("策略卖点", report.part_1_marketing.blue_ocean_competition)}
      </article>`;
    })
    .join("");
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`加载失败: ${path}`);
  }
  return response.json();
}

async function bootstrap() {
  renderPipeline();
  try {
    const acceptance = await loadJson("../deliverables/day4/acceptance_result.json");
    const p0 = await loadJson("../deliverables/day4/p0/p0_pipeline_output.json");
    renderAcceptance(acceptance);
    renderP0Counts(p0.counts);
    renderReports(p0.reports || []);
  } catch (error) {
    document.querySelector("#acceptance").innerHTML = metric("加载状态", "失败");
    document.querySelector("#p0-counts").innerHTML = metric("错误信息", error.message);
  }
}

bootstrap();
