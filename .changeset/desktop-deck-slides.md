---
"@slidevision/workspace": minor
---

Decks now start through a small starter that adds a Slidevision overview page to Slidev at `/__slidevision-overview`, showing every slide fully revealed in one grid without moving the presenter. The `./host` process can also start a deck (`startDeck`) and stop every server (`stopAll`), reports each deck's status as `deckRun` events, and stops its servers when its input closes.
