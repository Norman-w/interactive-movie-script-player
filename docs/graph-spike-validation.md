# IMSE 流程图 Spike 验证清单

Spike 使用 `@xyflow/react` + `dagre` 实现蓝图式流程图编辑。

## 如何试用

1. `yarn install && yarn start`
2. 云读取脚本后，在右侧选择一个脚本
3. 切换到 **流程图** Tab
4. 从节点右侧绿色端口（flow-out）拖到目标节点左侧蓝色端口（flow-in）建立 redirect 连线
5. 点击 **开始预览**，下方播放器与上方节点高亮联动
6. **预览** 按钮会跳转到流程图 Tab

## 验证项

| 检查项 | 预期 |
|--------|------|
| 云读取后打开流程图 Tab | 当前脚本片段显示为节点；redirect 实线、transition 虚线 |
| flow-out → flow-in 连线 | 写回 `redirectSnippetIndex`，`actionAtEnd` = `redirect` |
| 删除 redirect 边 | 清除对应 `redirectSnippetIndex` |
| 开始预览 | 当前片段节点高亮，入边 animated |
| 云保存后再读取 | 连线关系保留 |
| 时间轴 Tab | 原有 SnippetEditor 仍可用 |

## 模块结构

- `src/graph/scriptsToFlow.ts` — 脚本 → 节点/边 + dagre 布局
- `src/graph/applyFlowConnection.ts` — 连线写回 scripts
- `src/graph/ScriptFlowPanel.tsx` — 画布 + 分屏预览
- `src/graph/nodes/SnippetNode.js` — 自定义节点与端口

## Spike 未做

- `transitionSnippetIndex` 可编辑连线
- Interaction 节点化
- 节点坐标持久化（刷新后重新 dagre 布局）
