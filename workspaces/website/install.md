# Install Slidevision

## Prerequisites

Slidevision uses your project's own Slidev installation, so install these once on your machine:

- **Node.js 22.22 or later**
- A Slidev project with `@slidev/cli` installed (either a single `slides.md` folder or a monorepo with `slidevision.json`)

## macOS

Slidevision supports macOS 11 or later on both Apple silicon and Intel Macs. To check which you have, open the Apple menu → **About This Mac**.

1. Download Slidevision for your Mac from the [home page](/) (**Apple silicon** or **Intel Mac**), then open the `.dmg`.
2. Drag **Slidevision** onto the **Applications** folder shortcut.
3. Open Slidevision. Because it is not notarized by Apple, macOS warns that it cannot verify the developer — click **Done**.
4. Open **System Settings** (or **System Preferences** on macOS 11–12) **→ Privacy & Security**, scroll down, and click **Open Anyway** next to the Slidevision message.

You only see that prompt on the first install.

## Windows

Slidevision supports Windows 10 (version 1809) or Windows 11 (`x64`).

1. Download Slidevision for Windows from the [home page](/) and run the setup installer.
2. If **Windows protected your PC** appears, click **More info**, then **Run anyway**.
3. Follow the installer. It installs for your user only, with no administrator prompt.

## Using Slidevision

- **Open a folder:** click **Open Folder…** (or press `⌘O` / `Ctrl+O`) and pick either a repository with `slidevision.json` or a folder containing `slides.md`. Recent projects stay on the welcome screen for quick access.
- **Browse slides:** click a deck card to start its Slidev server and view every slide rendered in an overview grid.
- **Present on one or two screens:** click **Play** on any slide.
  - With **two displays connected**, the fullscreen slides open on your external projector and the presenter view opens on your laptop.
  - With **one display connected**, Slidevision opens the deck fullscreen on that screen.
  - Press `Esc` in the presentation window (when not drawing or inside a dialog/input) to end the presentation.
- **Themes:** switch between **System**, **Light**, and **Dark** in the top-right corner of the app window.
- **Updates:** Slidevision checks for updates silently on startup, or on demand from the **Slidevision → Check for Updates…** menu on macOS (**Help → Check for Updates…** on Windows).
