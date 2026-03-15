---
name: "skill-b-gap-analyzer"
description: "Score Temu and 4supply opportunity gaps and filter low-opportunity products. Invoke after Skill A before anti-involution strategy generation."
---

# Skill B 空档分析器

用于评估候选品在 Temu/4supply 的切入机会并输出机会等级。

## 输入

JSON 对象：

- `candidates`: Skill A 输出候选数组
- `threshold`: 可选，最小通过分，默认 `60`

## 输出

- `ok`
- `threshold`
- `evaluated`
- `selected`

每个评估项包含：

- `product_id`
- `opportunity_score`
- `opportunity_level`
- `gap_reason`

## 本地验证

```bash
node .trae/skills/skill-b-gap-analyzer/reference/test_gap_analyzer.mjs
```
