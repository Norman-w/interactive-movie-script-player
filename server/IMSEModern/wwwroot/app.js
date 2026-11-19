const DRAFT_KEY = "imse-scene-map-draft-v1";
const state = {
  data: null,
  source: null,
  sourceKey: "staging-snapshot:scripts.json",
  resources: [],
  flowId: null,
  snippetId: null,
  trail: [],
  activeClipKey: null,
  clipStopAt: null,
  toastTimer: 0
};

const ui = {
  storyList: document.querySelector("#storyList"),
  storylineCount: document.querySelector("#storylineCount"),
  countsText: document.querySelector("#countsText"),
  statusText: document.querySelector("#statusText"),
  statusDot: document.querySelector(".status-dot"),
  activeStoryName: document.querySelector("#activeStoryName"),
  activeStoryHint: document.querySelector("#activeStoryHint"),
  mapFlowTitle: document.querySelector("#mapFlowTitle"),
  mapFlowSummary: document.querySelector("#mapFlowSummary"),
  sceneMap: document.querySelector("#sceneMap"),
  emptyMap: document.querySelector("#emptyMap"),
  trailWrap: document.querySelector("#trailWrap"),
  trail: document.querySelector("#trail"),
  backButton: document.querySelector("#backButton"),
  detailEmpty: document.querySelector("#detailEmpty"),
  detailContent: document.querySelector("#detailContent"),
  sceneIndex: document.querySelector("#sceneIndex"),
  sceneNameInput: document.querySelector("#sceneNameInput"),
  detailTags: document.querySelector("#detailTags"),
  clipTitle: document.querySelector("#clipTitle"),
  clipSubtitle: document.querySelector("#clipSubtitle"),
  playSnippetButton: document.querySelector("#playSnippetButton"),
  clipPoster: document.querySelector("#clipPoster"),
  clipVideo: document.querySelector("#clipVideo"),
  mediaNote: document.querySelector("#mediaNote"),
  startTimeInput: document.querySelector("#startTimeInput"),
  endTimeInput: document.querySelector("#endTimeInput"),
  routeContent: document.querySelector("#routeContent"),
  typeDetail: document.querySelector("#typeDetail"),
  statusStrip: document.querySelector("#statusStrip"),
  importButton: document.querySelector("#importButton"),
  importInput: document.querySelector("#importInput"),
  exportButton: document.querySelector("#exportButton"),
  resetButton: document.querySelector("#resetButton"),
  toast: document.querySelector("#toast")
};
ui.recoveryBanner = document.querySelector("#recoveryBanner");
ui.restoreDraftButton = document.querySelector("#restoreDraftButton");
ui.dismissDraftButton = document.querySelector("#dismissDraftButton");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function decodeSetting(text) {
  const trimmed = text.replace(/^\uFEFF/, "").trim();
  try {
    const direct = JSON.parse(trimmed);
    if (direct && typeof direct === "object" && typeof direct.SettingJson === "string") {
      return decodeSetting(direct.SettingJson);
    }
    if (direct && typeof direct === "object") return direct;
  } catch { /* The legacy settings file is usually URL-encoded JSON. */ }
  try {
    const decoded = decodeURIComponent(trimmed);
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed === "object") return parsed;
  } catch { /* Report one friendly import error below. */ }
  throw new Error("这份文件不是可识别的剧本设置 JSON。");
}

function formatTime(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return "—";
  const minutes = Math.floor(number / 60);
  const fixedSeconds = (number % 60).toFixed(number % 1 === 0 ? 0 : 1);
  const [wholeSeconds, fraction] = fixedSeconds.split(".");
  const seconds = `${wholeSeconds.padStart(2, "0")}${fraction ? `.${fraction}` : ""}`;
  return `${String(minutes).padStart(2, "0")}:${seconds}`;
}

function typeName(type) {
  if (type === "questionWithWaiter") return "互动片段";
  if (type === "transitions") return "过场片段";
  if (type === "info") return "说明片段";
  return type || "未标注类型";
}

