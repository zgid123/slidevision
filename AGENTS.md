# Agent guide

## Project map

Slidevision is a pnpm and Turbo monorepo. It will hold Slidev decks and a desktop app that presents them on two screens, with the presenter view on the laptop and the slides on the projector. Run commands from the repository root.

The repository has root configuration only so far. `pnpm-workspace.yaml` includes `packages/**`; add workspace packages there and list any new top-level folders in it.

- `.agents/skills/`: project skills, installed from `zgid123/skills` and pinned in `skills-lock.json`. `.claude/skills/` links to the same folders.
- `biome.json`, `tsconfig.json`, `lefthook.yml`: lint, type-check and pre-commit settings, extending `@alphacifer/biome` and `@alphacifer/tsconfig`.
- `turbo.json`: `build` (outputs `dist/**`) and `dev` tasks.

## Working conventions

- Read the relevant `.agents/skills/*/SKILL.md` before changing code. Always start with `principles`. Use `typescript` for TypeScript, `css` for styles, `testing` for tests, `slidevjs` for anything about Slidev decks, and `domain-driven-design` for domain modeling. Use `grilling` when a plan needs its decisions tested.
- Use pnpm only. Install third-party packages at exact versions; Alpha's own packages follow their existing version style. Put shared tooling in the root `package.json` and do not repeat it in workspace packages.
- Keep changes scoped. Do not edit generated output such as `dist/` or `.turbo/` by hand.
- The project is licensed under MIT (see `LICENSE`). Do not add license headers to source files.

## Common commands

```sh
pnpm install
pnpm build                    # turbo run build across workspace packages
pnpm exec biome check .       # lint and format check
```

The pre-commit hook runs `biome check --write` on staged files.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
