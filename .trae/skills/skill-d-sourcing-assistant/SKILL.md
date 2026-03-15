---
name: "skill-d-sourcing-assistant"
description: "Generate 1688 sourcing keywords, inquiry script, and cost estimate for each candidate. Invoke after Skill C before Skill E pricing gate."
---

# Skill D 供货助手

用于补全 1688 找货关键词、询盘话术、避坑点与成本估算，输出给 Skill E 核价。

## 输入

JSON 对象：

- `candidates`: Skill C 输出候选数组

## 输出

- `ok`
- `sourced`

每条包含：

- `supplier_keywords_1688`
- `inquiry_script`
- `risk_checklist`
- `cost_1688_cny`

## 本地验证

```bash
node .trae/skills/skill-d-sourcing-assistant/reference/test_sourcing_assistant.mjs
```
