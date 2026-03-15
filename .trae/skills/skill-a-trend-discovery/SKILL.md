---
name: "skill-a-trend-discovery"
description: "Discover rising Amazon-style product candidates with structured trend fields. Invoke when starting Day3 candidate sourcing before scoring and pricing."
---

# Skill A 趋势发现器

用于生成并筛选“近期飙升、有真实需求”的候选品，输出标准化候选结构给 Skill B。

## 输入

JSON 对象：

- `market`: 数据来源标识，默认 `amazon_movers`
- `use_live_fetch`: 可选，默认 `true`，实时抓取 Amazon Movers 页面并生成候选
- `limit`: 可选，实时抓取条数上限，默认 `20`
- `candidates`: 仅用于离线测试；生产调用不应依赖该字段

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

实时抓取验证：

```bash
node .trae/skills/skill-a-trend-discovery/reference/trend_discovery.mjs '{"use_live_fetch":true,"limit":20}'
```

离线测试（仅测试场景）：

```bash
node .trae/skills/skill-a-trend-discovery/reference/trend_discovery.mjs '{"use_live_fetch":false,"candidates":[{"product_id":"A-900","product_name_cn":"测试品","keyword_en":"test","category":"test","amazon_growth_score":90,"demand_signal":80,"red_ocean_risk":20,"temu_price_anchor_usd":9,"target_scene":"测试场景","amazon_heat_reason":"测试原因"}]}'
```
