# PROJECT SUMMARY: Pomodoro-Based Forest Building Game (v1 Scope)

> This document is prepared so the project can be picked up from scratch in a fresh AI chat. Everything below reflects finalized decisions, not assumptions.

**Version note:** This is the second version of this document. Since the first version, the following has been finalized: the full resource economy (building costs, active-yield bonuses, the capstone "Village Center" building), the grid size (5x5, ~25 tiles), a correction to the short-break mechanic (it's a task switch, not a resource conversion), and a deliberate design decision that buildings will NOT produce resources passively/offline.

---

## 1. PROJECT PURPOSE AND CONTEXT

- Developer: Graphic designer and educator (experienced with Adobe Illustrator, InDesign, Articulate Storyline, AI image-generation tools). Has basic Java and C# knowledge on the software side, with Unity experience.
- The project's goal is **not commercial success** — the aim is a polished, finished product that can be shown in a portfolio and in job applications.
- Target: a "case study" project that demonstrates both design skills (illustration, UI, brand consistency) and basic development skills (interaction design, systems design).
- Platform decision: **Web-based** (browser game). Platforms like Steam are not currently on the table — the distribution/approval process doesn't add portfolio value, so a shareable web game (via link) was preferred.
- Technology recommendation: instead of a heavy game engine (Unity/Godot), **HTML/CSS/JS** (or a lightweight frontend framework) is recommended — it's better suited for Picture-in-Picture (PiP) integration and gives the designer more direct control over CSS/SVG. Godot 4 (C# + web export) can be considered as an alternative, but the primary recommendation is a web-native approach.

---

## 2. CORE GAME CONCEPT

A combination of **the Pomodoro technique + incremental/idle game mechanics**. (No passive/offline automation in v1 — see Section 3d and Section 8; this is a deliberate design decision.)

The goal is to avoid the classic idle-game loop of "click, collect points, spend." Progress will be tied to real pomodoro (focus) sessions — i.e., the game is a system that rewards the user's actual focus behavior.

**Theme decision:** The "tree planting" metaphor used by apps like Forest was deliberately avoided. Instead, a forest scenario themed around **building and exploration** was chosen: the character gathers resources in the forest, clears land, and constructs buildings.

**Visual style target:** Similar to Stardew Valley's warm/cozy atmosphere, but **not pixel art** — a flat/vector illustration language. The developer can draw the assets personally or produce them via editing (including AI image tools).

---

## 3. CORE GAME LOOP (v1 Scope)

### a) Pomodoro (Work Phase)
- The user starts a pomodoro session (25 min).
- During this time, the character performs a **single, currently assigned task**: either chopping wood or gathering stone. The task is set before the pomodoro starts (during the preceding short break).
- At the end of the pomodoro: 25 units of the selected resource are earned (more if the relevant building has been constructed — see Section 4) + one tile is revealed on the map.
- **The first pomodoro has a special role:** in addition to the normal resource/tile gain, the construction plots (blueprints) for the Lumbermill and the Mine appear on the map. These plots are at **fixed positions** (adjacent to the starting tile, a special tile type) — they do not appear on a randomly cleared tile.

### b) Short Break (5 min)
- Should be a fully passive/ambient experience — the user may be physically away from the screen (getting water, standing up, etc.).
- A growth/change animation plays quietly in the PiP window.
- **Correction (a decision clarified in v1):** there is NO resource-conversion/exchange mechanic during the short break. The only interaction available here is **switching the character's task for the next pomodoro** (wood gathering ↔ stone gathering). This is optional, never required.
- No mandatory task. The goal is to not disrupt the break.
- **Implementation note (added during v1 scaffolding):** break duration is not enforced — the break never auto-ends, the user always ends it manually by starting the next pomodoro. `phaseDurationMs` is still tracked in state during breaks as a target reference (not an automatic cutoff), intended for a future "break ending soon" notification.

### c) Long Break (15-30 min, generally every 4th pomodoro)
- The user is more likely to be at the screen, so there's a lightly active interaction layer here.
- Construction/upgrades using accumulated resources happen here. **Building purchases only happen during long breaks** (never mid-pomodoro).
- v1 has three buildings: Lumbermill, Mine, and the Village Center, which unlocks once the entire map is cleared (see Section 4).
- This interaction is optional, never required.

### d) Offline Progress — REMOVED FROM v1 (deliberate design decision)
- **Important:** The idea planned in the first version — "automations (e.g. the built Lumbermill) keep working even while the user isn't in the app" — has been **deliberately rejected**.
- Rationale: the project's core value proposition is rewarding active, focused work. If resources keep accumulating while the user isn't working (or the app is closed), that reward mechanism is weakened — it risks creating a "why bother doing pomodoros, it accumulates on its own anyway" feeling.
- Instead, buildings **boost active pomodoro yield** (see Section 4). The system stays entirely dependent on active use.

---

## 4. RESOURCE ECONOMY (v1)

### Base yield
- 1 pomodoro = 25 units of the assigned resource for that pomodoro (wood or stone) + 1 tile revealed.

### Building costs
| Building | Level 1 cost | Level 2 cost (additional) |
|---|---|---|
| Lumbermill | 80 wood + 20 stone (100 total) | 130 wood + 40 stone (170 total) |
| Mine | 80 stone + 20 wood (100 total) | 130 stone + 40 wood (170 total) |

- Costs are deliberately asymmetric: each building primarily wants its own resource (an 80/20 ratio), with a smaller amount of the other resource required too. This ratio is kept constant across both levels so the player learns it once and reuses it.
- v1 has only **2 levels** per building. A 3rd level risks pushing total playtime past the 24-pomodoro map-completion target, so it's deferred to v2.

### What buildings do: active yield boost
- **No passive/offline production** (see Section 3d). Buildings only take effect during active pomodoros.
- Lumbermill Level 1: while the wood task is selected, **+5** per pomodoro (25 → 30 wood).
- Lumbermill Level 2: bonus increases to **+10**, for a total of 25 → 35 wood (this replaces the Level 1 bonus rather than stacking on top of it).
- The Mine works symmetrically for stone.

### Village Center (capstone building)
- Unlocks once the entire map is cleared (pomodoro 24, all tiles revealed).
- Recommended cost: **70 wood + 70 stone (140 total)**.
- This figure is based on a simulation: under an alternating (wood-stone-wood-stone...) play strategy, both the Lumbermill and the Mine reach Level 2 by pomodoro 24, leaving roughly 160 unspent units (80 wood + 80 stone). Setting the cost somewhat below that surplus leaves room for players whose strategy isn't perfectly optimized to still be able to complete the Village Center.

### Simulation milestones (assuming an alternating strategy)
| Pomodoro | Event | Remaining resources |
|---|---|---|
| 8 | Lumbermill and Mine both reach Level 1 | 20 wood, 80 stone |
| 20 | Lumbermill and Mine both reach Level 2 | 10 wood, 10 stone |
| 24 | Map fully cleared, Village Center becomes buildable | ~80 wood, ~80 stone (before spending) |

**Important note:** These figures (+5/+10 bonuses, the 140-cost Village Center) come from a simulation (tested in Python) that assumes a perfectly alternating play strategy. Real player behavior will differ, so these numbers should be treated as a v1 draft and fine-tuned after playtesting.

---

## 5. TILE/MAP SYSTEM (v1)

- Grid size is finalized at **5x5 (25 tiles total)**. The economy calculations above are built around this size; if the grid moves to 6x6, the economy needs to be rebalanced.
- The character starts on the center tile, which is considered already open. That leaves 24 tiles to reveal → fully clearing the map takes **24 pomodoros** (~10 hours of focused work).
- Each completed pomodoro "clears" one tile (a transition from a gray/closed look to a detailed/colored look).
- **The construction plots (blueprints) for the Lumbermill and Mine are at fixed positions** — adjacent to the starting tile, as a special tile type. They never land on a randomly cleared tile.
- The small grid size is a deliberate choice: it provides a clear sense of finishing/completion ("I fully cleared the map") — important for being able to show a "complete, end-to-end experience" in a portfolio.

---

## 6. DESKTOP/BACKGROUND VISIBILITY (PiP SOLUTION)

**Problem:** The user may be on another tab/app during a break, but should still be able to see the game's progress (the character growing, the garden/forest developing).

**Chosen solution: Document Picture-in-Picture API**
- Supported by Chrome/Edge (2023+). It opens a small, always-on-top, independent window that can contain any HTML/CSS/animation.
- This window stays on screen even if the user switches to another tab/app.
- Limitation: Safari and Firefox don't support it yet → a fallback is needed. The user needs to trigger/grant permission once (it can't open automatically).

