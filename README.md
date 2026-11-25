# Slidevision

Slidevision is a monorepo for [Slidev](https://sli.dev) decks, with a planned desktop app that presents them like Keynote: the presenter view stays on your screen and the slides go fullscreen on the projector.

The project is at an early stage. It has:

- [`@slidevision/workspace`](packages/workspace): the `slidevision` command, which lists a repository's decks on a local landing page and opens them on demand.
- [`workspaces/slidevision`](workspaces/slidevision): the desktop app, built with Tauri. It opens a project folder and lists its decks; presenting on two screens is in progress.

## Requirements

- Node.js 22.22 or later
- pnpm (the version in `package.json` is downloaded automatically)
- Rust (stable, through [rustup](https://rustup.rs)) and the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for the desktop app

## Getting started

```sh
pnpm install
```

Libraries go under `packages/` and apps under `workspaces/`.

| Command | What it does |
|---|---|
| `pnpm build` | Builds every workspace package with Turbo |
| `pnpm desktop` | Runs the desktop app in development mode |
| `pnpm test` | Runs every workspace package's tests with Turbo (run `pnpm exec playwright install chromium` once first) |
| `pnpm exec biome check .` | Checks linting and formatting |
| `pnpm clear` | Removes `node_modules`, build output and Turbo caches |
| `pnpm update-packages` | Updates dependencies interactively |
| `pnpm set-release` | Adds a changeset describing a release |

## Releasing

Packages are published to npm with [Changesets](https://github.com/changesets/changesets) and npm trusted publishing, so the release workflow needs no npm token.

1. In a pull request that changes a published package, run `pnpm set-release`, pick the package and the version bump, and describe the change. Commit the generated `.changeset/*.md` file.
2. After the pull request is merged, the **Release packages** workflow opens a "Version Packages" pull request that bumps versions and updates changelogs.
3. Merging that pull request runs the workflow again, which builds and publishes the new versions and creates GitHub releases.

## License

Slidevision is licensed under the [MIT License](LICENSE).
