import type { GameState, Tile } from "./state";

// Merkeze Öklid mesafesinin karesi (sıralama için karekök almaya gerek yok).
function distanceFromCenter(tile: Tile, center: number): number {
  const [row, col] = tile.id.split("-").map(Number);
  return (row - center) ** 2 + (col - center) ** 2;
}

// Tile'ları merkeze yakınlığa göre sıralar (eşit mesafede id'ye göre sabit/deterministik sıralama).
// Hem tile açma hem dekorasyon yerleştirme "merkezden dışa doğru" aynı mantığı kullanıyor.
export function sortByDistanceFromCenter(state: GameState, tiles: Tile[]): Tile[] {
  const center = Math.floor(state.grid.size / 2);
  return [...tiles].sort((a, b) => {
    const distDiff = distanceFromCenter(a, center) - distanceFromCenter(b, center);
    if (distDiff !== 0) return distDiff;
    return a.id.localeCompare(b.id);
  });
}

// Kapalı tile'lar arasından merkeze en yakın olanı açar. Harita merkezden dışa doğru,
// yayılan bir leke gibi açılsın diye seçildi (rastgele sıçramasın) — bkz. kullanıcı talebi.
export function revealNearestClosedTile(state: GameState): void {
  const closedTiles = state.grid.tiles.filter((tile) => tile.state === "closed");
  if (closedTiles.length === 0) return;
  sortByDistanceFromCenter(state, closedTiles)[0].state = "cleared";
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

// Grid'deki tüm tile'lar açıldığında harita tamamlanmış sayılır, Köy Merkezi açılır (Bölüm 5).
export function checkMapCleared(state: GameState): void {
  if (state.meta.mapCleared) return;
  const allCleared = state.grid.tiles.every((tile) => tile.state === "cleared");
  if (allCleared) {
    state.meta.mapCleared = true;
    state.buildings.villageCenter.unlocked = true;
  }
}
