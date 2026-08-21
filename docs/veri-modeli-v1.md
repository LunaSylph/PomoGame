# Veri Modeli Taslağı (v1)

> Bu dosya, proje-özeti-v2.md'deki kararların (Bölüm 4 ve 5) kod tarafındaki karşılığıdır. Code sekmesine geçerken bu dosyayı ilk mesajında referans olarak verebilirsin.

```json
{
  "resources": {
    "wood": 0,
    "stone": 0
  },
  "buildings": {
    "lumbermill": {
      "level": 0,
      "blueprintRevealed": false
    },
    "mine": {
      "level": 0,
      "blueprintRevealed": false
    },
    "villageCenter": {
      "built": false,
      "unlocked": false
    }
  },
  "grid": {
    "size": 5,
    "tiles": [
      { "id": "0-0", "state": "closed", "isSpecial": false, "decoration": null }
    ]
  },
  "session": {
    "phase": "idle",
    "currentTask": "wood",
    "pomodoroCount": 0,
    "phaseStartedAt": null,
    "phaseDurationMs": 1500000
  },
  "meta": {
    "mapCleared": false,
    "lastSavedAt": null
  }
}
```

## Alan açıklamaları

- **resources**: Bölüm 4'teki iki kaynağın anlık miktarı. Bina bonusları burada değil, kaynak kazanma fonksiyonunda hesaplanır (state'e sadece sonuç yazılır).
- **buildings.*.level**: 0 = henüz yok, 1-2 = mevcut seviye. `blueprintRevealed`, ilk pomodoro'dan sonra true olur (Bölüm 3a).
- **buildings.villageCenter**: `unlocked`, harita tamamen açıldığında (Bölüm 5, 24. pomodoro) true olur. `built`, oyuncu uzun molada inşa ettiğinde true olur — ikisi ayrı, çünkü unlock ile build arasında oyuncu bekleyebilir.
- **grid.tiles**: 25 elemanlı dizi (5x5). `state`: "closed" | "cleared". `isSpecial`: true olan 2 tile, Lumbermill/Mine blueprint konumları (Bölüm 5 — başlangıca bitişik, sabit). `decoration`: "fence" | "path" | "lamp" | null — sadece "cleared" tile'lara yerleşen, uzun molada satın alınabilen ucuz dekoratif eşyalar (Bölüm 4, "boş uzun mola" sorununu binaların ekonomisini değiştirmeden çözmek için eklendi).
- **session.phase**: state machine'in kalbi — "idle" | "pomodoro" | "shortBreak" | "longBreak". UI, buna göre neyin gösterileceğine karar verir.
- **session.currentTask**: kısa molada değiştirilen görev (Bölüm 3b — kaynak dönüştürme değil, görev değiştirme).
- **phaseDurationMs**: debug/hızlandırma modu için bu değeri küçültmek yeterli (ör. test için 1500000 yerine 5000).
- **meta.lastSavedAt**: localStorage kayıt/yükleme için (roadmap adım 6).

## Not

Bu, kod yazmadan önceki hızlı bir taslak — Code sekmesinde gerçek implementasyona geçerken küçük değişiklikler (ör. building bonus değerlerini ayrı bir config objesine çıkarmak) tamamen normal.
