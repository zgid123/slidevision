# Slidevision

Slidevision is a monorepo for [Slidev](https://sli.dev) decks, with a planned desktop app that presents them across two screens: the presenter view stays on your screen and the slides go fullscreen on the projector.

The project is at an early stage. It has:

- [`@slidevision/workspace`](packages/workspace): the `slidevision` command, which lists a repository's decks on a local landing page and opens them on demand.
- [`workspaces/slidevision`](workspaces/slidevision): the desktop app, built with Tauri. It opens a project folder and lists its decks; presenting on two screens is in progress.
- [`workspaces/website`](workspaces/website): the documentation and download site, published to [zgid123.github.io/slidevision](https://zgid123.github.io/slidevision/).

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

Releases are managed with [Changesets](https://github.com/changesets/changesets) via the **Release** workflow (`.github/workflows/release.yml`). Public packages (`@slidevision/workspace`) use npm trusted publishing with no npm token, while `@slidevision/server` deploys to Cloudflare Workers and `@slidevision/desktop` builds signed installers for GitHub Releases and updater bundles for Cloudflare R2.

1. In a pull request that changes a released package, run `pnpm set-release`, pick the package and version bump, and describe the change. Commit the generated `.changeset/*.md` file.
2. After the pull request is merged, the **Release** workflow opens a "Version Packages" pull request that bumps versions (including syncing `Cargo.toml`) and updates changelogs.
3. Merging that pull request runs the workflow again, which creates tags and GitHub releases, deploys `@slidevision/server` if bumped, and builds/uploads `@slidevision/desktop` if bumped.

The workflow requires the `CLOUDFLARE_API_TOKEN` secret (with **Workers Scripts: Edit** and **Workers R2 Storage: Edit** permissions) and the `CLOUDFLARE_ACCOUNT_ID` repository variable, plus the signing keys below.

## Infrastructure

Cloudflare resources live under [infrastructures/terraform](infrastructures/terraform). The `slidevision-terraform` state bucket is bootstrapped once locally (`pnpm tf-bootstrap`), and changes to `infrastructures/terraform/cloudflare` are planned on pull requests and applied on push to `main` by the **Terraform** workflow (`.github/workflows/terraform.yml`), which also requires `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` secrets (an R2 API token with Object Read & Write on `slidevision-terraform`).

## Signing keys

Keep backups of the generated private keys and certificates in a safe place (such as a password manager). Once an app version is shipped, overwriting the updater key or macOS certificate will break updates or signing continuity for already-installed apps.

### macOS signing certificate

macOS releases sign `Slidevision.app` with a self-signed ECDSA P-384 certificate using [infrastructures/certificates](infrastructures/certificates):

```sh
cd infrastructures/certificates
make macos-signing
```

This creates `slidevision-signing.p12` (the key and certificate, protected by a password) and `p12.pass` (that password). Git ignores both. The command refuses to run if `slidevision-signing.p12` already exists.

Copy both into the repository secrets under **Settings → Secrets and variables → Actions → Secrets**:

```sh
base64 -i slidevision-signing.p12 | pbcopy   # paste as MACOS_CERTIFICATE
tr -d '\n' < p12.pass | pbcopy              # paste as MACOS_CERTIFICATE_PASSWORD
```

### Tauri updater signing key

Every desktop release bundle (`.app.tar.gz` on macOS, `-setup.exe` on Windows) is signed so installed apps only apply updates matching `plugins.updater.pubkey` in [tauri.conf.json](workspaces/slidevision/src-tauri/tauri.conf.json).

Generate a Minisign Ed25519 keypair outside the repository:

```sh
mkdir -p ~/.tauri
pnpm --filter @slidevision/desktop tauri signer generate -w ~/.tauri/slidevision.key
```

1. Copy the contents of `~/.tauri/slidevision.key.pub` into `plugins.updater.pubkey` in [tauri.conf.json](workspaces/slidevision/src-tauri/tauri.conf.json).
2. Copy the private key into the repository secrets under **Settings → Secrets and variables → Actions → Secrets**:

```sh
pbcopy < ~/.tauri/slidevision.key   # paste as TAURI_SIGNING_PRIVATE_KEY
```

If you set a password when generating the key, also store it in the `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` secret.

## License

Slidevision is licensed under the [MIT License](LICENSE).