function typeTone(type) {
  if (type === "transitions") return "is-transition";
  if (type === "info") return "is-info";
  return "";
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function entriesForFlow(flowId) {
  const snippets = state.data?.[flowId]?.snippets;
  if (!snippets || typeof snippets !== "object") return [];
  return Object.entries(snippets).sort((left, right) => {
    const a = Number(left[1]?.startTime);
    const b = Number(right[1]?.startTime);
    if (Number.isFinite(a) && Number.isFinite(b) && a !== b) return a - b;
    return Object.keys(snippets).indexOf(left[0]) - Object.keys(snippets).indexOf(right[0]);
  });
}

function allSnippetCount(data = state.data) {
  return Object.values(data || {}).reduce((sum, flow) =>
    sum + Object.keys(flow?.snippets || {}).length, 0);
}

function findTarget(flowId, snippet) {
  const reference = snippet?.transitionSnippetIndex ||
    (snippet?.redirect ? snippet?.redirectSnippetIndex : null);
  if (typeof reference !== "string" || !reference.trim()) return null;

  let parts;
  try { parts = decodeURIComponent(reference).split(".").filter(Boolean); }
  catch { parts = reference.split(".").filter(Boolean); }

  const explicitFlow = parts.find(part => state.data?.[part]?.snippets);
  const targetFlow = explicitFlow || flowId;
  const targetSnippets = state.data?.[targetFlow]?.snippets || {};
  const targetId = [...parts].reverse().find(part => Object.hasOwn(targetSnippets, part));
  if (!targetId) return null;
  return { flowId: targetFlow, snippetId: targetId, reference };
}

function currentSnippet() {
  return state.data?.[state.flowId]?.snippets?.[state.snippetId] || null;
}

function currentMovie(snippet) {
  const movieId = snippet?.movieId;
  return state.resources.find(resource => resource?.id === movieId) || null;
}

function renderStories() {
  ui.storyList.replaceChildren();
  const flows = Object.entries(state.data || {});
  ui.storylineCount.textContent = String(flows.length);
  flows.forEach(([flowId, flow], index) => {
    const count = Object.keys(flow?.snippets || {}).length;
    const card = element("button", `story-card${flowId === state.flowId ? " is-active" : ""}`);
    card.type = "button";
    card.dataset.tone = String(index % 4);
    card.setAttribute("aria-current", flowId === state.flowId ? "page" : "false");
    const orb = element("span", "story-orb", String(index + 1).padStart(2, "0"));
    const copy = element("span", "story-copy");
    copy.append(element("span", "story-name", flow?.name || flowId));
    copy.append(element("span", "story-meta", count ? `${count} 个片段 · 可直接进入` : "还没有片段"));
    const tally = element("span", "story-count", `${count}`);
    card.append(orb, copy, tally);
    card.addEventListener("click", () => {
      const first = entriesForFlow(flowId)[0];
      navigateTo(flowId, first?.[0] || null, true);
    });
    ui.storyList.append(card);
  });
}

function renderMap() {
  const flow = state.data?.[state.flowId];
  const scenes = entriesForFlow(state.flowId);
  ui.activeStoryName.textContent = flow?.name || "未选择故事线";
  ui.mapFlowTitle.textContent = flow?.name || "故事线地图";
  ui.mapFlowSummary.textContent = `${scenes.length} 个片段 · 选哪一段都可以`;
  ui.activeStoryHint.textContent = scenes.length
    ? "点任一片段查看详情；如果它有跳转，可以沿着跳转继续，也能随时换线。"
    : "这条线暂时没有片段，可以直接去其他故事线探索。";
  ui.sceneMap.replaceChildren();
  const connections = element("svg", "map-connections");
  connections.setAttribute("aria-hidden", "true");
  connections.innerHTML = '<defs><marker id="map-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M1 1 L6 4 L1 7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path></marker></defs>';
  ui.sceneMap.append(connections);
  ui.emptyMap.hidden = scenes.length !== 0;
  ui.sceneMap.hidden = scenes.length === 0;

  scenes.forEach(([snippetId, snippet], index) => {
    const node = element("button", `scene-node${snippetId === state.snippetId ? " is-selected" : ""}`);
    node.type = "button";
    node.dataset.sceneId = snippetId;
    if (snippetId === state.snippetId) node.setAttribute("aria-current", "true");
    const top = element("span", "node-top");
    top.append(element("span", "node-number", String(index + 1).padStart(2, "0")));
    top.append(element("span", `node-type ${typeTone(snippet?.type)}`, typeName(snippet?.type)));
    const name = element("strong", "node-name", snippet?.name || snippetId);
    const start = formatTime(snippet?.startTime);
    const end = formatTime(snippet?.endTime);
    const time = element("span", "node-time", `${start} — ${end}`);
    node.append(top, name, time);
    const target = findTarget(state.flowId, snippet);
    if (target) {
      const targetName = state.data?.[target.flowId]?.snippets?.[target.snippetId]?.name || target.snippetId;
      node.append(element("span", "node-link", `可转到 ${targetName}`));
    }
    node.addEventListener("click", () => navigateTo(state.flowId, snippetId, true));
    ui.sceneMap.append(node);
  });
  window.requestAnimationFrame(drawMapConnections);
}

function drawMapConnections() {
  const svg = ui.sceneMap.querySelector(".map-connections");
  if (!svg || ui.sceneMap.hidden) return;
  const bounds = ui.sceneMap.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  svg.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
  svg.replaceChildren(svg.querySelector("defs"));

  for (const [snippetId, snippet] of entriesForFlow(state.flowId)) {
    const target = findTarget(state.flowId, snippet);
    if (!target || target.flowId !== state.flowId) continue;
    const sourceNode = ui.sceneMap.querySelector(`[data-scene-id="${CSS.escape(snippetId)}"]`);
    const targetNode = ui.sceneMap.querySelector(`[data-scene-id="${CSS.escape(target.snippetId)}"]`);
    if (!sourceNode || !targetNode) continue;
    const sourceRect = sourceNode.getBoundingClientRect();
    const targetRect = targetNode.getBoundingClientRect();
    const sourceX = sourceRect.left - bounds.left + sourceRect.width / 2;
    const sourceY = sourceRect.top - bounds.top + sourceRect.height / 2;
    const targetX = targetRect.left - bounds.left + targetRect.width / 2;
    const targetY = targetRect.top - bounds.top + targetRect.height / 2;
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const sourceScale = Math.min(
      sourceRect.width * 0.46 / Math.max(Math.abs(dx), 0.001),
      sourceRect.height * 0.46 / Math.max(Math.abs(dy), 0.001)
    );
    const targetScale = Math.min(
      targetRect.width * 0.46 / Math.max(Math.abs(dx), 0.001),
      targetRect.height * 0.46 / Math.max(Math.abs(dy), 0.001)
    );
    const sx = sourceX + dx * sourceScale;
    const sy = sourceY + dy * sourceScale;
    const tx = targetX - dx * targetScale;
    const ty = targetY - dy * targetScale;
    const direction = dx >= 0 ? 1 : -1;
    const horizontalGap = Math.abs(tx - sx);
    const bend = Math.min(Math.max(10, horizontalGap * 0.32), Math.max(10, horizontalGap * 0.44));
    const path = element("path", `map-connection${snippetId === state.snippetId ? " is-active" : ""}`);
    path.setAttribute("d", `M ${sx} ${sy} C ${sx + direction * bend} ${sy}, ${tx - direction * bend} ${ty}, ${tx} ${ty}`);
    path.setAttribute("marker-end", "url(#map-arrow)");
    svg.append(path);
  }
}

function renderTrail() {
  ui.trail.replaceChildren();
  ui.trailWrap.hidden = state.trail.length === 0;
  ui.backButton.disabled = state.trail.length === 0;
  state.trail.forEach((item, index) => {
    const snippet = state.data?.[item.flowId]?.snippets?.[item.snippetId];
    const flow = state.data?.[item.flowId];
    const label = snippet?.name || flow?.name || item.snippetId || "空白线";
    const button = element("button", "trail-item", label);
    button.type = "button";
    button.title = `${flow?.name || item.flowId} / ${label}`;
    button.addEventListener("click", () => {
      state.flowId = item.flowId;
      state.snippetId = item.snippetId;
      state.trail = state.trail.slice(0, index);
      renderAll();
    });
    ui.trail.append(button);
  });
}

function renderDetails() {
  const snippet = currentSnippet();
  ui.detailEmpty.hidden = Boolean(snippet);
  ui.detailContent.hidden = !snippet;
  const scenePosition = entriesForFlow(state.flowId).findIndex(([id]) => id === state.snippetId) + 1;
  ui.sceneIndex.textContent = snippet
    ? `场景 ${String(scenePosition).padStart(2, "0")}`
    : "—";
  if (!snippet) {
    ui.clipVideo.pause();
    ui.clipVideo.removeAttribute("src");
    ui.clipVideo.load();
    ui.clipVideo.hidden = true;
    ui.clipPoster.hidden = false;
    state.activeClipKey = null;
    state.clipStopAt = null;
    return;
  }

  ui.sceneNameInput.value = snippet.name || "";
  ui.detailTags.replaceChildren();
  const typeDot = element("i", `tag-dot ${typeTone(snippet.type).replace("is-", "")}`);
  const typeTag = element("span", "tag");
  typeTag.append(typeDot, document.createTextNode(typeName(snippet.type)));
  ui.detailTags.append(typeTag);

  const movie = currentMovie(snippet);
  const clipKey = `${state.flowId}/${state.snippetId}`;
  if (state.activeClipKey !== clipKey) {
    ui.clipVideo.pause();
    ui.clipVideo.removeAttribute("src");
    ui.clipVideo.load();
    ui.clipVideo.hidden = true;
    ui.clipPoster.hidden = false;
    ui.playSnippetButton.textContent = "看这段";
    state.activeClipKey = clipKey;
  }
  const clipStart = Number(snippet.startTime);
  const clipEnd = Number(snippet.endTime);
  state.clipStopAt = Number.isFinite(clipEnd) && clipEnd > clipStart ? clipEnd : null;
  ui.playSnippetButton.disabled = !movie?.id;
  ui.playSnippetButton.textContent = movie?.id ? "看这段" : "暂无影片";
  ui.clipTitle.textContent = movie?.name || `影片 ${snippet.movieId || "未关联"}`;
  const clipSpan = `${formatTime(snippet.startTime)} — ${formatTime(snippet.endTime)}`;
  const movieDuration = Number(movie?.duration);
  ui.clipSubtitle.textContent = Number.isFinite(movieDuration)
    ? `${clipSpan} · 全片 ${formatTime(movieDuration)}`
    : clipSpan;
  ui.mediaNote.textContent = movie?.id
    ? `点开后从 ${formatTime(snippet.startTime)} 开始；到 ${formatTime(snippet.endTime)} 自动停下。`
    : "这段还没有关联影片，可以先沿路线继续或自由查看其他片段。";
  ui.startTimeInput.value = snippet.startTime ?? "";
  ui.endTimeInput.value = snippet.endTime ?? "";
  ui.typeDetail.textContent = `类型：${typeName(snippet.type)}`;

  ui.routeContent.replaceChildren();
  const target = findTarget(state.flowId, snippet);
  if (target) {
    const targetFlow = state.data?.[target.flowId];
    const targetSnippet = targetFlow?.snippets?.[target.snippetId];
    const card = element("button", "route-card");
    card.type = "button";
    const copy = element("span", "route-copy");
    copy.append(element("span", "route-label", target.flowId === state.flowId ? "沿当前故事线继续" : `转到「${targetFlow?.name || target.flowId}」`));
    copy.append(element("strong", "route-name", targetSnippet?.name || target.snippetId));
    card.append(copy, element("span", "route-arrow", "↗"));
    card.addEventListener("click", () => navigateTo(target.flowId, target.snippetId, true));
    ui.routeContent.append(card);
  } else {
    ui.routeContent.append(element("div", "route-muted", "这段没有写死下一步。想怎么走，由你自己选。"));
  }
  const freeExplore = element("button", "explore-card", "我想自己挑一段");
  freeExplore.type = "button";
  freeExplore.addEventListener("click", focusCurrentSceneOnMap);
  ui.routeContent.append(freeExplore);
}

function focusCurrentSceneOnMap() {
  const nextChoice = ui.sceneMap.querySelector(".scene-node:not(.is-selected)") ||
    ui.sceneMap.querySelector(".scene-node.is-selected");
  nextChoice?.scrollIntoView({ behavior: "smooth", block: "center" });
  nextChoice?.focus({ preventScroll: true });
}

function playCurrentSnippet() {
  const snippet = currentSnippet();
  const movie = currentMovie(snippet);
  if (!snippet || !movie?.id) return;
  const clipKey = `${state.flowId}/${state.snippetId}`;

  ui.clipVideo.hidden = false;
  ui.clipPoster.hidden = true;
  ui.mediaNote.textContent = "正在打开这段影片…";
  ui.playSnippetButton.textContent = "重新看这段";

  const startPlayback = () => {
    if (state.activeClipKey !== clipKey) return;
    const start = Number(snippet.startTime);
    const duration = Number.isFinite(ui.clipVideo.duration) ? ui.clipVideo.duration : start;
    ui.clipVideo.currentTime = Math.max(0, Math.min(Number.isFinite(start) ? start : 0, duration));
    ui.mediaNote.textContent = `正在预览 ${formatTime(snippet.startTime)} 到 ${formatTime(snippet.endTime)}。`;
    const playResult = ui.clipVideo.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(() => { ui.mediaNote.textContent = "影片已准备好，点播放器中的播放键继续。"; });
    }
  };

  if (ui.clipVideo.dataset.resourceId !== movie.id || ui.clipVideo.readyState < 1) {
    ui.clipVideo.pause();
    ui.clipVideo.dataset.resourceId = movie.id;
    ui.clipVideo.addEventListener("loadedmetadata", startPlayback, { once: true });
    ui.clipVideo.addEventListener("error", () => {
      if (state.activeClipKey !== clipKey) return;
      ui.clipVideo.hidden = true;
      ui.clipPoster.hidden = false;
      ui.mediaNote.textContent = "这段影片暂时无法读取。";
      ui.playSnippetButton.textContent = "重试载入";
    }, { once: true });
    ui.clipVideo.src = `/media/${encodeURIComponent(movie.id)}`;
    ui.clipVideo.load();
  } else {
    startPlayback();
  }
}

