// Veri modeli kaynağı: docs/veri-modeli-v1.md
// Bu dosya sadece state şeklini ve başlangıç değerini tanımlar — henüz mantık (reducer, state machine) yok.

export type TilePhase = "closed" | "cleared";
export type SessionPhase = "idle" | "pomodoro" | "shortBreak" | "longBreak";
export type ResourceTask = "wood" | "stone";

export interface Tile {
  id: string; // "row-col", örn. "2-2"
  state: TilePhase;
  isSpecial: boolean; // true: Lumbermill/Mine blueprint konumu
}

export interface BuildingLevel {
  level: number; // 0 = henüz yok, 1-2 = mevcut seviye
  blueprintRevealed: boolean;
}

export interface VillageCenter {
  built: boolean;
  unlocked: boolean;
}

export interface GameState {
  resources: {
    wood: number;
    stone: number;
  };
  buildings: {
    lumbermill: BuildingLevel;
    mine: BuildingLevel;
    villageCenter: VillageCenter;
  };
  grid: {
    size: number;
    tiles: Tile[];
  };
  session: {
    phase: SessionPhase;
    currentTask: ResourceTask;
    pomodoroCount: number;
    phaseStartedAt: number | null;
    phaseDurationMs: number;
  };
  meta: {
    mapCleared: boolean;
    lastSavedAt: number | null;
  };
}

const GRID_SIZE = 5;
const CENTER = Math.floor(GRID_SIZE / 2); // 2

// Blueprint konumları merkeze bitişik iki tile (kesin görsel yerleşim henüz karara bağlanmadı,
// bkz. docs/game-project-summary-v2.md Bölüm 9, madde 1) — geçici olarak sol ve sağ komşu seçildi.
const SPECIAL_TILE_IDS = new Set([`${CENTER}-${CENTER - 1}`, `${CENTER}-${CENTER + 1}`]);

function createInitialTiles(): Tile[] {
  const tiles: Tile[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const id = `${row}-${col}`;
      const isCenter = row === CENTER && col === CENTER;
      tiles.push({
        id,
        state: isCenter ? "cleared" : "closed",
        isSpecial: SPECIAL_TILE_IDS.has(id),
      });
    }
  }
  return tiles;
}

export function createInitialState(): GameState {
  return {
    resources: {
      wood: 0,
      stone: 0,
    },
    buildings: {
      lumbermill: { level: 0, blueprintRevealed: false },
      mine: { level: 0, blueprintRevealed: false },
      villageCenter: { built: false, unlocked: false },
    },
    grid: {
      size: GRID_SIZE,
      tiles: createInitialTiles(),
    },
    session: {
      phase: "idle",
      currentTask: "wood",
      pomodoroCount: 0,
      phaseStartedAt: null,
      phaseDurationMs: 1500000, // 25 dk — debug için küçültülebilir
    },
    meta: {
      mapCleared: false,
      lastSavedAt: null,
    },
  };
}
