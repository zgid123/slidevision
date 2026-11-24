# @slidevision/workspace

Browse the [Slidev](https://sli.dev) decks in a repository from one local landing page.

Run `slidevision` at the root of a repository that holds several decks. It finds them through a `slidevision.json` file and serves a page with a card for each deck: its title, its cover image, and its status.

> Opening decks from the landing page is not available yet. Each card's Open button is disabled until that lands.

## Requirements

- A repository with Slidev installed at its root (`@slidev/cli`). Every deck uses that one installation, so install shared themes and addons at the root as well.
- Node.js and an operating system that your Slidev version supports.

## Installation

```sh
pnpm add -D @slidevision/workspace
```

## Configuration

Create `slidevision.json` at the repository root. List glob patterns for your deck folders under `decks`, the same way `pnpm-workspace.yaml` lists packages:

```json
{
  "decks": ["decks/*"]
}
```

Patterns are relative to the repository root. A matched folder is a deck when it contains a `slides.md`; folders without one are skipped, and so is anything inside `node_modules`. Several patterns may match the same folder; it is listed once.

### Deck cards

Each card takes its details from the deck's own `slides.md` headmatter, so nothing new is needed in your decks:

```yaml
---
title: 'Distributed Systems 101'
background: ./assets/main.png
---
```

| Card detail | Source |
| --- | --- |
| Name | `title`; the folder name when there is no title |
| Cover | `background`, resolved like Slidev does: relative to the deck folder, from the deck's `public/` folder when it starts with `/`, or used as-is when it is an `http(s)` URL |

When `background` is missing, points to a file that does not exist, or cannot be loaded as an image, the card shows the deck title instead.

## Usage

From the repository root:

```sh
pnpm slidevision
```

The command prints the landing page address, by default `http://localhost:3000/` (the next free port when 3000 is taken). Stop it with Ctrl+C.

The deck list is read when the command starts. After adding a deck, renaming one, or changing `slidevision.json`, restart `slidevision` to see the change.

### Errors

When `slidevision.json` is missing, is not valid JSON, or has no `decks` array of patterns, the command stops before starting the page, prints the file path and the problem, and exits with code 1:

```text
slidevision: /path/to/repo/slidevision.json: file not found; create it with a "decks" array of glob patterns
```

When the patterns match no decks, the page explains how to add one.

## Development

This package lives in the Slidevision monorepo. From the repository root:

```sh
pnpm install
pnpm build
pnpm --filter @slidevision/workspace test
```

`fixtures/` holds sample decks for trying the page by hand: a deck with a cover, a deck without one, a deck whose cover file is missing, and a folder that is not a deck. Run the built command from there:

```sh
cd packages/workspace/fixtures
node ../lib/cli.mjs
```

The landing page is a Vue and UnoCSS app in `client/`, served from source by a Vite server that the command starts, the same way Slidev serves its own client.

## License

MIT
