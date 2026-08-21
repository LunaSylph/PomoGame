# PROJE ÖZETİ: Pomodoro-Tabanlı Orman İnşa Oyunu (v1 Kapsamı)

> Bu doküman, projeyi başka bir AI sohbetinde sıfırdan devam ettirebilmek için hazırlanmıştır. Aşağıdaki tüm bilgiler netleşmiş kararlardır, varsayım değildir.

---

## 1. PROJENİN AMACI VE BAĞLAMI

- Geliştirici: Grafik tasarımcı ve eğitimci (Adobe Illustrator, InDesign, Articulate Storyline, AI görsel üretim araçları konusunda deneyimli). Yazılım tarafında temel Java ve C# bilgisi var, Unity deneyimi mevcut.
- Projenin amacı **ticari başarı değil** — eli yüzü düzgün, tamamlanmış, portfolyoda ve iş başvurularında gösterilebilecek bir ürün ortaya çıkarmak.
- Hedef: hem tasarım (illüstrasyon, UI, marka bütünlüğü) hem de temel geliştirme (interaction design, sistem tasarımı) becerisini sergileyen bir "case study" niteliğinde proje.
- Platform kararı: **Web tabanlı** (browser oyunu). Steam gibi platformlar şimdilik gündemde değil — dağıtım/onay süreçleri portfolyo değeri katmıyor, link ile paylaşılabilir bir web oyunu tercih edildi.
- Teknoloji önerisi: Ağır bir oyun motoru (Unity/Godot) yerine **HTML/CSS/JS** (ya da hafif bir frontend framework) öneriliyor — hem PiP (Picture-in-Picture) entegrasyonu için daha uygun, hem tasarımcının CSS/SVG üzerindeki kontrolünü artırıyor. Godot 4 (C# + web export) alternatif olarak değerlendirilebilir ama ana öneri web-native yaklaşım.

---

## 2. TEMEL OYUN FİKRİ

**Pomodoro tekniği + incremental/idle oyun mekaniği + hafif otomasyon** birleşimi.

Klasik idle oyunların "tıkla-puan topla-harca" döngüsünden kaçınılmak isteniyor. İlerleme, gerçek pomodoro (odaklanma) sürelerine bağlı olacak — yani oyun, kullanıcının gerçek odaklanma davranışını ödüllendiren bir sistem.

**Tema kararı:** Forest (mobil uygulama) gibi "ağaç dikme" metaforundan bilinçli olarak uzaklaşıldı. Bunun yerine **inşa ve keşif** temalı bir orman senaryosu seçildi: karakter ormanda kaynak topluyor, alan temizliyor, bina inşa ediyor.

**Görsel stil hedefi:** Stardew Valley'in sıcak/cozy atmosferine benzer ama **pixel art değil** — flat/vector illüstrasyon dili. Geliştirici bizzat çizim yapabiliyor veya editing ile üretebiliyor (AI görsel araçları dahil).

---

## 3. ÇEKİRDEK OYUN DÖNGÜSÜ (v1 KAPSAMI)

### a) Pomodoro (Çalışma Fazı)
- Kullanıcı bir pomodoro süresi başlatır (örn. 25 dk).
- Bu süre boyunca karakter ormanda **ya ağaç kesiyor ya taş topluyor** — kullanıcı bu ikisi arasından seçim yapar.
- **Seçim mantığı netleştirilmesi gereken açık konu:** Rastgele mi, yoksa bir sonraki inşaat/geliştirme hedefine göre stratejik bir seçim mi olacağı henüz kesinleşmedi. İkinci seçenek (hedefe göre stratejik seçim) tercih ediliyor çünkü kullanıcıya planlama hissi veriyor.
- Pomodoro sonunda: kaynak kazanılır (odun veya taş) + haritada bir alan/tile temizlenir.

### b) Kısa Mola (5 dk)
- **Tamamen pasif/ambient** bir deneyim olmalı — kullanıcı fiziksel olarak molada (su içme, kalkma vb.), ekran başında olmayabilir.
- PiP penceresinde sessizce oynayan bir büyüme/değişim animasyonu.
- Kaynak dönüştürme/takas etkileşimi burada olabilir (örn. odunu taşa çevirme) — kısa, isteğe bağlı, 10-15 saniyelik bir dokunuş.
- Zorunlu görev YOK. Amaç molayı bozmamak.

### c) Uzun Mola (15-30 dk, genelde her 4 pomodoro'da bir)
- Kullanıcının ekran başında olma ihtimali daha yüksek, bu yüzden **hafif aktif bir etkileşim** katmanı var.
- Biriken kaynaklarla **inşa/geliştirme** yapılır: v1'de sadece **1 bina türü — Lumbermill (kereste değirmeni)** — 2-3 seviyeli basit bir geliştirme zinciri ile.
- Bu etkileşim isteğe bağlı, zorunlu değil.

### d) Offline İlerleme
- Kullanıcı uygulamada değilken de otomasyonların (ör. inşa edilen lumbermill) çalışmaya devam etmesi hedefleniyor (idle oyunların standart "offline progress" hesaplaması).

---

## 4. TILE/HARİTA SİSTEMİ (v1)

- Küçük, sabit boyutlu bir tile grid (örnek: 5x5 ya da 6x6).
- Her pomodoro tamamlandığında bir tile "temizleniyor" (gri/kapalı görünümden açık/detaylı görünüme geçiş).
- Küçük grid boyutu bilinçli bir tercih: "haritayı tamamen temizledim" şeklinde net bir bitiş/başarı hissi sağlıyor — bu da portfolyoda "tamamlanmış, uçtan uca bir deneyim" gösterebilmek için önemli.

---

## 5. MASAÜSTÜ/ARKA PLAN GÖRÜNÜRLÜĞÜ (PiP ÇÖZÜMÜ)

**Problem:** Kullanıcı molada başka bir sekmede/uygulamada olabilir; yine de oyundaki ilerlemeyi (karakterin büyümesi, bahçe/ormanın gelişimi) görebilmeli.

**Karar verilen çözüm: Document Picture-in-Picture API**
- Chrome/Edge (2023+) destekliyor. Her zaman üstte kalan, bağımsız, küçük bir pencere açılabiliyor; içine istenilen HTML/CSS/animasyon konulabiliyor.
- Kullanıcı başka sekmeye/uygulamaya geçse bile bu pencere ekranda kalıyor.
- Sınırlama: Safari ve Firefox henüz desteklemiyor → fallback gerekiyor. Kullanıcının bir kez tetikleme/izin vermesi gerekiyor (otomatik açılamıyor).

**Fallback / ek katman: Favicon + Tab Title güncelleme**
- Sekme arka planda olsa bile favicon ve tab başlığı JS ile dinamik güncellenebilir (örn. büyüme aşamalarını gösteren küçük ikonlar, geri sayım metni).
- Sıfır izin gerektirir, her tarayıcıda çalışır.

**Ek katman: Web Notifications**
- Mola bitmeden kısa süre önce veya bir aşama tamamlandığında yumuşak bir bildirim.

**Sonuç:** PiP ana özellik, favicon/title güncellemesi her zaman çalışan bir fallback olarak birlikte kullanılacak.

---

## 6. GÖRSEL/SANAT YÖNÜ

### Stil hedefi
- Pixel art DEĞİL. Flat/vector illüstrasyon.
- Stardew Valley'in atmosferik/cozy hissi referans alınıyor ama görsel dil tamamen farklı (flat, modern, minimal-detaylı).
- Üstten hafif açılı / düz top-down bir orman sahnesi.
- Karakter: basit, ifadeli, minimal poz sayısıyla (bekleme, kesme/toplama, yürüme — 2-3 poz yeterli, tam animasyon gerekmiyor).
- Temizlenen tile'lar: gri/kapalı görünümden detaylı/renkli görünüme geçiş ile ilerleme gösteriliyor.

### Referans oyunlar (görsel dil ilhamı için)
- **Dorfromantik** — tile-tabanlı dünya inşası, düz renkli low-poly stil; en yakın mekanik referans.
- **Alto's Odyssey / Alto's Adventure** — düz renk katmanları, silüetler, parallax derinlik.
- **Old Man's Journey** — el çizimi hissi veren ama tamamen flat/vector, sıcak palet, minimal ama ifadeli karakter.
- **Wytchwood** — orman/toplama teması, dokulu flat illüstrasyon, obje ikonografisi.
- **Alba: A Wildlife Adventure** — temiz, pastel ama doygun renk paleti.
- **Islanders** — sade geometrik binalar, low-poly inşa mantığı.
- **Kingdom: Two Crowns** — silüet karakterler, kaynak toplama + inşa döngüsü (mekanik olarak yakın referans).
- **Townscaper** — sade geometrik bina/doku dili (saf görsel referans, oyun mekaniği değil).

**Moodboard kategorileri:**
1. Ortam/arka plan hissi → Alto's Odyssey, Alba
2. Tile/dünya inşa mantığı → Dorfromantik, Islanders
3. Karakter basitliği → Old Man's Journey, Kingdom
4. Obje/ikon dili (ağaç, taş, bina) → Wytchwood, Townscaper

---

## 7. TASARIM FELSEFESİ (Eğitimci Bakış Açısı)

- Klasik idle oyunların "kaçırırsan kaybedersin" korku mekaniğinden kaçınılacak (dark pattern değil).
- Kaçırılan gün cezalandırılmıyor; tutarlılık ödüllendiriliyor (esnek streak, "biriktirme" hissi, "kaybetme" hissi değil).
- Onboarding (ilk 2 dakikalık deneyim) özenle tasarlanmalı — kullanıcı sonradan gösterebileceği bir "instructional design" örneği olarak da düşünülüyor.

---

## 8. HENÜZ NETLEŞMEMİŞ / KARAR BEKLEYEN KONULAR

Yeni bir AI sohbetine geçildiğinde bu maddeler üzerinde çalışmaya devam edilmesi gerekiyor:

1. **Kaynak ekonomisi taslağı:** 1 pomodoro kaç kaynak veriyor, lumbermill kaç kaynağa mal oluyor, geliştirme maliyeti nasıl artıyor (idle oyun dengesi için kritik — çok hızlı biterse veya çok yavaş ilerlerse deneyim bozulur).
2. **Ağaç/taş seçim mantığı netleştirilmesi:** Rastgele mi, yoksa bir sonraki hedefe göre stratejik bir seçim mi.
3. **Kısa moladaki "kaynak değiştirme" mekaniğinin tam tanımı:** Sabit oranlı bir çevrim mi, yoksa küçük bir upgrade satın alma mı.
4. Karakter ve tile grid'in somut wireframe/mockup'ı henüz çizilmedi.
5. Renk paleti ve tipografi sistemi henüz seçilmedi (Townscaper/Alba/Dorfromantik referanslarından yola çıkılacak).
6. v2 kapsamı (yol haritası) sadece kavramsal olarak belirtildi: birden fazla bina türü, mevsimler, yeni haritalar/biyomlar, karakter özelleştirme — henüz detaylandırılmadı.

---

## 9. v1 KAPSAMI DIŞINDA BIRAKILANLAR (v2 Yol Haritası — Bilinçli Olarak Ertelendi)

- Birden fazla bina türü
- Mevsimler / farklı biyomlar
- Yeni haritalar
- Karakter kostümleri/özelleştirme
- Steam'e taşınma ve ses tasarımı (lo-fi/ambient müzik)

---

## 10. SONRAKİ ADIM ÖNERİSİ

Bir önceki sohbette üzerinde durulması planlanan ama henüz başlanmamış iki olası devam noktası:
- Kaynak ekonomisi taslağının çıkarılması (sayısal dengeleme)
- Tile-grid + karakter etkileşim akışının basit bir state diagram / akış şeması olarak çizilmesi

Bu dosyayı okuyan AI, kullanıcıdan hangi noktadan devam etmek istediğini sorarak kaldığı yerden ilerleyebilir.
