import type { Decoration, GameState, ResourceTask } from "./state";
import { resetToNewGame } from "./state";
import { revealNearestClosedTile, revealBlueprints, checkMapCleared } from "./grid";
import {
  grantPomodoroYield,
  buildLumbermill as purchaseLumbermill,
  buildMine as purchaseMine,
  buildVillageCenter as purchaseVillageCenter,
} from "./resources";
import { buildDecoration as purchaseDecoration } from "./decorations";
import { saveState, clearSavedState } from "./persistence";

// Bu isimlerdeki fazların hepsinin bir süresi var, "idle"ın yok — o yüzden ayrı bir tip.
type TimedPhase = "pomodoro" | "shortBreak" | "longBreak";

// Gerçek süreler (docs/game-project-summary-v2.md Bölüm 3).
// longBreak dokümanda 15-30 dk aralığı olarak geçiyor, net değer verilmemiş — 20 dk varsayıldı.
const REAL_DURATIONS_MS: Record<TimedPhase, number> = {
  pomodoro: 25 * 60 * 1000,
  shortBreak: 5 * 60 * 1000,
  longBreak: 20 * 60 * 1000,
};

// Debug modu: gerçek süreler yerine test için kısa süreler.
const DEBUG_DURATIONS_MS: Record<TimedPhase, number> = {
  pomodoro: 5000,
  shortBreak: 3000,
  longBreak: 4000,
};

export type SessionListener = (state: GameState) => void;

export class SessionManager {
  private state: GameState;
  private debugMode = false;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private listeners: SessionListener[] = [];

  constructor(state: GameState) {
    this.state = state;
    this.resumeIfMidPomodoro();
  }

  setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
  }

  onChange(listener: SessionListener) {
    this.listeners.push(listener);
  }

  // localStorage'dan yüklenen state pomodoro fazındaysa (sayfa kapalıyken zamanlayıcı kaybolmuş
  // olabilir), kalan süreye göre zamanlayıcıyı yeniden kurar. Molalar zaten süresiz olduğu için
  // (bkz. beginTimedPhase) burada bir şey yapmaya gerek yok, yüklenen faz olduğu gibi kalır.
  private resumeIfMidPomodoro() {
    const { phase, phaseStartedAt, phaseDurationMs } = this.state.session;
    if (phase !== "pomodoro" || phaseStartedAt === null) return;

    const remaining = phaseDurationMs - (Date.now() - phaseStartedAt);
    if (remaining <= 0) {
      // Sayfa kapalıyken pomodoro süresi zaten dolmuş — hemen tamamla.
      setTimeout(() => this.onPhaseComplete(), 0);
    } else {
      this.timerId = setTimeout(() => this.onPhaseComplete(), remaining);
    }
  }

  private notify() {
    saveState(this.state);
    for (const listener of this.listeners) listener(this.state);
  }

  private durations() {
    return this.debugMode ? DEBUG_DURATIONS_MS : REAL_DURATIONS_MS;
  }

  // idle, shortBreak veya longBreak'ten pomodoro'ya geçer — sadece kullanıcı isteğiyle, otomatik değil.
  // Mola sırasında çağrılırsa molayı erken bitirir (mola süresi zorunlu değil, bkz. beginTimedPhase).
  startPomodoro() {
    if (this.state.session.phase === "pomodoro") return;
    this.beginTimedPhase("pomodoro");
  }

  // Sadece mola fazlarında (kısa/uzun) anlamlı; pomodoro sırasında görev sabittir.
  switchTask(task: ResourceTask) {
    const phase = this.state.session.phase;
    if (phase !== "shortBreak" && phase !== "longBreak") return;
    this.state.session.currentTask = task;
    this.notify();
  }

  destroy() {
    if (this.timerId !== null) clearTimeout(this.timerId);
  }

  // Üçü de sadece longBreak sırasında anlamlı; yetersiz kaynakta veya max seviyede sessizce no-op olur.
  buildLumbermill() {
    if (this.state.session.phase !== "longBreak") return;
    purchaseLumbermill(this.state);
    this.notify();
  }

  buildMine() {
    if (this.state.session.phase !== "longBreak") return;
    purchaseMine(this.state);
    this.notify();
  }

  buildVillageCenter() {
    if (this.state.session.phase !== "longBreak") return;
    purchaseVillageCenter(this.state);
    this.notify();
  }

  buildDecoration(type: Decoration) {
    if (this.state.session.phase !== "longBreak") return;
    purchaseDecoration(this.state, type);
    this.notify();
  }

  // Kayıtlı localStorage state'ini tamamen siler ve her şeyi (kaynaklar, binalar, grid, session,
  // meta) taze başlangıca döndürür — oyuncuya yönelik tek "baştan başlat" seçeneği bu.
  newGame() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    clearSavedState();
    resetToNewGame(this.state);
    this.notify();
  }

  // Herhangi bir fazdan çağrılabilir: aktif zamanlayıcıyı durdurur ve idle'a döner.
  stopToIdle() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.state.session.phase = "idle";
    this.state.session.phaseStartedAt = null;
    this.notify();
  }

  private beginTimedPhase(phase: TimedPhase) {
    const duration = this.durations()[phase];
    this.state.session.phase = phase;
    this.state.session.phaseStartedAt = Date.now();
    this.state.session.phaseDurationMs = duration; // sadece referans/gösterim için, mola fazlarında zorunlu değil

    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    // Sadece pomodoro otomatik biter. Molalar kullanıcı "Başlat"a basana kadar sürer —
    // erken bitirmek ya da uzatmak tamamen kullanıcı tercihi.
    if (phase === "pomodoro") {
      this.timerId = setTimeout(() => this.onPhaseComplete(), duration);
    }

    this.notify();
  }

  // Sadece pomodoro süresi dolunca çağrılır (molaların zamanlayıcısı yok).
  // Sayaç +1, kaynak kazanılır, bir tile açılır, harita bittiyse Köy Merkezi açılır,
  // ilk pomodoro'da blueprint'ler açığa çıkar, 4'e bölünüyorsa longBreak, değilse shortBreak başlar.
  private onPhaseComplete() {
    this.timerId = null;
    this.state.session.pomodoroCount += 1;
    grantPomodoroYield(this.state);
    revealNearestClosedTile(this.state);
    checkMapCleared(this.state);
    if (this.state.session.pomodoroCount === 1) {
      revealBlueprints(this.state);
    }
    const nextPhase: TimedPhase = this.state.session.pomodoroCount % 4 === 0 ? "longBreak" : "shortBreak";
    this.beginTimedPhase(nextPhase);
  }
}
