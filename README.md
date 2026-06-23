# Interactive Movie Script Player / 互动电影脚本播放器

[English](#english) · [中文](#中文)

---

## English

### Overview

**IMSE (Interactive Movie Script Editor)** is a visual editor for building interactive video-based workflows — setup wizards, operation guides, onboarding flows, and more. Scripts created in the editor drive a **script movie player** that lets users complete tasks step by step, as if playing a game.

### Features

- **Visual script editor** — add videos, define nodes and snippets on a timeline
- **Interactive movie player** — play video segments and trigger user interactions at key moments
- **Script processor** — maps script snippets to interactive UI components (forms, selectors, rules, etc.)
- **Cloud save / load** — persist and restore script projects
- **Preview mode** — test the full interactive flow before deployment

### Tech Stack

- React 18 · TypeScript · Create React App
- [Ant Design](https://ant.design/) · [video-react](https://video-react.js.org/)
- [draggable-time-selector](https://www.npmjs.com/package/draggable-time-selector) · SweetAlert2

### Requirements

- **Node.js** 18.x (18.7.0 recommended)
- **Yarn** 1.x (preferred; this repo tracks `yarn.lock`)

### Getting Started

```bash
# Install dependencies
yarn install

# Start development server (http://localhost:3000)
yarn start

# Production build
yarn build

# Run tests
yarn test
```

If you use npm instead of Yarn, pass `--legacy-peer-deps` because `video-react` declares a React 17 peer dependency:

```bash
npm install --legacy-peer-deps
npm start
```

### Project Structure

```
src/
├── editor/          # Script editor UI (InteractiveMovieScriptEditor, SnippetEditor, …)
├── player/          # Interactive movie player (InteractiveMovieScriptPlayer, …)
├── processor/       # Script → interaction component mapping (QPScriptProcessor)
├── component/       # Shared UI components
└── utils/           # Helpers (JSON viewer, utilities)
```

### License

Private project — see repository owner for usage terms.

---

## 中文

### 简介

**IMSE（Interactive Movie Script Editor，互动电影脚本编辑器）** 是一款可视化编辑器，用于构建基于视频的互动流程——例如安装向导、操作说明、新手引导等。在编辑器中编排的脚本会驱动**脚本电影播放器**，让用户像玩游戏一样逐步完成任务。

### 功能

- **可视化脚本编辑** — 添加视频素材，在时间轴上定义节点与片段
- **互动电影播放** — 按片段播放视频，在关键节点触发用户交互
- **脚本处理器** — 将脚本片段映射为交互组件（表单、选择器、规则配置等）
- **云保存 / 云读取** — 持久化与恢复脚本项目
- **预览模式** — 部署前完整体验互动流程

### 技术栈

- React 18 · TypeScript · Create React App
- [Ant Design](https://ant.design/) · [video-react](https://video-react.js.org/)
- [draggable-time-selector](https://www.npmjs.com/package/draggable-time-selector) · SweetAlert2

### 环境要求

- **Node.js** 18.x（推荐 18.7.0）
- **Yarn** 1.x（推荐；本仓库使用 `yarn.lock` 管理依赖）

### 快速开始

```bash
# 安装依赖
yarn install

# 启动开发服务器（http://localhost:3000）
yarn start

# 生产构建
yarn build

# 运行测试
yarn test
```

若使用 npm 而非 Yarn，需加 `--legacy-peer-deps`（`video-react` 的 peer 依赖声明为 React 17）：

```bash
npm install --legacy-peer-deps
npm start
```

### 项目结构

```
src/
├── editor/          # 脚本编辑器（InteractiveMovieScriptEditor、SnippetEditor 等）
├── player/          # 互动电影播放器（InteractiveMovieScriptPlayer 等）
├── processor/       # 脚本 → 交互组件映射（QPScriptProcessor）
├── component/       # 共享 UI 组件
└── utils/           # 工具（JSON 查看器、通用方法等）
```

### 许可

私有项目 — 使用条款请联系仓库所有者。