function renderStatus() {
  const dirty = JSON.stringify(state.data) !== JSON.stringify(state.source);
  const flowCount = Object.keys(state.data || {}).length;
  const snippetCount = allSnippetCount();
  ui.countsText.textContent = `${flowCount} 条故事线 · ${snippetCount} 个片段`;
  ui.statusText.textContent = dirty ? "本机草稿有更新" : "正在查看已导入的原稿";
  ui.statusDot.classList.toggle("is-dirty", dirty);
  ui.exportButton.disabled = !state.data;
  ui.resetButton.disabled = !dirty;
}

function renderAll() {
  renderStories();
  renderMap();
  renderTrail();
  renderDetails();
  renderStatus();
}

function navigateTo(flowId, snippetId, rememberCurrent) {
  if (rememberCurrent && state.flowId) {
    state.trail.push({ flowId: state.flowId, snippetId: state.snippetId });
    if (state.trail.length > 12) state.trail.shift();
  }
  state.flowId = flowId;
  state.snippetId = snippetId;
  renderAll();
}

function persistDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      sourceKey: state.sourceKey,
      data: state.data,
      source: state.source,
      savedAt: new Date().toISOString()
    }));
    showToast("这次修改已留在当前浏览器里。导出后才会生成设置文件。");
  } catch {
    showToast("浏览器没有可用的本机存储空间；请及时导出草稿。");
  }
  renderMap();
  renderStories();
  renderStatus();
}

