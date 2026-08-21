import "./style.css";
import { createInitialState } from "./state";
import { SessionManager } from "./session";

// İskelet: faz/zamanlayıcı mantığı + tile grid'in placeholder render'ı için minimal butonlar.
// Kaynak sayacı, bina inşası yok — bunlar sıradaki adımlar.
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
    <div id="grid" class="grid"></div>
    <button id="start-btn">Başlat</button>
    <button id="switch-task-btn">Görev Değiştir</button>
    <button id="build-btn">İnşaa Et</button>
    <button id="stop-btn">Durdur</button>
    <button id="reset-btn">Sıfırla</button>
  </div>
`;

const timerEl = document.querySelector<HTMLDivElement>("#timer")!;
const gridEl = document.querySelector<HTMLDivElement>("#grid")!;
const statusEl = document.querySelector<HTMLParagraphElement>("#status")!;
const startBtn = document.querySelector<HTMLButtonElement>("#start-btn")!;
const switchTaskBtn = document.querySelector<HTMLButtonElement>("#switch-task-btn")!;
const buildBtn = document.querySelector<HTMLButtonElement>("#build-btn")!;
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

buildBtn.addEventListener("click", () => {
  // Bina mantığı henüz yok — sıradaki adımda eklenecek.
  console.log("İnşaa Et tıklandı (henüz bina mantığı yok)");
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

function renderGrid() {
  // İki blueprint tile'ı aynı anda açığa çıkıyor (bkz. grid.ts revealBlueprints),
  // o yüzden hangisine bakılırsa bakılsın aynı sonucu verir.
  const blueprintsRevealed = state.buildings.lumbermill.blueprintRevealed;

  gridEl.innerHTML = state.grid.tiles
    .map((tile) => {
      const isBlueprint = tile.isSpecial && blueprintsRevealed;
      const cssClass = isBlueprint ? "tile-blueprint" : tile.state === "cleared" ? "tile-cleared" : "tile-closed";
      return `<div class="tile ${cssClass}" title="${tile.id}"></div>`;
    })
    .join("");
}

function render() {
  const { phase, currentTask, pomodoroCount } = state.session;
  statusEl.textContent = `Faz: ${phase} · Görev: ${currentTask} · Tamamlanan pomodoro: ${pomodoroCount}`;

  startBtn.disabled = phase === "pomodoro";
  switchTaskBtn.disabled = phase !== "shortBreak" && phase !== "longBreak";
  buildBtn.style.display = phase === "longBreak" ? "inline-block" : "none";
  stopBtn.disabled = phase === "idle";
  updateTimer();
  renderGrid();
}

session.onChange(render);
render();
setInterval(updateTimer, 250);
