---
name: "skill-e-profit-gate"
description: "Calculate V4.1 profitability and return GO/PASS with structured output. Invoke when evaluating candidate product pricing, margins, or boundary cases."
---

# Skill E 利润闸门（V4.1）

用于统一执行 V4.1 倒推核价并输出 GO/PASS，避免口径不一致。

## 适用时机

- 需要判断某个候选品是否满足净利润铁律时
- 需要复核边界值（如 4.99 / 5.01）时
- 需要给 Skill F 提供统一核价字段时

## 输入

输入为 JSON 对象，字段如下：

- `temu_king_price_usd`：Temu 同类卷王价（USD）
- `cost_1688_cny`：1688 拿货价（CNY）
- `exchange_rate_cny_per_usd`：汇率，默认 `7.2`
- `fulfillment_fee_cny`：国内履约费，默认 `3.5`

参考 [schema.input.json](./reference/schema.input.json)。

## 计算规则

- 收入预估（USD）=`temu_king_price_usd × 0.45`
- 收入预估（CNY）=`收入预估（USD）× exchange_rate_cny_per_usd`
- 总成本（CNY）=`cost_1688_cny + fulfillment_fee_cny`
- 净利润（CNY）=`收入预估（CNY）-总成本（CNY）`
- 判定：`net_profit_cny > 5` 为 `GO`，否则为 `PASS`

## 输出

输出结构化 JSON，包含：

- `ok`：是否成功
- `decision`：`GO` 或 `PASS`
- `metrics`：完整核价过程字段
- `rule`：固定规则口径与阈值

参考 [schema.output.json](./reference/schema.output.json)。

## 错误处理

参数缺失或类型错误时，返回：

- `ok: false`
- `error.code`
- `error.message`
- `error.missing_fields` 或 `error.invalid_fields`

## 本地验证

执行：

```bash
node .trae/skills/skill-e-profit-gate/reference/test_profit_gate.mjs
```
