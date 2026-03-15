---
name: "skill-a-trend-discovery"
description: "Discover rising Amazon-style product candidates with structured trend fields. Invoke when starting Day3 candidate sourcing before scoring and pricing."
---

# Skill A 趋势发现器

用于生成并筛选“近期飙升、有真实需求”的候选品，输出标准化候选结构给 Skill B。

## 输入

JSON 对象：

- `market`: 数据来源标识，默认 `amazon_movers`
- `candidates`: 可选，候选数组；不传时使用内置样例

## 输出

- `ok`
- `market`
- `generated_at`
- `candidates`
  - `product_id`
  - `product_name_cn`
  - `keyword_en`
  - `category`
  - `amazon_growth_score`
  - `demand_signal`
  - `red_ocean_risk`
  - `temu_price_anchor_usd`
  - `target_scene`
  - `amazon_heat_reason`

## 本地验证

```bash
node .trae/skills/skill-a-trend-discovery/reference/test_trend_discovery.mjs
```
