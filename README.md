<div align="center">

# BitMind Lite
> 基于 Bitcoin L2 + x402 的双 Agent 付费协作演示项目

![Version](https://img.shields.io/badge/version-0.1.0-blue?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)

__简体中文__ | [English](./README_EN.md)

</div>

## 项目简介

BitMind Lite 展示了一个“Agent Economy”最小闭环：用户向 Agent 发起问题，Agent 在需要时可通过 x402 协议付费调用另一个 Agent 完成协作。

- Agent 1: `Crypto Agent`（加密市场 / DeFi）
- Agent 2: `Code Agent`（Solidity / 编程开发）
- 关键链路: `User -> Crypto Agent -> Code Agent`

## 界面截图（含说明）

> 所有截图均来自真实运行的本地应用（localhost），非模拟图。

| 页面 | 截图 | 说明 |
|------|------|------|
| 首页 | ![BitMind 首页，展示双 Agent 卡片与协作流程](./docs/assets/home.png) | 图 1：项目入口页，展示两个 Agent 的身份卡片、核心卖点与协作路径。 |
| Crypto 聊天页 | ![Crypto Agent 聊天页，包含消息区与输入区](./docs/assets/chat-crypto.png) | 图 2：`/chat/crypto` 页面，用户向 Crypto Agent 提问并查看协作返回结果。 |
| Code 聊天页 | ![Code Agent 聊天页，包含消息区与输入区](./docs/assets/chat-code.png) | 图 3：`/chat/code` 页面，用于代码类问题咨询和示例输出展示。 |

## 核心功能

1. 双 Agent 自动协作
- 主 Agent 识别“超出自身专业范围”的问题后，自动转给另一个 Agent。

2. x402 支付保护
- API 路由支持 x402 资源保护（可通过配置开关控制演示模式/支付模式）。

3. 安全与健壮性
- 输入清洗、消息长度限制、请求体大小限制。
- Agent API 速率限制（超限返回 `429`，包含 `Retry-After`）。
- 统一健康检查接口：`GET /api/health`。

4. 可执行测试门禁
- `lint + typecheck + unit + build + smoke + api contract` 全链路验证。

## 技术栈

- Next.js 16 + TypeScript + Tailwind CSS
- RainbowKit + wagmi + viem
- x402 (`@x402/next`, `@x402/fetch`)
- Vercel AI SDK（OpenAI / Anthropic / Mock）

## 快速开始

```bash
pnpm install
cp .env.local.example .env.local
pnpm dev
```

打开 `http://127.0.0.1:3000`。

## 测试与质量门禁

```bash
# 静态检查
pnpm run lint
pnpm run typecheck

# 单元测试
pnpm run test:unit

# 构建
pnpm run build

# 冒烟测试（首页 + 核心 API）
pnpm run test:smoke

# API 合约测试（成功 + 失败分支）
pnpm run test:api

# 一键全量验证
pnpm run verify
```

## 文档截图更新

```bash
# 1) 启动本地应用
pnpm dev

# 2) 另开终端生成 README 截图
pnpm run docs:screenshots
```

截图输出目录：`docs/assets/`

## 关键接口

- `POST /api/agent/crypto`
- `POST /api/agent/code`
- `GET /api/health`

## 环境变量

| 变量 | 说明 |
|------|------|
| `OPENAI_API_KEY` | OpenAI API Key |
| `ANTHROPIC_API_KEY` | Anthropic API Key |
| `X402_ENABLED` | 是否启用 x402 支付保护（`true/false`） |
| `X402_PAY_TO` | x402 收款地址 |
| `MAX_REQUEST_BYTES` | API 请求体大小上限（默认 `16384`） |
| `MAX_MESSAGE_CHARS` | 消息长度上限（默认 `4000`） |
| `AGENT_RATE_LIMIT_MAX_REQUESTS` | 每个 `agent + client` 在窗口内允许的最大请求数（默认 `30`） |
| `AGENT_RATE_LIMIT_WINDOW_MS` | 限流窗口时长毫秒数（默认 `60000`） |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect 项目 ID |
