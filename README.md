# Slidevision

Slidevision is a monorepo for [Slidev](https://sli.dev) decks, with a planned desktop app that presents them like Keynote: the presenter view stays on your screen and the slides go fullscreen on the projector.

The project is at an early stage. It has one package so far:

- [`@slidevision/workspace`](packages/workspace): the `slidevision` command, which lists a repository's decks on a local landing page and opens them on demand.

The desktop app is not added yet.

## Requirements

- Node.js 22.22 or later
- pnpm (the version in `package.json` is downloaded automatically)

## Getting started

```sh
pnpm install
```

Workspace packages go under `packages/`.

| Command | What it does |
|---|---|
| `pnpm build` | Builds every workspace package with Turbo |
| `pnpm exec biome check .` | Checks linting and formatting |
| `pnpm clear` | Removes `node_modules`, build output and Turbo caches |
| `pnpm update-packages` | Updates dependencies interactively |

## License

Slidevision is licensed under the [MIT License](LICENSE).
