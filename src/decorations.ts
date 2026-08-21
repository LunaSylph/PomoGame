import type { Decoration, GameState, Tile } from "./state";
import type { Cost } from "./resources";
import { canAfford } from "./resources";
import { sortByDistanceFromCenter } from "./grid";

// Bina ekonomisi değişmedi (Bölüm 4) — bunlar sadece "boş" uzun molaları doldurmak için
// eklenen ucuz, seviyesiz, tekrar tekrar satın alınabilen dekorasyonlar.
export const DECORATION_COSTS: Record<Decoration, Cost> = {
  fence: { wood: 15, stone: 0 },
  path: { wood: 0, stone: 15 },
  lamp: { wood: 10, stone: 10 },
};

// Dekorasyonsuz ilk sıradan "cleared" tile'ı bulur — Lumbermill/Mine parseli (isSpecial) tile'lar hariç,
// çünkü onların altındaki state "cleared" olsa bile görsel olarak blueprint/inşa rengini koruması gerekiyor.
// Sıralama: tile açma mantığıyla aynı "merkezden dışa" yaklaşım.
function findFirstUndecoratedTile(state: GameState): Tile | null {
  const candidates = state.grid.tiles.filter(
    (tile) => tile.state === "cleared" && tile.decoration === null && !tile.isSpecial,
  );
  if (candidates.length === 0) return null;
  return sortByDistanceFromCenter(state, candidates)[0];
}

export function canPlaceDecoration(state: GameState): boolean {
  return findFirstUndecoratedTile(state) !== null;
}

export function buildDecoration(state: GameState, type: Decoration): boolean {
  const tile = findFirstUndecoratedTile(state);
  if (!tile) return false;
  const cost = DECORATION_COSTS[type];
  if (!canAfford(state, cost)) return false;
  state.resources.wood -= cost.wood;
  state.resources.stone -= cost.stone;
  tile.decoration = type;
  return true;
}
