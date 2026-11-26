---
"@slidevision/workspace": minor
---

Pressing Esc in a deck started through the starter now dispatches a `slidevision:end-presentation` window event, unless drawing, the slide overview, the go-to dialog or a text input is active, so the desktop app can end its presentation.
