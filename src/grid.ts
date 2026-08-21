import type { GameState, Tile } from "./state";

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
