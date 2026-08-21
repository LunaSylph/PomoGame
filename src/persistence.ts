import type { GameState } from "./state";
import { CURRENT_SCHEMA_VERSION } from "./state";

const STORAGE_KEY = "orman-pomodoro:save";

// Her state değişikliğinde SessionManager.notify() tarafından çağrılır.
export function saveState(state: GameState): void {
  state.meta.lastSavedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Kayıt yoksa, bozuksa (parse hatası) ya da schemaVersion uyuşmuyorsa null döner —
// çağıran taraf bu durumda createInitialState() ile başlar.
export function loadState(): GameState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;

  try {
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.schemaVersion !== CURRENT_SCHEMA_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSavedState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Debug modu tercihi GameState'in parçası değil (oyun verisi değil, bir test ayarı) — o yüzden
// ayrı bir anahtarda, kendi başına kalıcı tutuluyor.
const DEBUG_MODE_KEY = "orman-pomodoro:debug-mode";

export function saveDebugMode(enabled: boolean): void {
  localStorage.setItem(DEBUG_MODE_KEY, enabled ? "1" : "0");
}

export function loadDebugMode(): boolean {
  return localStorage.getItem(DEBUG_MODE_KEY) === "1";
}
