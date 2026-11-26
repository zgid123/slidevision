# @slidevision/workspace

## 0.2.0

### Minor Changes

- [#8](https://github.com/zgid123/slidevision/pull/8) [`dd59ef1`](https://github.com/zgid123/slidevision/commit/dd59ef14ff851603521882a4532317057f3cf695) Thanks [@zgid123](https://github.com/zgid123)! - Decks now start through a small starter that adds a Slidevision overview page to Slidev at `/__slidevision-overview`, showing every slide fully revealed in one grid without moving the presenter. The `./host` process can also start a deck (`startDeck`) and stop every server (`stopAll`), reports each deck's status as `deckRun` events, and stops its servers when its input closes.

- [#10](https://github.com/zgid123/slidevision/pull/10) [`f63cc1b`](https://github.com/zgid123/slidevision/commit/f63cc1bfd2f606401b7678dd052acad1063196aa) Thanks [@zgid123](https://github.com/zgid123)! - Pressing Esc in a deck started through the starter now dispatches a `slidevision:end-presentation` window event, unless drawing, the slide overview, the go-to dialog or a text input is active, so the desktop app can end its presentation.

### Patch Changes

- [#11](https://github.com/zgid123/slidevision/pull/11) [`b142f18`](https://github.com/zgid123/slidevision/commit/b142f18e2f6b4fdc18fee8f4f5f0b275396dd81d) Thanks [@zgid123](https://github.com/zgid123)! - The Slidevision overview page follows the system light or dark appearance, marks the selected slide with an indigo ring and numbered badge, and hides its scrollbar.

## 0.1.0

### Minor Changes

- [#6](https://github.com/zgid123/slidevision/pull/6) [`9806190`](https://github.com/zgid123/slidevision/commit/980619074771e808d0820b0e988bd351d4ed380c) Thanks [@zgid123](https://github.com/zgid123)! - Add a `./host` export: a process that opens a project folder over newline-delimited JSON on stdin and stdout, for the Slidevision desktop app. A folder without `slidevision.json` is opened as a single deck when it has a `slides.md`.
