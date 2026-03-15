---
name: "skill-c-anti-involution-strategy"
description: "Generate Bundle, Premium, or Lightweight anti-price-war strategy per product. Invoke after Skill B for differentiated selling plans."
---

# Skill C 避卷策略生成器

用于为每个候选品生成唯一避卷策略，并输出可执行差异化卖点。

## 输入

JSON 对象：

- `candidates`: Skill B 筛选后的候选数组

## 输出

- `ok`
- `strategized`

每条包含：

- `anti_involution_strategy`：`Bundle` / `Premium` / `Lightweight`
- `differentiation_points`
- `bundle_or_variant_hint`

## 本地验证

```bash
node .trae/skills/skill-c-anti-involution-strategy/reference/test_strategy_generator.mjs
```
