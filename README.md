# 选品智能体 Skills 交付说明（Claude Code）

本 README 仅保留题目交付要求需要的信息，按面试作业题目2 的要求对齐。

## 1. Skills 清单

- `skill-a-trend-discovery`
- `skill-b-gap-analyzer`
- `skill-c-anti-involution-strategy`
- `skill-d-sourcing-assistant`
- `skill-e-profit-gate`
- `skill-f-report-generator`

Skills 目录：`.trae/skills/`

## 2. 一行命令安装到 Claude Code

```bash
npx skills add yoann1231/vibe-coding-q2-huangjie@skill-a-trend-discovery -y && npx skills add yoann1231/vibe-coding-q2-huangjie@skill-b-gap-analyzer -y && npx skills add yoann1231/vibe-coding-q2-huangjie@skill-c-anti-involution-strategy -y && npx skills add yoann1231/vibe-coding-q2-huangjie@skill-d-sourcing-assistant -y && npx skills add yoann1231/vibe-coding-q2-huangjie@skill-e-profit-gate -y && npx skills add yoann1231/vibe-coding-q2-huangjie@skill-f-report-generator -y
```

如果环境要求显式指定 Agent：

```bash
npx skills add yoann1231/vibe-coding-q2-huangjie@skill-a-trend-discovery -y --agent claude-code && npx skills add yoann1231/vibe-coding-q2-huangjie@skill-b-gap-analyzer -y --agent claude-code && npx skills add yoann1231/vibe-coding-q2-huangjie@skill-c-anti-involution-strategy -y --agent claude-code && npx skills add yoann1231/vibe-coding-q2-huangjie@skill-d-sourcing-assistant -y --agent claude-code && npx skills add yoann1231/vibe-coding-q2-huangjie@skill-e-profit-gate -y --agent claude-code && npx skills add yoann1231/vibe-coding-q2-huangjie@skill-f-report-generator -y --agent claude-code
```

## 3. 安装后如何运行（自动调用）

在 Claude Code 对话中直接下达业务任务，由 Agent 自动调用 Skills。

推荐验收口令：

- “你是 loctek 公司的跨境电商战略顾问。请基于当前的 Amazon Movers & Shakers（飙升榜）趋势，结合 Temu 的全托管/JIT 模式和https://www.4supply.com/home的卖货模式，严格执行【Temu 选品参谋 V4.1】标准，为我筛选并推荐 5 款适合上架的产品。“


最终选品报告生成在当前项目文件夹目录中
- 单品生成器：输出 `./final_report.md`
- 多品汇总链路：输出 `./final_reports.md`

## 4. 数据真实性说明
因个人用户暂无法免费获取 Amazon Temu/4supply api 以获取实时数据，因此对数据真实性进行说明。
- 亚马逊数据：真实抓取（Skill A 实时抓取 Amazon Movers 页面）。
- Temu/4supply 数据：当前为策略估算或人工补录，不是官方接口实时抓取。
- 1688 数据：当前为人工询盘录入或样例成本，不是官方接口实时抓取。

## 5. 交付要求对照

| 题目要求 | 当前状态 | 对应材料 |
|---|---|---|
| 需求拆解为独立 Skills | 已完成 | `.trae/skills/` |
| 先调研再开发 | 已完成 | `需求与调研.md` |
| 按官方 Skill 标准并可自动调用 | 已完成 | 各 Skill `SKILL.md` |
| 提交到指定 GitHub 仓库个人分支 | 已 push | 分支：`main` |
| 支持一行命令安装 | 已完成 | 本 README 第 2 节 |
| 提交完整录屏 | 待录制 | 录屏文件 |
