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
npx skills add global-ecom-skills/global-ecom-skills@skill-a-trend-discovery -y && npx skills add global-ecom-skills/global-ecom-skills@skill-b-gap-analyzer -y && npx skills add global-ecom-skills/global-ecom-skills@skill-c-anti-involution-strategy -y && npx skills add global-ecom-skills/global-ecom-skills@skill-d-sourcing-assistant -y && npx skills add global-ecom-skills/global-ecom-skills@skill-e-profit-gate -y && npx skills add global-ecom-skills/global-ecom-skills@skill-f-report-generator -y
```

如果环境要求显式指定 Agent：

```bash
npx skills add global-ecom-skills/global-ecom-skills@skill-a-trend-discovery -y --agent claude-code && npx skills add global-ecom-skills/global-ecom-skills@skill-b-gap-analyzer -y --agent claude-code && npx skills add global-ecom-skills/global-ecom-skills@skill-c-anti-involution-strategy -y --agent claude-code && npx skills add global-ecom-skills/global-ecom-skills@skill-d-sourcing-assistant -y --agent claude-code && npx skills add global-ecom-skills/global-ecom-skills@skill-e-profit-gate -y --agent claude-code && npx skills add global-ecom-skills/global-ecom-skills@skill-f-report-generator -y --agent claude-code
```

## 3. 安装后如何运行（自动调用）

安装完成后，不需要手工 `node` 命令。  
在 Claude Code 对话中直接下达业务任务，由 Agent 自动调用 Skills。

推荐验收口令：

- “按 Amazon → Temu/4supply → 1688 的流程，输出 5 个候选并给出最终推荐报告。”
- “按 V4.1 核价铁律，净利小于等于 5 的全部 PASS，并返回 GO/PASS 明细。”
- “每个候选必须采用 Bundle、Premium、Lightweight 三选一避卷策略。”

## 4. 交付要求对照（L98-L107）

| 题目要求 | 当前状态 | 对应材料 |
|---|---|---|
| 需求拆解为独立 Skills | 已完成 | `.trae/skills/` |
| 先调研再开发 | 已完成 | `需求与调研.md` |
| 按官方 Skill 标准并可自动调用 | 已完成 | 各 Skill `SKILL.md` |
| 提交到指定 GitHub 仓库个人分支 | 待你 push | 分支：`skills-suite-huangjie` |
| 支持一行命令安装 | 已完成 | 本 README 第 2 节 |
| 提交完整录屏 | 待你录制 | 录屏文件 |

## 5. 已产出交付文件

- `deliverables/day4/acceptance_result.json`
- `deliverables/day4/final_reports.json`
- `deliverables/day4/final_reports.md`
- `deliverables/day4/install_and_branch.md`
