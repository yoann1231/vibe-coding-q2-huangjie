---
name: "skill-f-report-generator"
description: "Generate V4.1 product recommendation reports with fixed two-part structure. Invoke when outputting final product cards from Skill E results."
---

# Skill F 报告生成器

用于按题目固定格式生成推荐报告，输入候选品信息与 Skill E 核价结果，输出结构化结果与可读文本。

## 适用时机

- 需要输出最终候选品推荐卡片时
- 已获得 Skill E 的 `GO/PASS` 核价结果时
- 需要统一报告字段给验收、录屏或交付材料时

## 输入

输入为 JSON 对象，包含：

- `product`: 产品基础信息
- `marketing`: 前端营销逻辑字段
- `profit`: Skill E 输出中的 `metrics` 与 `decision`

参考 [schema.input.json](./reference/schema.input.json)。

## 输出

输出结构化 JSON，包含：

- `report`: 标准化字段结果
- `report_markdown`: 可直接展示的双段式文案

参考 [schema.output.json](./reference/schema.output.json)。

## 结构规则

- 第一部分：前端营销逻辑（亚马逊热度、蓝海竞争、安全合规、义乌或工厂找货指令）
- 第二部分：后端生存逻辑（Temu 卷王价、收入预估、成本核算、净利与 GO/PASS）
- `decision = GO` 时输出“推荐”，否则输出“不推荐”

## 强制约束

- 必须返回 `report_markdown` 字段，不允许为空字符串
- `report_markdown` 必须为标准 Markdown 文本，可直接写入 `.md` 文件
- `report_markdown` 必须同时包含“第一部分：前端营销逻辑”和“第二部分：后端生存逻辑”
- 交付阶段默认以 Markdown 报告作为最终可读产物
- 命令行调用时默认落盘到当前目录：单品 `./final_report.md`，多品 `./final_reports.md`

## 与 Skill E 串联

最小闭环脚本已提供：

```bash
node .trae/skills/skill-f-report-generator/reference/run_minimal_loop.mjs
```

该脚本会先调用 Skill E 计算，再生成 Skill F 报告样例。

## 本地验证

```bash
node .trae/skills/skill-f-report-generator/reference/test_report_generator.mjs
```
