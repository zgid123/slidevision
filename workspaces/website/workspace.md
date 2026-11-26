# Workspace CLI (`@slidevision/workspace`)

Browse and open every [Slidev](https://sli.dev) deck in a repository from one local browser landing page. Published on [npm](https://www.npmjs.com/package/@slidevision/workspace), `@slidevision/workspace` uses the exact same `slidevision.json` format as the Slidevision desktop app.

## Installation

Install `@slidevision/workspace` as a dev dependency at the root of a repository that already has `@slidev/cli` installed at the root:

```sh
pnpm add -D @slidevision/workspace
```

## Configuration

Create `slidevision.json` at the repository root with `decks` glob patterns pointing to your deck folders:

```json
{
  "decks": ["decks/*"]
}
```

A matched folder is treated as a deck when it contains a `slides.md` file (anything inside `node_modules` is skipped).

### Deck cards

Each card reads its title and cover from your deck's `slides.md` headmatter:

```yaml
---
title: 'Distributed Systems 101'
background: ./assets/main.png
---
```

- **Name:** `title`, falling back to the folder name.
- **Cover:** `background` resolved relative to the deck folder, from `public/` when starting with `/`, or used directly for `http(s)` URLs.

## Usage

Run from the repository root:

```sh
pnpm slidevision
```

Slidevision starts a local landing page at `http://localhost:3000/` (or the next free port).

- Click **Open** on any card to start that deck's Slidev server on its own port (`3030+`) and open it in a new tab.
- Saving changes to `slides.md` hot-reloads the running tab immediately.
- Press `Ctrl+C` in your terminal to stop all running deck servers cleanly.
