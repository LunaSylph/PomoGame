import "./style.css";
import { createInitialState } from "./state";
import { SessionManager } from "./session";
import { isTileBuilt } from "./grid";
import { nextLumbermillCost, nextMineCost, canAfford, VILLAGE_CENTER_COST, type Cost } from "./resources";
import { canPlaceDecoration, DECORATION_COSTS } from "./decorations";
import type { Decoration } from "./state";

// İskelet: faz/zamanlayıcı + kaynak/bina mantığının test edilebildiği minimal bir arayüz.
// localStorage kaydı henüz yok — bir sonraki adım.
const state = createInitialState();
const session = new SessionManager(state);

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <div class="skeleton-notice">
    <h1>Orman Pomodoro</h1>
    <p>
      <label>
        <input type="checkbox" id="debug-toggle" />
        Debug modu (kısa süreler: 5s / 3s / 4s)
      </label>
    </p>
    <div id="timer" class="timer-display">00:00</div>
    <p id="status"></p>
    <p id="resources"></p>
    <div id="grid" class="grid"></div>
    <button id="start-btn">Başlat</button>
    <button id="switch-task-btn">Görev Değiştir</button>
    <button id="build-lumbermill-btn"></button>
    <button id="build-mine-btn"></button>
    <button id="build-village-btn"></button>
    <button id="decorate-fence-btn"></button>
    <button id="decorate-path-btn"></button>
    <button id="decorate-lamp-btn"></button>
    <button id="stop-btn">Durdur</button>
    <button id="reset-btn">Sıfırla</button>
    <p id="village-status" class="village-status"></p>
  </div>
