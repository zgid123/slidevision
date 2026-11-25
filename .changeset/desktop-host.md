---
"@slidevision/workspace": minor
---

Add a `./host` export: a process that opens a project folder over newline-delimited JSON on stdin and stdout, for the Slidevision desktop app. A folder without `slidevision.json` is opened as a single deck when it has a `slides.md`.
