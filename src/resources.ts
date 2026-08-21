import type { GameState } from "./state";

export interface Cost {
  wood: number;
  stone: number;
}

const BASE_YIELD = 25;

// docs/game-project-summary-v2.md Bölüm 4: level 1 -> +5, level 2 -> +10
// (üst üste eklenmez, level 2 bonusu level 1'in yerine geçer).
function buildingBonus(level: number): number {
  if (level >= 2) return 10;
  if (level === 1) return 5;
  return 0;
}

// Pomodoro tamamlandığında currentTask'a göre kaynak ekler (ilgili bina bonusu dahil).
export function grantPomodoroYield(state: GameState): void {
  if (state.session.currentTask === "wood") {
    state.resources.wood += BASE_YIELD + buildingBonus(state.buildings.lumbermill.level);
  } else {
    state.resources.stone += BASE_YIELD + buildingBonus(state.buildings.mine.level);
  }
}

// Her seviyenin maliyeti kümülatif değil, o seviyeye geçiş için ayrıca ödenen miktar (Bölüm 4).
// Level 1 dokümandaki orijinal 80/20 yerine 75/25 kullanıyor: bir pomodoro 25 birim verdiği için
// 4 pomodoroluk ilk longBreak'e kadar (3 ana + 1 diğer kaynak) 75/25 toplanabiliyor, 80/20 ise
// tam 5 birim eksik kalıp ilk longBreak'te hiçbir inşayı imkansız kılıyordu.
const LUMBERMILL_COSTS: Record<number, Cost> = {
  1: { wood: 75, stone: 25 },
  2: { wood: 130, stone: 40 },
};

const MINE_COSTS: Record<number, Cost> = {
  1: { wood: 25, stone: 75 },
  2: { wood: 40, stone: 130 },
};

export const VILLAGE_CENTER_COST: Cost = { wood: 70, stone: 70 };

export function nextLumbermillCost(state: GameState): Cost | null {
  const level = state.buildings.lumbermill.level;
  return level >= 2 ? null : LUMBERMILL_COSTS[level + 1];
}

export function nextMineCost(state: GameState): Cost | null {
  const level = state.buildings.mine.level;
  return level >= 2 ? null : MINE_COSTS[level + 1];
}

export function canAfford(state: GameState, cost: Cost): boolean {
  return state.resources.wood >= cost.wood && state.resources.stone >= cost.stone;
}

function spend(state: GameState, cost: Cost): void {
  state.resources.wood -= cost.wood;
  state.resources.stone -= cost.stone;
}

export function buildLumbermill(state: GameState): boolean {
  const cost = nextLumbermillCost(state);
  if (!cost || !canAfford(state, cost)) return false;
  spend(state, cost);
  state.buildings.lumbermill.level += 1;
  return true;
}

export function buildMine(state: GameState): boolean {
  const cost = nextMineCost(state);
  if (!cost || !canAfford(state, cost)) return false;
  spend(state, cost);
  state.buildings.mine.level += 1;
  return true;
}

export function buildVillageCenter(state: GameState): boolean {
  if (!state.buildings.villageCenter.unlocked || state.buildings.villageCenter.built) return false;
  if (!canAfford(state, VILLAGE_CENTER_COST)) return false;
  spend(state, VILLAGE_CENTER_COST);
  state.buildings.villageCenter.built = true;
  return true;
}