`;

const timerEl = document.querySelector<HTMLDivElement>("#timer")!;
const gridEl = document.querySelector<HTMLDivElement>("#grid")!;
const statusEl = document.querySelector<HTMLParagraphElement>("#status")!;
const resourcesEl = document.querySelector<HTMLParagraphElement>("#resources")!;
const villageStatusEl = document.querySelector<HTMLParagraphElement>("#village-status")!;
const startBtn = document.querySelector<HTMLButtonElement>("#start-btn")!;
const switchTaskBtn = document.querySelector<HTMLButtonElement>("#switch-task-btn")!;
const buildLumbermillBtn = document.querySelector<HTMLButtonElement>("#build-lumbermill-btn")!;
const buildMineBtn = document.querySelector<HTMLButtonElement>("#build-mine-btn")!;
const buildVillageBtn = document.querySelector<HTMLButtonElement>("#build-village-btn")!;
const decorateFenceBtn = document.querySelector<HTMLButtonElement>("#decorate-fence-btn")!;
const decoratePathBtn = document.querySelector<HTMLButtonElement>("#decorate-path-btn")!;
const decorateLampBtn = document.querySelector<HTMLButtonElement>("#decorate-lamp-btn")!;
const stopBtn = document.querySelector<HTMLButtonElement>("#stop-btn")!;
const resetBtn = document.querySelector<HTMLButtonElement>("#reset-btn")!;
const debugToggle = document.querySelector<HTMLInputElement>("#debug-toggle")!;

debugToggle.addEventListener("change", () => {
  session.setDebugMode(debugToggle.checked);
});

startBtn.addEventListener("click", () => {
  session.startPomodoro();
});

switchTaskBtn.addEventListener("click", () => {
  const nextTask = state.session.currentTask === "wood" ? "stone" : "wood";
  session.switchTask(nextTask);
});

buildLumbermillBtn.addEventListener("click", () => {
  session.buildLumbermill();
});

buildMineBtn.addEventListener("click", () => {
  session.buildMine();
});

buildVillageBtn.addEventListener("click", () => {
  session.buildVillageCenter();
});

decorateFenceBtn.addEventListener("click", () => {
  session.buildDecoration("fence");
});

decoratePathBtn.addEventListener("click", () => {
  session.buildDecoration("path");
});

decorateLampBtn.addEventListener("click", () => {
  session.buildDecoration("lamp");
});

resetBtn.addEventListener("click", () => {
  session.resetPomodoroCount();
});

stopBtn.addEventListener("click", () => {
  session.stopToIdle();
});

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// phaseStartedAt her faz değişiminde güncellendiği için süre otomatik sıfırlanmış olur.
function updateTimer() {
  const { phaseStartedAt } = state.session;
  const elapsedMs = phaseStartedAt !== null ? Date.now() - phaseStartedAt : 0;
  timerEl.textContent = formatElapsed(elapsedMs);
}

const DECORATION_MARKERS: Record<Decoration, string> = { fence: "Ç", path: "Y", lamp: "L" };

function renderGrid() {
  // İki blueprint tile'ı aynı anda açığa çıkıyor (bkz. grid.ts revealBlueprints),
  // o yüzden hangisine bakılırsa bakılsın aynı sonucu verir.
  const blueprintsRevealed = state.buildings.lumbermill.blueprintRevealed;

  gridEl.innerHTML = state.grid.tiles
    .map((tile) => {
      let cssClass: string;
      if (tile.isSpecial && isTileBuilt(state, tile)) {
        cssClass = "tile-built"; // inşa edilmiş (pembe)
      } else if (tile.isSpecial && blueprintsRevealed) {
        cssClass = "tile-blueprint"; // görünür ama henüz inşa edilmemiş (sarı)
      } else if (tile.state === "cleared") {
        cssClass = "tile-cleared";
      } else {
        cssClass = "tile-closed";
      }
      const title = tile.decoration ? `${tile.id} · ${tile.decoration}` : tile.id;
      const marker = tile.decoration ? `<span class="tile-decoration">${DECORATION_MARKERS[tile.decoration]}</span>` : "";
      return `<div class="tile ${cssClass}" title="${title}">${marker}</div>`;
    })
    .join("");
}

// Süre yazısının rengi: pomodoro'da varsayılan (beyaz), shortBreak'te sarı, longBreak'te pembe.
function timerColorFor(phase: string): string {
  if (phase === "shortBreak") return "#ffb300";
  if (phase === "longBreak") return "#ec4899";
  return "";
}

function costLabel(cost: Cost): string {
  return `${cost.wood} odun + ${cost.stone} taş`;
}

// Bir bina/blueprint butonunu sadece longBreak'te ve maliyet varsa (max seviyede değilse) gösterir,
// kaynak yetersizse disabled bırakır.
function renderBuildButton(
  btn: HTMLButtonElement,
  label: string,
  cost: Cost | null,
  inLongBreak: boolean,
  levelText: string,
) {
  if (!inLongBreak || cost === null) {
    btn.style.display = "none";
    return;
  }
  btn.style.display = "inline-block";
  btn.textContent = `${label}${levelText} İnşa Et — ${costLabel(cost)}`;
  btn.disabled = !canAfford(state, cost);
}

const DECORATION_LABELS: Record<Decoration, string> = { fence: "Çit", path: "Yürüyüş Yolu", lamp: "Lamba" };

// Dekorasyon butonları da sadece longBreak'te görünür; seviye yok, tekrar tekrar satın alınabilir.
// Kaynak yetersizse ya da yerleştirilecek boş (dekorasyonsuz + cleared) tile kalmadıysa disabled.
function renderDecorationButton(btn: HTMLButtonElement, type: Decoration, inLongBreak: boolean) {
  if (!inLongBreak) {
    btn.style.display = "none";
    return;
  }
  const cost = DECORATION_COSTS[type];
  btn.style.display = "inline-block";
  btn.textContent = `${DECORATION_LABELS[type]} — ${costLabel(cost)}`;
  btn.disabled = !canAfford(state, cost) || !canPlaceDecoration(state);
}

function render() {
  const { phase, currentTask, pomodoroCount } = state.session;
  const { lumbermill, mine, villageCenter } = state.buildings;
  const inLongBreak = phase === "longBreak";

  statusEl.textContent = `Faz: ${phase} · Görev: ${currentTask} · Tamamlanan pomodoro: ${pomodoroCount} · Lumbermill Lv${lumbermill.level} · Mine Lv${mine.level}`;
  resourcesEl.textContent = `Odun: ${state.resources.wood} · Taş: ${state.resources.stone}`;

  startBtn.disabled = phase === "pomodoro";
  switchTaskBtn.disabled = phase !== "shortBreak" && phase !== "longBreak";
  stopBtn.disabled = phase === "idle";
  timerEl.style.color = timerColorFor(phase);

  renderBuildButton(buildLumbermillBtn, "Lumbermill", nextLumbermillCost(state), inLongBreak, ` (Lv${lumbermill.level}→${lumbermill.level + 1})`);
  renderBuildButton(buildMineBtn, "Mine", nextMineCost(state), inLongBreak, ` (Lv${mine.level}→${mine.level + 1})`);

  if (inLongBreak && villageCenter.unlocked && !villageCenter.built) {
    buildVillageBtn.style.display = "inline-block";
    buildVillageBtn.textContent = `Köy Merkezi İnşa Et — ${costLabel(VILLAGE_CENTER_COST)}`;
    buildVillageBtn.disabled = !canAfford(state, VILLAGE_CENTER_COST);
  } else {
    buildVillageBtn.style.display = "none";
  }

  villageStatusEl.textContent = villageCenter.built ? "Köy Merkezi inşa edildi!" : "";

  renderDecorationButton(decorateFenceBtn, "fence", inLongBreak);
  renderDecorationButton(decoratePathBtn, "path", inLongBreak);
  renderDecorationButton(decorateLampBtn, "lamp", inLongBreak);

  updateTimer();
  renderGrid();
}

session.onChange(render);
render();
setInterval(updateTimer, 250);