function setField(field, rawValue) {
  const snippet = currentSnippet();
  if (!snippet) return;
  const previous = snippet[field];
  if (field === "startTime" || field === "endTime") {
    if (rawValue === "") snippet[field] = typeof previous === "string" ? "" : null;
    else if (typeof previous === "string") snippet[field] = rawValue;
    else snippet[field] = Number(rawValue);
  } else {
    snippet[field] = rawValue;
  }
  persistDraft();
  renderDetails();
}

function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add("is-visible");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => ui.toast.classList.remove("is-visible"), 2600);
}

function fileContentsForExport() {
  return encodeURIComponent(JSON.stringify(state.data));
}

function exportDraft() {
  const blob = new Blob([fileContentsForExport()], { type: "text/plain;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  link.href = href;
  link.download = `scripts-draft-${stamp}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
  showToast("已导出服务兼容格式。文件已下载到这台电脑。");
}

async function importFile(file) {
  const parsed = decodeSetting(await file.text());
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("剧本需要是由故事线组成的 JSON 对象。");
  }
  state.data = parsed;
  state.source = clone(parsed);
  state.sourceKey = `import:${file.name}:${file.size}:${file.lastModified}`;
  state.flowId = Object.keys(parsed)[0] || null;
  state.snippetId = entriesForFlow(state.flowId)[0]?.[0] || null;
  state.trail = [];
  persistDraft();
  renderAll();
  showToast(`已打开「${file.name}」，原文件保持不变。`);
}

async function loadSettings(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`读取脚本地图失败（HTTP ${response.status}）。`);
  return decodeSetting(await response.text());
}

async function start() {
  try {
    const [scripts, resources] = await Promise.all([
      loadSettings("/data/scripts.json"),
      loadSettings("/data/movieResources.json")
    ]);
    if (!scripts || typeof scripts !== "object" || Array.isArray(scripts)) {
      throw new Error("脚本设置不是故事线对象。");
    }
    state.source = clone(scripts);
    state.data = clone(scripts);
    state.resources = Array.isArray(resources) ? resources : [];
    const firstFlow = Object.keys(scripts)[0] || null;
    state.flowId = firstFlow;
    state.snippetId = entriesForFlow(firstFlow)[0]?.[0] || null;

    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (saved?.sourceKey === state.sourceKey && saved?.data && typeof saved.data === "object") {
        state.data = saved.data;
        showToast("已接着上次的本机草稿继续浏览。");
      } else if (saved?.data && typeof saved.data === "object") {
        ui.recoveryBanner.hidden = false;
        ui.restoreDraftButton.onclick = () => {
          state.data = saved.data;
          state.source = saved.source && typeof saved.source === "object" ? saved.source : clone(saved.data);
          state.sourceKey = saved.sourceKey || "recovered-local-draft";
          state.flowId = Object.keys(state.data)[0] || null;
          state.snippetId = entriesForFlow(state.flowId)[0]?.[0] || null;
          state.trail = [];
          ui.recoveryBanner.hidden = true;
          renderAll();
          showToast("已打开这份本机草稿，原始数据没有覆盖。");
        };
        ui.dismissDraftButton.onclick = () => { ui.recoveryBanner.hidden = true; };
      }
    } catch {
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* Continue with the source snapshot. */ }
    }

    renderAll();
  } catch (error) {
    ui.statusText.textContent = "脚本地图暂时没有载入";
    ui.countsText.textContent = "请检查数据文件后刷新页面";
    ui.sceneMap.hidden = true;
    ui.emptyMap.hidden = false;
    ui.emptyMap.querySelector("strong").textContent = "没有载入故事线";
    ui.emptyMap.querySelector("p").textContent = error.message || "稍后重试，或导入一份设置文件。";
  }
}

ui.backButton.addEventListener("click", () => {
  const previous = state.trail.pop();
  if (!previous) return;
  state.flowId = previous.flowId;
  state.snippetId = previous.snippetId;
  renderAll();
});

ui.playSnippetButton.addEventListener("click", playCurrentSnippet);
ui.clipVideo.addEventListener("timeupdate", () => {
  if (state.clipStopAt === null || ui.clipVideo.currentTime < state.clipStopAt) return;
  ui.clipVideo.pause();
  ui.clipVideo.currentTime = state.clipStopAt;
});
window.addEventListener("resize", () => window.requestAnimationFrame(drawMapConnections));

ui.sceneNameInput.addEventListener("change", event => setField("name", event.target.value));
ui.startTimeInput.addEventListener("change", event => setField("startTime", event.target.value));
ui.endTimeInput.addEventListener("change", event => setField("endTime", event.target.value));
ui.importButton.addEventListener("click", () => ui.importInput.click());
ui.importInput.addEventListener("change", async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  try { await importFile(file); }
  catch (error) { showToast(error.message || "无法导入这份设置文件。"); }
  finally { event.target.value = ""; }
});
ui.exportButton.addEventListener("click", exportDraft);
ui.resetButton.addEventListener("click", () => {
  if (!state.source || !state.data) return;
  state.data = clone(state.source);
  state.trail = [];
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* The reset still applies in memory. */ }
  renderAll();
  showToast("已恢复到本次导入时的原稿。");
});

start();
