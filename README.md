# Wrap It App

Wrap It App is a desktop wrapper for WhatsApp Web built with Tauri and Svelte. It provides extended customization options for the user interface, including custom color themes, chat bubble adjustments, and background modifications, while maintaining a low resource footprint compared to standard web clients.

## Features

- **UI Customization & Presets:** Override default interface colors (backgrounds, accents, list rows) or switch instantly between presets like *Teal Delight*, *Cyberpunk*, *Nordic Frost*, and *Sunset Rose*.
- **Monospace CSS Editor:** Inject custom raw stylesheets directly with real-time live preview rendering in the webview, complemented by quick AMOLED/Matrix style templates.
- **Variables & Selectors Guide:** Built-in documentation guide lists standard customization variables and HTML target classes.
- **Global Tweaks Search Bar:** Quickly search settings using the global search bar (focus with `Ctrl+K` / `Cmd+K`, clear with `Escape`).
- **Chat Bubbles:** Modify incoming and outgoing message bubbles, text colors, and read checkmark colors.
- **Custom Backgrounds:** Apply custom wallpaper using an image URL or a local file with optional JPEG compression.
- **Security Hardening:** Fully isolated capabilities, strict Content Security Policy (CSP), and automatic external link browser interception.
- **Lightweight:** Utilizes Tauri v2 Rust-based webview wrapper for a tiny resource footprint.

## Tech Stack

- **Frontend:** Svelte 5 (reactive runes), TypeScript, Vite
- **Backend:** Tauri v2 (Rust)
- **Package Manager:** Bun / Cargo

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- [Bun](https://bun.sh/)
- [Rust](https://www.rust-lang.org/tools/install)
- OS-specific build tools for Tauri (refer to the [Tauri v2 Prerequisites](https://v2.tauri.app/start/prerequisites/))

### Installation

1. Clone the repository:
 ```bash
 git clone [https://github.com/gokerwow/whats-wrap.git](https://github.com/gokerwow/whats-wrap.git)
 cd whats-wrap
```

2. Install dependencies:
```bash
bun install

```



### Development

Run the development server. This will start the Vite frontend and open the Tauri application window:

```bash
bun tauri dev

```

### Build

To compile the application into a standalone executable for your operating system:

```bash
bun tauri build

```

The compiled binaries will be located in the `src-tauri/target/release` directory.

## Roadmap

* [ ] Custom notification sounds
* [ ] Theme profile import/export (.json config)
* [ ] Multi-profile support

## Disclaimer

Wrap It App is an unofficial, third-party project built for personal use. It is not affiliated with, authorized, maintained, sponsored, or endorsed by WhatsApp, Meta Platforms, Inc., or any of their affiliates. Users are responsible for complying with WhatsApp's standard terms of service.
