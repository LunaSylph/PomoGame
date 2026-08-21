import type { GameState, Tile } from "./state";
import { createInitialTiles } from "./state";

// Merkeze Öklid mesafesinin karesi (sıralama için karekök almaya gerek yok).
function distanceFromCenter(tile: Tile, center: number): number {
  const [row, col] = tile.id.split("-").map(Number);
  return (row - center) ** 2 + (col - center) ** 2;
}

// Kapalı tile'lar arasından merkeze en yakın olanı açar. Harita merkezden dışa doğru,
// yayılan bir leke gibi açılsın diye seçildi (rastgele sıçramasın) — bkz. kullanıcı talebi.
// Eşit mesafedeki tile'lar arasında id'ye göre sabit bir sıralama kullanılıyor (deterministik).
export function revealNearestClosedTile(state: GameState): void {
  const center = Math.floor(state.grid.size / 2);
  const closedTiles = state.grid.tiles.filter((tile) => tile.state === "closed");
  if (closedTiles.length === 0) return;

  closedTiles.sort((a, b) => {
    const distDiff = distanceFromCenter(a, center) - distanceFromCenter(b, center);
    if (distDiff !== 0) return distDiff;
    return a.id.localeCompare(b.id);
  });

  closedTiles[0].state = "cleared";
}

// İlk pomodoro'dan sonra Lumbermill/Mine inşaat parselleri haritada görünür olur (Bölüm 3a).
export function revealBlueprints(state: GameState): void {
  state.buildings.lumbermill.blueprintRevealed = true;
  state.buildings.mine.blueprintRevealed = true;
}

function specialTileIds(state: GameState): { leftId: string; rightId: string } {
  const center = Math.floor(state.grid.size / 2);
  return { leftId: `${center}-${center - 1}`, rightId: `${center}-${center + 1}` };
}

// Bir tile "revealed" (sarı) mi yoksa "built" (pembe) mi diye main.ts'in render'da sorması için.
export function isTileBuilt(state: GameState, tile: Tile): boolean {
  if (!tile.isSpecial) return false;
  const { leftId, rightId } = specialTileIds(state);
  if (tile.id === rightId) return state.buildings.mine.level > 0;
  if (tile.id === leftId) return state.buildings.lumbermill.level > 0;
  return false;
}

// Placeholder inşa mantığı: gerçek kaynak bazlı seçim yerine önce sağdaki (Mine),
// sonra soldaki (Lumbermill) blueprint inşa edilir — bkz. kullanıcı talebi, sonra değişecek.
export function buildNextBlueprint(state: GameState): void {
  if (state.buildings.mine.level === 0) {
    state.buildings.mine.level = 1;
  } else if (state.buildings.lumbermill.level === 0) {
    state.buildings.lumbermill.level = 1;
  }
}

// Test amaçlı "Sıfırla" butonu için: grid'i, blueprint görünürlüğünü ve inşa durumunu başlangıç haline döndürür.
export function resetGrid(state: GameState): void {
  state.grid.tiles = createInitialTiles();
  state.buildings.lumbermill.blueprintRevealed = false;
  state.buildings.mine.blueprintRevealed = false;
  state.buildings.lumbermill.level = 0;
  state.buildings.mine.level = 0;
}
