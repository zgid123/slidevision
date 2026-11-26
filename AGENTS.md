# Agent guide

## Project map

Slidevision is a pnpm and Turbo monorepo. It will hold Slidev decks and a desktop app that presents them on two screens, with the presenter view on the laptop and the slides on the projector. Run commands from the repository root.

`pnpm-workspace.yaml` includes `packages/**` (published libraries) and `workspaces/**` (apps); list any new top-level folders in it.

- `packages/@contracts/project`: `@contracts/project`, private. The `TProject`, `IDeck` and `TDeckCover` shapes and `projectKind` that the workspace host sends and the desktop UI receives. Both import it as a `workspace:*` dev dependency; the published workspace build inlines it, so npm users never install it.
- `packages/workspace`: `@slidevision/workspace`, the `slidevision` CLI and browser landing page. Its `./host` export is the Node process the desktop app drives over newline-delimited JSON on stdin and stdout. Decks start through `src/slidev/start.ts`, which runs the project's own Slidev CLI and adds the Slidevision overview page from `src/slidev/addon/` (compiled by Slidev itself, built into `lib/slidev/`).
- `workspaces/slidevision`: `@slidevision/desktop`, the Tauri 2 app (Vue and UnoCSS UI in `src/`, Rust in `src-tauri/`). Its build bundles the workspace host into `lib/host.mjs`, which Tauri ships as a resource and runs with the user's Node.js. The UI is grouped by feature: `src/features/<feature>/` holds that feature's `components/`, `interface.ts`, `api.ts` (Tauri calls), `hooks/` (composables, `use*.ts`) and `utils/`; `App.vue` only switches screens. Import across features with `#/` (`#/features/decks/interface`), resolved by `package.json` `imports` for Vite and `tsconfig.json` `paths` for TypeScript. Tests mirror `src/` under `src/__tests__/`. The Rust side follows the `domain-driven-design` skill's modular-monolith layout in Rust form. Root `src-tauri/src/adapters/tauri/` assembles the app (`app.rs` the builder and command list, `menu.rs` the app menu, `wire.rs` calling each module's `wire`), and root `infrastructure/` holds only what modules share (`shell/command.rs`). Each bounded context lives in `src-tauri/src/modules/<context>/` (`projects` for opening projects and decks, `presentation` for Play on one or two displays), with its own `adapters/tauri/` (`commands.rs`, `menu.rs` items, `wire.rs` building its handlers) and: `domain/` (`entities/`, `value_objects/`, `errors/`, `repositories/` traits, `services/` traits), `application/` (`commands/` and `queries/` as `<Name>CommandHandler` structs with `execute`, plus `state/`), `infrastructure/<technology>/` (`json/`, `shell/`, `node/`, `tauri/`) implementing the domain traits. `lib.rs` only calls `adapters::tauri::run`. Modules and files are snake_case, traits have no `I` prefix, and each content folder's `mod.rs` is its barrel. Source files hold no test code: tests live in `modules/<context>/tests/`, mirroring the source paths with a `_test` suffix (`tests/domain/entities/recent_projects_test.rs` tests `domain/entities/recent_projects.rs`), and handler tests use the in-memory fakes in `tests/fakes/`. The context's `mod.rs` declares them with `#[cfg(test)] mod tests;`.
- `Cargo.toml`: the Cargo workspace for the Tauri crate; the pre-commit hook runs `cargo clippy --workspace` from the root.

- `.agents/skills/`: project skills, installed from `zgid123/skills` and pinned in `skills-lock.json`. `.claude/skills/` links to the same folders.
- `biome.json`, `tsconfig.json`, `lefthook.yml`: lint, type-check and pre-commit settings, extending `@alphacifer/biome` and `@alphacifer/tsconfig`.
- `.changeset/`, `.github/workflows/release.yml`: Changesets configuration and the release workflow, which uses the shared Node.js and pnpm setup action from `zgid123/alpha-dx`.
- `.github/workflows/test.yml`: runs the tests of packages affected by a pull request, using the same setup action and Playwright's Chromium, and on macOS and Windows runs `cargo test --workspace` and a `tauri build --no-bundle` compile check of the desktop app.
- `turbo.json`: `build` (outputs `dist/**` and `lib/**`), `test`, and `dev` tasks.

## Working conventions

- Read the relevant `.agents/skills/*/SKILL.md` before changing code. Always start with `principles`. Use `typescript` for TypeScript, `css` for styles, `testing` for tests, `slidevjs` for anything about Slidev decks, and `domain-driven-design` for domain modeling. Use `grilling` when a plan needs its decisions tested.
- Use pnpm only. Install third-party packages at exact versions; Alpha's own packages follow their existing version style. Put shared tooling in the root `package.json` and do not repeat it in workspace packages.
- When a change affects a published package, add a changeset with `pnpm set-release` in the same pull request.
- Keep changes scoped. Do not edit generated output such as `dist/`, `lib/` or `.turbo/` by hand.
- The project is licensed under MIT (see `LICENSE`). Do not add license headers to source files.

## Common commands

```sh
pnpm install
pnpm build                    # turbo run build across workspace packages
pnpm test                     # turbo run test across workspace packages
pnpm exec biome check .       # lint and format check
pnpm desktop                  # build the workspace host, then run the app with tauri dev
cargo test --workspace        # Rust unit tests
```

The pre-commit hook runs `biome check --write` on staged files.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