**Fallback / additional layer: Favicon + Tab Title updates**
- Even while the tab is in the background, the favicon and tab title can be dynamically updated via JS (e.g., small icons showing growth stages, countdown text).
- Requires zero permissions, works in every browser.

**Additional layer: Web Notifications**
- A gentle notification shortly before a break ends, or when a stage completes.

**Conclusion:** PiP is the primary feature, with favicon/title updates used together as an always-working fallback.

---

## 7. VISUAL/ART DIRECTION

### Style target
- NOT pixel art. Flat/vector illustration.
- References Stardew Valley's atmospheric/cozy feel, but with a completely different visual language (flat, modern, minimally detailed).
- A slightly angled top-down (or flat top-down) forest scene.
- Character: simple, expressive, with a minimal pose count (idle, chopping/gathering, walking — 2-3 poses are enough, full animation isn't needed).
- Cleared tiles: progress is shown via a transition from a gray/closed look to a detailed/colored look.

### Reference games (for visual language inspiration)
- **Dorfromantik** — tile-based world building, flat-colored low-poly style; the closest mechanical reference.
- **Alto's Odyssey / Alto's Adventure** — flat color layers, silhouettes, parallax depth.
- **Old Man's Journey** — has a hand-drawn feel but is fully flat/vector, warm palette, minimal but expressive character.
- **Wytchwood** — forest/gathering theme, textured flat illustration, object iconography.
- **Alba: A Wildlife Adventure** — clean, pastel but saturated color palette.
- **Islanders** — simple geometric buildings, low-poly building logic.
- **Kingdom: Two Crowns** — silhouette characters, resource-gathering + building loop (a close mechanical reference).
- **Townscaper** — simple geometric building/texture language (a purely visual reference, not a gameplay one).

**Moodboard categories:**
1. Environment/background feel → Alto's Odyssey, Alba
2. Tile/world-building logic → Dorfromantik, Islanders
3. Character simplicity → Old Man's Journey, Kingdom
4. Object/icon language (trees, stones, buildings) → Wytchwood, Townscaper

---

## 8. DESIGN PHILOSOPHY (Educator's Perspective)

- The classic idle-game "miss it and you lose" fear mechanic will be avoided (no dark patterns).
- A missed day is not punished; consistency is rewarded (a flexible streak, an "accumulation" feeling rather than a "loss" feeling).
- Onboarding (the first 2 minutes of experience) needs careful design — it's also being treated as an "instructional design" sample the developer can later show.
- **New:** the decision that buildings don't produce resources passively/offline is a direct extension of this philosophy — the game doesn't progress while the user isn't working, because the actual goal is rewarding real focus behavior, not building a system that "progresses on its own" via automation.

---

## 9. STILL UNRESOLVED / PENDING DECISIONS

1. A concrete wireframe/mockup of the blueprints and buildings hasn't been drawn yet (their position — "fixed, adjacent to start" — is decided, but the exact visual layout isn't).
2. A concrete wireframe/mockup of the character and tile grid hasn't been drawn yet.
3. A color palette and typography system haven't been chosen yet (will draw from the Townscaper/Alba/Dorfromantik references).
4. The economy numbers (+5/+10 bonuses, the 140-cost Village Center) haven't been validated through playtesting and may need tuning.
5. A state diagram / flowchart of the tile-grid + character + pomodoro + break flow hasn't been drawn yet.
6. Whether the grid stays at exactly 5x5 or moves to 6x6 (currently working from 5x5, with the whole economy built around it).
7. The v2 scope (roadmap) is still only conceptual, not detailed.

---

## 10. LEFT OUT OF v1 SCOPE (v2 Roadmap — Deliberately Deferred)

- Additional building types beyond the three (Lumbermill, Mine, Village Center)
- Seasons / different biomes
- New maps
- Character costumes/customization
- Porting to Steam and sound design (lo-fi/ambient music)
- Passive/offline resource production (deliberately rejected for v1 — see Sections 3d and 8; even adding it in v2 is debatable since it could conflict with the core philosophy)

---

## 11. SUGGESTED NEXT STEP

Continuation points that were planned in a previous chat and are now ready to move on to, since the economy is settled:

- Drawing the tile-grid + character + building interaction flow as a simple state diagram / flowchart
- A concrete wireframe/mockup of blueprint and building placement
- A visual style test (art spike): validating the palette and line language through 1 character + 1 tree + 1 stone + 1 building
- Choosing the color palette and typography

The AI reading this file can ask the user which point they'd like to continue from and pick up where things left off.
