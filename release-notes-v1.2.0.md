# Release Notes: v1.2.0

This release brings substantial security hardening, critical bug fixes, and several new features (including theme presets, custom CSS editing, and search capability) to the **whats-wrap** WhatsApp Web desktop wrapper.

---

## 🔒 Security Hardening
* **Isolated Capabilities**: Split Svelte client and remote WhatsApp Webview capabilities. The remote webview now runs with restricted permissions (`core:event:allow-emit` only), blocking remote JavaScript from invoking native system commands or local APIs.
* **Content Security Policy (CSP)**: Enabled a strict CSP to mitigate cross-site scripting (XSS) and remote script injections.
* **Safe External Navigation**: Intercepted external link clicks within WhatsApp, forcing them to open in the user's default system browser using Tauri's native opener instead of loading inside the app frame.

## 🐛 Bug Fixes & Stability
* **Startup Panic Recovery**: Added corruption protection when parsing configuration files. If `config.json` is corrupted, the client automatically resets and restores it to healthy defaults instead of panicking on boot.
* **Write Race Conditions Resolved**: Combined multiple concurrent color persistence calls into a single unified `apply_config` transaction. This stops write race conditions and prevents file corruption.
* **Wallpaper Disappearance Fix**: Shifted the wallpaper/style injection logic to trigger on page-load completion rather than navigation. Setting overrides are now fully preserved across reloads.
* **Sidebar Layout Jump Fix**: Synchronized the backend window resize initialization width to `260px` to match Svelte frontend defaults, resolving layout snapping on startup.
* **Timer Debounce Fix**: Keyed saving timers by setting command name to prevent typing multiple adjustments concurrently from canceling the pending saves of others.
* **Error Feedback**: Enhanced wallpaper download commands to return error results and propagate status/network errors back to the frontend Svelte UI.

## ✨ New Features
* **Global Tweaks Search Bar**: Added a live search field in the sidebar (shortcut: `Ctrl+K` / `Cmd+K` to focus, `Escape` to clear) that automatically filters settings and expands matching accordions.
* **Interactive CSS Editor**: Added a new **Custom CSS & Styling** panel containing a styled monospace code editor. Users can write custom stylesheets, load templates, and preview styling changes in real time.
* **Quick Themes**: Preloaded 4 custom color presets:
  1. *Teal Delight* (Dark Teal Mode)
  2. *Cyberpunk* (Violet & Neon Pink)
  3. *Nordic Frost* (Arctic Grey & Ice Blue)
  4. *Sunset Rose* (Plum & Peach Gold)
* **Variables & Selectors Guide**: Documented CSS custom properties (`--WDS-accent`, `--background-default`, etc.) and elements (incoming/outgoing bubbles, chat list) in an interactive documentation tab inside the client.
