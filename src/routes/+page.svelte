<script lang="ts">
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { open } from "@tauri-apps/plugin-dialog";
  import type { FormEventHandler } from "svelte/elements";


  let sidebarWidth = $state(260);
  let wallpaperStatus = $state("");
  let isDragging = $state(false);

  let searchQuery = $state("");
  let searchInputEl = $state<HTMLInputElement | null>(null);

  function sectionHasMatches(section: string): boolean {
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase();
    
    if (section === "presets") {
      return "presets resets default themes teal delight cyberpunk nordic frost sunset rose".includes(query);
    }
    if (section === "customCss") {
      return ["custom css", "css editor", "code editor", "stylesheet", "theme customization", "templates", "documentation"].some(s => s.includes(query));
    }
    if (section === "globalColors") {
      return ["global colors", "accent color", "chat list background", "headers & chat list bars", "right sidebar background", "active / highlight state", "right sidebar active row", "--wds-accent", "--background-default", "--wds-surface-default", "--wds-surface-emphasized", "--wds-surface-highlight", "--wds-components-active-list-row"].some(s => s.includes(query));
    }
    if (section === "chatBubbles") {
      return ["chat bubbles", "incoming bubble", "outgoing bubble", "bubble text color", "read checkmark", "--wds-systems-bubble-surface-incoming", "--wds-systems-bubble-surface-outgoing", "--message-primary", "--wds-content-read"].some(s => s.includes(query));
    }
    if (section === "textBadges") {
      return ["text & badges", "text and badges", "chat title text", "sidebar secondary text", "unread count badge", "unread count text", "--wds-content-default", "--wds-content-deemphasized", "--wds-persistent-always-branded", "--wds-content-on-accent"].some(s => s.includes(query));
    }
    if (section === "wallpaper") {
      return ["background & wallpaper", "background and wallpaper", "message composer input", "chat background color", "custom image wallpaper", "local file", "compress image", "--wds-systems-chat-surface-composer", "--wds-systems-chat-background-wallpaper"].some(s => s.includes(query));
    }
    if (section === "fixes") {
      return ["layout fixes", "search container gap", "fixes", "search container fix"].some(s => s.includes(query));
    }
    return false;
  }

  let activeSection = $state<string>("");

  let urlValue = $state("");
  let localFile = $state("");
  let compressImage = $state(true);

  // Color States
  let accentColor = $state("");
  let contentDeemphasized = $state("");
  let bubbleSurfaceIncoming = $state("");
  let bubbleSurfaceOutgoing = $state("");
  let chatSurfaceComposer = $state("");
  let surfaceHighlight = $state("");
  let surfaceDefault = $state("");
  let persistentAlwaysBranded = $state("");
  let contentDefault = $state("");
  let surfaceEmphasized = $state("");
  let messagePrimary = $state("");
  let contentRead = $state("");
  let contentOnAccent = $state("");
  let componentsActiveListRow = $state("");
  let backgroundDefault = $state("");
  let chatBackgroundWallpaper = $state("");

  let searchContainerFix = $state<"as-is" | "fixed">("as-is");
  let customCss = $state("");
  let editorTab = $state<"editor" | "docs">("editor");
  const cssPlaceholder = `/* Write your custom CSS here... */\n/* Example: */\nbody {\n  filter: sepia(0.3) !important;\n}`;

  function toggleSection(section: string) {
    activeSection = activeSection === section ? "" : section;
  }

  async function changeWallpaper(event: Event) {
    event.preventDefault();
    wallpaperStatus = "Changing...";
    try {
      if (localFile) {
        await invoke("set_chat_wallpaper_local", {
          filePath: localFile,
          compressImage: compressImage,
          saveToConfig: true,
        });
      } else if (urlValue) {
        await invoke("set_chat_wallpaper", {
          wallpaperUrl: urlValue,
          compressImage: compressImage,
          saveToConfig: true,
        });
      }
      wallpaperStatus = "Wallpaper changed!";
    } catch (e) {
      console.error("Tauri Invoke Error:", e);
      wallpaperStatus = `Failed: ${e}`;
    } finally {
      localFile = "";
      urlValue = "";
    }
    setTimeout(() => (wallpaperStatus = ""), 3000);
  }

  async function resetWallpaper() {
    wallpaperStatus = "Changing...";
    try {
      await invoke("reset_wallpaper_default");
      wallpaperStatus = "Wallpaper changed!";
    } catch (e) {
      console.error("Tauri Invoke Error:", e);
      wallpaperStatus = `Failed: ${e}`;
    }
    setTimeout(() => (wallpaperStatus = ""), 3000);
  }

  function startResize() {
    isDragging = true;
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResize);
  }

  function resize(event: { clientX: number }) {
    if (!isDragging) return;
    if (event.clientX > 70 && event.clientX < 500) {
      sidebarWidth = event.clientX;
      invoke("resize_sidebar", { newWidth: sidebarWidth });
    }
  }

  function stopResize() {
    isDragging = false;
    window.removeEventListener("mousemove", resize);
    window.removeEventListener("mouseup", stopResize);
  }

  async function selectLocalFile() {
    const selectedPath = await open({
      filters: [{ name: "Image", extensions: ["png", "jpeg", "jpg"] }],
    });
    if (selectedPath) {
      localFile = selectedPath;
    }
  }

  // Color Handlers
  const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

  function createColorHandler(
    setter: (val: string) => void,
    invokeCmd: string,
  ): FormEventHandler<HTMLInputElement> {
    return async (event) => {
      const currentColor = event.currentTarget.value;
      setter(currentColor);
      try {
        await invoke(invokeCmd, { color: currentColor, saveToConfig: false });
      } catch (e) {
        console.error(e);
      }

      const activeTimer = saveTimers.get(invokeCmd);
      if (activeTimer) {
        clearTimeout(activeTimer);
      }

      saveTimers.set(
        invokeCmd,
        setTimeout(async () => {
          try {
            await invoke(invokeCmd, { color: currentColor, saveToConfig: true });
          } catch (e) {
            console.error(e);
          }
          saveTimers.delete(invokeCmd);
        }, 500),
      );
    };
  }

  const applyAccentColor = createColorHandler(
    (v) => (accentColor = v),
    "set_accent_color",
  );
  const applyContentDeemphasized = createColorHandler(
    (v) => (contentDeemphasized = v),
    "set_content_deemphasized",
  );
  const applyBubbleSurfaceIncoming = createColorHandler(
    (v) => (bubbleSurfaceIncoming = v),
    "set_bubble_surface_incoming",
  );
  const applyBubbleSurfaceOutgoing = createColorHandler(
    (v) => (bubbleSurfaceOutgoing = v),
    "set_bubble_surface_outgoing",
  );
  const applyChatSurfaceComposer = createColorHandler(
    (v) => (chatSurfaceComposer = v),
    "set_chat_surface_composer",
  );
  const applySurfaceHighlight = createColorHandler(
    (v) => (surfaceHighlight = v),
    "set_surface_highlight",
  );
  const applySurfaceDefault = createColorHandler(
    (v) => (surfaceDefault = v),
    "set_surface_default",
  );
  const applyPersistentAlwaysBranded = createColorHandler(
    (v) => (persistentAlwaysBranded = v),
    "set_persistent_always_branded",
  );
  const applyContentDefault = createColorHandler(
    (v) => (contentDefault = v),
    "set_content_default",
  );
  const applySurfaceEmphasized = createColorHandler(
    (v) => (surfaceEmphasized = v),
    "set_surface_emphasized",
  );
  const applyMessagePrimary = createColorHandler(
    (v) => (messagePrimary = v),
    "set_message_primary",
  );
  const applyContentRead = createColorHandler(
    (v) => (contentRead = v),
    "set_content_read",
  );
  const applyContentOnAccent = createColorHandler(
    (v) => (contentOnAccent = v),
    "set_content_on_accent",
  );
  const applyComponentsActiveListRow = createColorHandler(
    (v) => (componentsActiveListRow = v),
    "set_components_active_list_row",
  );
  const applyBackgroundDefault = createColorHandler(
    (v) => (backgroundDefault = v),
    "set_background_default",
  );
  const applyChatBackgroundWallpaper = createColorHandler(
    (v) => (chatBackgroundWallpaper = v),
    "set_chat_background_wallpaper",
  );

  function handleCssInput(event: Event & { currentTarget: HTMLTextAreaElement }) {
    const value = event.currentTarget.value;
    customCss = value;
    
    // Live update the preview in webview
    invoke("set_custom_css", { css: value, saveToConfig: false }).catch(console.error);

    const activeTimer = saveTimers.get("set_custom_css");
    if (activeTimer) {
      clearTimeout(activeTimer);
    }

    saveTimers.set(
      "set_custom_css",
      setTimeout(async () => {
        try {
          await invoke("set_custom_css", { css: value, saveToConfig: true });
        } catch (e) {
          console.error(e);
        }
        saveTimers.delete("set_custom_css");
      }, 500),
    );
  }

  async function applyCssTemplate(template: "amoled" | "matrix") {
    let css = "";
    if (template === "amoled") {
      css = `/* AMOLED Black Theme */\nbody, #app, .dark, .light {\n  --background-default: #000000 !important;\n  --background-default-hover: #121212 !important;\n  --incoming-bubble-bg: #121212 !important;\n  --outgoing-bubble-bg: #002200 !important;\n}`;
    } else if (template === "matrix") {
      css = `/* Matrix Green Terminal */\nbody, #app, * {\n  color: #00ff00 !important;\n  font-family: 'JetBrains Mono', monospace !important;\n  border-color: #00ff00 !important;\n}\ninput, textarea {\n  background: #000000 !important;\n  color: #00ff00 !important;\n}`;
    }
    customCss = css;
    try {
      await invoke("set_custom_css", { css, saveToConfig: true });
    } catch (e) {
      console.error(e);
    }
  }

  // Defaults & Resets

  const DEFAULTS = {
    accentColor: "",
    contentDeemphasized: "",
    bubbleSurfaceIncoming: "",
    bubbleSurfaceOutgoing: "",
    chatSurfaceComposer: "",
    surfaceHighlight: "",
    surfaceDefault: "",
    persistentAlwaysBranded: "",
    contentDefault: "",
    surfaceEmphasized: "",
    messagePrimary: "",
    contentRead: "",
    contentOnAccent: "",
    componentsActiveListRow: "",
    backgroundDefault: "",
    chatBackgroundWallpaper: "",
  } as const;

  async function resetAllColors() {
    accentColor = DEFAULTS.accentColor;
    contentDeemphasized = DEFAULTS.contentDeemphasized;
    bubbleSurfaceIncoming = DEFAULTS.bubbleSurfaceIncoming;
    bubbleSurfaceOutgoing = DEFAULTS.bubbleSurfaceOutgoing;
    chatSurfaceComposer = DEFAULTS.chatSurfaceComposer;
    surfaceHighlight = DEFAULTS.surfaceHighlight;
    surfaceDefault = DEFAULTS.surfaceDefault;
    persistentAlwaysBranded = DEFAULTS.persistentAlwaysBranded;
    contentDefault = DEFAULTS.contentDefault;
    surfaceEmphasized = DEFAULTS.surfaceEmphasized;
    messagePrimary = DEFAULTS.messagePrimary;
    contentRead = DEFAULTS.contentRead;
    contentOnAccent = DEFAULTS.contentOnAccent;
    componentsActiveListRow = DEFAULTS.componentsActiveListRow;
    backgroundDefault = DEFAULTS.backgroundDefault;
    chatBackgroundWallpaper = DEFAULTS.chatBackgroundWallpaper;
    try {
      await invoke("reset_all_colors");
    } catch (e) {
      console.error(e);
    }
  }

  async function resetEverything() {
    await resetAllColors();
    urlValue = "";
    localFile = "";
    try {
      await invoke("reset_everything");
    } catch (e) {
      console.error(e);
    }
  }

  // Predefined color presets/themes
  const PRESETS = {
    teal: {
      accentColor: "#0d9488",
      backgroundDefault: "#0b0f12",
      surfaceDefault: "#12181d",
      surfaceEmphasized: "#182127",
      surfaceHighlight: "#202c34",
      componentsActiveListRow: "#0d9488",
      bubbleSurfaceIncoming: "#182127",
      bubbleSurfaceOutgoing: "#075e54",
      messagePrimary: "#e2e8f0",
      contentRead: "#34b7f1",
      contentDefault: "#f8fafc",
      contentDeemphasized: "#94a3b8",
      persistentAlwaysBranded: "#0d9488",
      contentOnAccent: "#ffffff",
      chatSurfaceComposer: "#12181d",
      chatBackgroundWallpaper: "#0b0f12",
    },
    cyberpunk: {
      accentColor: "#f43f5e",
      backgroundDefault: "#0f0f1b",
      surfaceDefault: "#18182f",
      surfaceEmphasized: "#22223f",
      surfaceHighlight: "#2e2e56",
      componentsActiveListRow: "#f43f5e",
      bubbleSurfaceIncoming: "#22223f",
      bubbleSurfaceOutgoing: "#1c1c3a",
      messagePrimary: "#e2e8f0",
      contentRead: "#38bdf8",
      contentDefault: "#f8fafc",
      contentDeemphasized: "#94a3b8",
      persistentAlwaysBranded: "#f43f5e",
      contentOnAccent: "#ffffff",
      chatSurfaceComposer: "#18182f",
      chatBackgroundWallpaper: "#0f0f1b",
    },
    nord: {
      accentColor: "#88c0d0",
      backgroundDefault: "#2e3440",
      surfaceDefault: "#3b4252",
      surfaceEmphasized: "#434c5e",
      surfaceHighlight: "#4c566a",
      componentsActiveListRow: "#88c0d0",
      bubbleSurfaceIncoming: "#3b4252",
      bubbleSurfaceOutgoing: "#434c5e",
      messagePrimary: "#d8dee9",
      contentRead: "#8fbcbb",
      contentDefault: "#eceff4",
      contentDeemphasized: "#d8dee9",
      persistentAlwaysBranded: "#88c0d0",
      contentOnAccent: "#2e3440",
      chatSurfaceComposer: "#3b4252",
      chatBackgroundWallpaper: "#2e3440",
    },
    sunset: {
      accentColor: "#f43f5e",
      backgroundDefault: "#1a1221",
      surfaceDefault: "#2b1e36",
      surfaceEmphasized: "#3a284a",
      surfaceHighlight: "#4b355e",
      componentsActiveListRow: "#f43f5e",
      bubbleSurfaceIncoming: "#3a284a",
      bubbleSurfaceOutgoing: "#4a2c3a",
      messagePrimary: "#f5e3e6",
      contentRead: "#ff8c7a",
      contentDefault: "#fff0f2",
      contentDeemphasized: "#c8b0cc",
      persistentAlwaysBranded: "#f43f5e",
      contentOnAccent: "#ffffff",
      chatSurfaceComposer: "#2b1e36",
      chatBackgroundWallpaper: "#1a1221",
    },
  } as const;

  async function applyPreset(presetName: keyof typeof PRESETS) {
    const preset = PRESETS[presetName];

    // Update frontend state reactively
    accentColor = preset.accentColor;
    backgroundDefault = preset.backgroundDefault;
    surfaceDefault = preset.surfaceDefault;
    surfaceEmphasized = preset.surfaceEmphasized;
    surfaceHighlight = preset.surfaceHighlight;
    componentsActiveListRow = preset.componentsActiveListRow;
    bubbleSurfaceIncoming = preset.bubbleSurfaceIncoming;
    bubbleSurfaceOutgoing = preset.bubbleSurfaceOutgoing;
    messagePrimary = preset.messagePrimary;
    contentRead = preset.contentRead;
    contentDefault = preset.contentDefault;
    contentDeemphasized = preset.contentDeemphasized;
    persistentAlwaysBranded = preset.persistentAlwaysBranded;
    contentOnAccent = preset.contentOnAccent;
    chatSurfaceComposer = preset.chatSurfaceComposer;
    chatBackgroundWallpaper = preset.chatBackgroundWallpaper;

    const payload = {
      wallpaper_url: null,
      local_path: null,
      use_local: false,
      compress_image: compressImage,
      main_color: accentColor || null,
      content_deemphasized: contentDeemphasized || null,
      bubble_surface_incoming: bubbleSurfaceIncoming || null,
      bubble_surface_outgoing: bubbleSurfaceOutgoing || null,
      chat_surface_composer: chatSurfaceComposer || null,
      surface_highlight: surfaceHighlight || null,
      surface_default: surfaceDefault || null,
      persistent_always_branded: persistentAlwaysBranded || null,
      content_default: contentDefault || null,
      surface_emphasized: surfaceEmphasized || null,
      message_primary: messagePrimary || null,
      content_read: contentRead || null,
      content_on_accent: contentOnAccent || null,
      components_active_list_row: componentsActiveListRow || null,
      background_default: backgroundDefault || null,
      chat_background_wallpaper: chatBackgroundWallpaper || null,
      search_container_fix: searchContainerFix || null,
    };

    try {
      await invoke("apply_config", { config: payload });
    } catch (e) {
      console.error("Failed to apply preset:", e);
    }
  }

  onMount(() => {
    async function loadConfig() {
      try {
        const config = await invoke<any>("get_config_for_frontend");
        accentColor = config.main_color ?? "";
        contentDeemphasized = config.content_deemphasized ?? "";
        bubbleSurfaceIncoming = config.bubble_surface_incoming ?? "";
        bubbleSurfaceOutgoing = config.bubble_surface_outgoing ?? "";
        chatSurfaceComposer = config.chat_surface_composer ?? "";
        surfaceHighlight = config.surface_highlight ?? "";
        surfaceDefault = config.surface_default ?? "";
        persistentAlwaysBranded = config.persistent_always_branded ?? "";
        contentDefault = config.content_default ?? "";
        surfaceEmphasized = config.surface_emphasized ?? "";
        messagePrimary = config.message_primary ?? "";
        contentRead = config.content_read ?? "";
        contentOnAccent = config.content_on_accent ?? "";
        componentsActiveListRow = config.components_active_list_row ?? "";
        backgroundDefault = config.background_default ?? "";
        chatBackgroundWallpaper = config.chat_background_wallpaper ?? "";
        searchContainerFix = (config.search_container_fix ?? "as-is") as
          | "as-is"
          | "fixed";
        customCss = config.custom_css ?? "";
      } catch (e) {
        console.error("Failed to load color config:", e);
      }
    }
    loadConfig();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputEl?.focus();
      } else if (e.key === "Escape" && document.activeElement === searchInputEl) {
        searchQuery = "";
        searchInputEl?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });
</script>

{#snippet colorSetting(
  label: string,
  hint: string,
  colorValue: string,
  applyFn: FormEventHandler<HTMLInputElement>,
  resetCmd: string,
  setter: (val: string) => void,
)}
  {#if !searchQuery || label.toLowerCase().includes(searchQuery.toLowerCase()) || hint.toLowerCase().includes(searchQuery.toLowerCase())}
    <div class="setting-group">
      <span class="setting-label"
        >{label} <span class="setting-hint">{hint}</span></span
      >
      <div class="color-picker-wrapper">
        <input
          type="color"
          class="color-input"
          value={colorValue}
          oninput={applyFn}
        />
        <span class="color-value">{colorValue || "Default"}</span>
        <button
          type="button"
          class="btn-color-reset"
          title="Reset to default"
          onclick={async () => {
            setter("");
            try {
              await invoke(resetCmd);
            } catch (e) {
              console.error(e);
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><polyline points="1 4 1 10 7 10"></polyline><path
              d="M3.51 15a9 9 0 1 0 .49-4.5"
            ></path></svg
          >
        </button>
      </div>
    </div>
  {/if}
{/snippet}

<div class="layout">
  <aside
    class="sidebar {sidebarWidth < 140 ? 'collapsed' : ''}"
    style="width: {sidebarWidth}px;"
  >
    <div class="sidebar-header">
      <div class="app-identity">
        <button
          class="app-icon-btn"
          type="button"
          title="Wrap It App"
          onclick={async () => {
            sidebarWidth = sidebarWidth > 140 ? 70 : 260;
            await invoke("resize_sidebar", { newWidth: sidebarWidth });
          }}
        >
          <img
            src="/favicon.png"
            width="20"
            height="20"
            alt="icon"
            class="app-icon-img"
          />
        </button>
        <span class="app-name">Wrap It App</span>
      </div>
      <div class="search-bar">
        <svg
          class="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><circle cx="11" cy="11" r="8" /><line
            x1="21"
            y1="21"
            x2="16.65"
            y2="16.65"
          /></svg
        >
        <input
          type="text"
          class="search-input"
          placeholder="Search tweaks…"
          bind:value={searchQuery}
          bind:this={searchInputEl}
        />
        <span class="search-kbd">⌘K</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <section class="nav-section">
        <span class="section-label">WhatsApp Tweaks</span>

        {#if !searchQuery || sectionHasMatches("presets")}
          <button
            class="nav-btn accordion-toggle {activeSection === 'presets' || searchQuery
              ? 'active'
              : ''}"
            onclick={() => toggleSection("presets")}
          >
            <div class="btn-content">
              <svg
                class="nav-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                ></path><path d="M3 3v5h5"></path></svg
              >
              <span class="nav-text">Presets & Resets</span>
            </div>
            <svg
              class="chevron-icon {activeSection === 'presets' || searchQuery ? 'open' : ''}"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><polyline points="6 9 12 15 18 9"></polyline></svg
            >
          </button>
          {#if activeSection === "presets" || searchQuery}
            <div class="accordion-content">
              <span class="setting-label" style="margin-bottom: -4px;">Themes</span>
              <div class="presets-grid">
                <button type="button" class="btn-preset theme-teal" onclick={() => applyPreset("teal")}>
                  Teal Delight
                </button>
                <button type="button" class="btn-preset theme-cyberpunk" onclick={() => applyPreset("cyberpunk")}>
                  Cyberpunk
                </button>
                <button type="button" class="btn-preset theme-nord" onclick={() => applyPreset("nord")}>
                  Nordic Frost
                </button>
                <button type="button" class="btn-preset theme-sunset" onclick={() => applyPreset("sunset")}>
                  Sunset Rose
                </button>
              </div>
              <div style="height: 1px; background: var(--border); margin: 8px 0;"></div>
              <button
                type="button"
                class="btn-danger-text w-full"
                onclick={resetEverything}
              >
                Reset Everything to Default
              </button>
              <button
                type="button"
                class="btn-danger-text w-full"
                onclick={resetAllColors}
              >
                Reset All Colors to Default
              </button>
            </div>
          {/if}
        {/if}

        {#if !searchQuery || sectionHasMatches("globalColors")}
          <button
            class="nav-btn accordion-toggle {activeSection === 'globalColors' || searchQuery
              ? 'active'
              : ''}"
            onclick={() => toggleSection("globalColors")}
          >
            <div class="btn-content">
              <svg
                class="nav-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><circle cx="12" cy="12" r="10"></circle><path
                  d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
                ></path><path d="M2 12h20"></path></svg
              >
              <span class="nav-text">Global Colors</span>
            </div>
            <svg
              class="chevron-icon {activeSection === 'globalColors' || searchQuery
                ? 'open'
                : ''}"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><polyline points="6 9 12 15 18 9"></polyline></svg
            >
          </button>
          {#if activeSection === "globalColors" || searchQuery}
            <div class="accordion-content">
              {@render colorSetting(
                "Accent Color",
                "--WDS-accent",
                accentColor,
                applyAccentColor,
                "reset_main_color",
                (v) => (accentColor = v),
              )}
              {@render colorSetting(
                "Chat List Background",
                "--background-default",
                backgroundDefault,
                applyBackgroundDefault,
                "reset_background_default",
                (v) => (backgroundDefault = v),
              )}
              {@render colorSetting(
                "Headers & Chat List Bars",
                "--WDS-surface-default",
                surfaceDefault,
                applySurfaceDefault,
                "reset_surface_default",
                (v) => (surfaceDefault = v),
              )}
              {@render colorSetting(
                "Right Sidebar Background",
                "--WDS-surface-emphasized",
                surfaceEmphasized,
                applySurfaceEmphasized,
                "reset_surface_emphasized",
                (v) => (surfaceEmphasized = v),
              )}
              {@render colorSetting(
                "Active / Highlight State",
                "--WDS-surface-highlight",
                surfaceHighlight,
                applySurfaceHighlight,
                "reset_surface_highlight",
                (v) => (surfaceHighlight = v),
              )}
              {@render colorSetting(
                "Right Sidebar Active Row",
                "--WDS-components-active-list-row",
                componentsActiveListRow,
                applyComponentsActiveListRow,
                "reset_components_active_list_row",
                (v) => (componentsActiveListRow = v),
              )}
            </div>
          {/if}
        {/if}

        {#if !searchQuery || sectionHasMatches("chatBubbles")}
          <button
            class="nav-btn accordion-toggle {activeSection === 'chatBubbles' || searchQuery
              ? 'active'
              : ''}"
            onclick={() => toggleSection("chatBubbles")}
          >
            <div class="btn-content">
              <svg
                class="nav-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                ></path></svg
              >
              <span class="nav-text">Chat Bubbles</span>
            </div>
            <svg
              class="chevron-icon {activeSection === 'chatBubbles' || searchQuery ? 'open' : ''}"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><polyline points="6 9 12 15 18 9"></polyline></svg
            >
          </button>
          {#if activeSection === "chatBubbles" || searchQuery}
            <div class="accordion-content">
              {@render colorSetting(
                "Incoming Bubble",
                "--WDS-systems-bubble-surface-incoming",
                bubbleSurfaceIncoming,
                applyBubbleSurfaceIncoming,
                "reset_bubble_surface_incoming",
                (v) => (bubbleSurfaceIncoming = v),
              )}
              {@render colorSetting(
                "Outgoing Bubble",
                "--WDS-systems-bubble-surface-outgoing",
                bubbleSurfaceOutgoing,
                applyBubbleSurfaceOutgoing,
                "reset_bubble_surface_outgoing",
                (v) => (bubbleSurfaceOutgoing = v),
              )}
              {@render colorSetting(
                "Bubble Text Color",
              "--message-primary",
              messagePrimary,
              applyMessagePrimary,
              "reset_message_primary",
              (v) => (messagePrimary = v),
            )}
            {@render colorSetting(
              "Read Checkmark",
              "--WDS-content-read",
              contentRead,
              applyContentRead,
              "reset_content_read",
              (v) => (contentRead = v),
            )}
          </div>
        {/if}

        {#if !searchQuery || sectionHasMatches("textBadges")}
          <button
            class="nav-btn accordion-toggle {activeSection === 'textBadges' || searchQuery
              ? 'active'
              : ''}"
            onclick={() => toggleSection("textBadges")}
          >
            <div class="btn-content">
              <svg
                class="nav-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><path d="M4 7V4h16v3"></path><path d="M9 20h6"></path><path
                  d="M12 4v16"
                ></path></svg
              >
              <span class="nav-text">Text & Badges</span>
            </div>
            <svg
              class="chevron-icon {activeSection === 'textBadges' || searchQuery ? 'open' : ''}"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><polyline points="6 9 12 15 18 9"></polyline></svg
            >
          </button>
          {#if activeSection === "textBadges" || searchQuery}
            <div class="accordion-content">
              {@render colorSetting(
                "Chat Title Text",
                "--WDS-content-default",
                contentDefault,
                applyContentDefault,
                "reset_content_default",
                (v) => (contentDefault = v),
              )}
              {@render colorSetting(
                "Sidebar Secondary Text",
                "--WDS-content-deemphasized",
                contentDeemphasized,
                applyContentDeemphasized,
                "reset_content_deemphasized",
                (v) => (contentDeemphasized = v),
              )}
              {@render colorSetting(
                "Unread Count Badge",
                "--WDS-persistent-always-branded",
                persistentAlwaysBranded,
                applyPersistentAlwaysBranded,
                "reset_persistent_always_branded",
                (v) => (persistentAlwaysBranded = v),
              )}
              {@render colorSetting(
                "Unread Count Text",
                "--WDS-content-on-accent",
                contentOnAccent,
                applyContentOnAccent,
                "reset_content_on_accent",
                (v) => (contentOnAccent = v),
              )}
            </div>
          {/if}
        {/if}        {#if !searchQuery || sectionHasMatches("wallpaper")}
          <button
            class="nav-btn accordion-toggle {activeSection === 'wallpaper' || searchQuery
              ? 'active'
              : ''}"
            onclick={() => toggleSection("wallpaper")}
          >
            <div class="btn-content">
              <svg
                class="nav-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><rect x="3" y="3" width="18" height="18" rx="2" ry="2"
                ></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline
                  points="21 15 16 10 5 21"
                ></polyline></svg
              >
              <span class="nav-text">Background & Wallpaper</span>
            </div>
            <svg
              class="chevron-icon {activeSection === 'wallpaper' || searchQuery ? 'open' : ''}"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><polyline points="6 9 12 15 18 9"></polyline></svg
            >
          </button>
          {#if activeSection === "wallpaper" || searchQuery}
            <div class="accordion-content">
              {@render colorSetting(
                "Message Composer Input",
                "--WDS-systems-chat-surface-composer",
                chatSurfaceComposer,
                applyChatSurfaceComposer,
                "reset_chat_surface_composer",
                (v) => (chatSurfaceComposer = v),
              )}
              {@render colorSetting(
                "Chat Background Color",
                "--WDS-systems-chat-background-wallpaper",
                chatBackgroundWallpaper,
                applyChatBackgroundWallpaper,
                "reset_chat_background_wallpaper",
                (v) => (chatBackgroundWallpaper = v),
              )}

              {#if !searchQuery || ["custom image wallpaper", "local file", "compress image"].some(s => s.includes(searchQuery.toLowerCase()))}
                <div class="setting-group" style="margin-top: 12px;">
                  <span class="setting-label">Custom Image Wallpaper</span>
                  <form onsubmit={changeWallpaper} class="wallpaper-form">
                    <input
                      type="text"
                      class="input-field"
                      placeholder="Paste image URL…"
                      bind:value={urlValue}
                    />
                    <div class="file-browse-row">
                      <button
                        type="button"
                        class="btn-outline"
                        onclick={selectLocalFile}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          ><path
                            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                          /><polyline points="17 8 12 3 7 8" /><line
                            x1="12"
                            y1="3"
                            x2="12"
                            y2="15"
                          /></svg
                        >
                        Local File
                      </button>
                      {#if localFile}
                        <span class="file-name" title={localFile}
                          >{localFile.split(/[/\\]/).pop()}</span
                        >
                      {/if}
                    </div>

                    <button
                      type="button"
                      class="toggle-row"
                      onclick={() => (compressImage = !compressImage)}
                      style="background: none; border: none; width: 100%; padding: 0;"
                    >
                      <span class="toggle-label">Compress Image</span>
                      <div class="switch {compressImage ? 'active' : ''}">
                        <div class="switch-thumb"></div>
                      </div>
                    </button>

                    {#if !compressImage}
                      <div class="warning-box">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          ><path
                            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                          /><line x1="12" y1="9" x2="12" y2="13" /><line
                            x1="12"
                            y1="17"
                            x2="12.01"
                            y2="17"
                          /></svg
                        >
                        Turning off compression may cause lag.
                      </div>
                    {/if}

                    <div class="action-row">
                      <button type="submit" class="btn-primary w-full"
                        >Apply Wallpaper</button
                      >
                      <button
                        type="button"
                        class="btn-danger-text w-full"
                        onclick={resetWallpaper}>Reset Wallpaper to Default</button
                      >
                    </div>
                  </form>
                  {#if wallpaperStatus}
                    <p class="status-msg">{wallpaperStatus}</p>
                  {/if}
                </div>
              {/if}
            </div>
          {/if}
        {/if} {/if}

        {#if !searchQuery || sectionHasMatches("customCss")}
          <button
            class="nav-btn accordion-toggle {activeSection === 'customCss' || searchQuery
              ? 'active'
              : ''}"
            onclick={() => toggleSection("customCss")}
          >
            <div class="btn-content">
              <svg
                class="nav-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><polyline points="16 18 22 12 16 6"></polyline><polyline
                  points="8 6 2 12 8 18"
                ></polyline></svg
              >
              <span class="nav-text">Custom CSS & Styling</span>
            </div>
            <svg
              class="chevron-icon {activeSection === 'customCss' || searchQuery ? 'open' : ''}"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><polyline points="6 9 12 15 18 9"></polyline></svg
            >
          </button>
          {#if activeSection === "customCss" || searchQuery}
            <div class="accordion-content">
              <div class="tab-header">
                <button
                  type="button"
                  class="tab-btn {editorTab === 'editor' ? 'active' : ''}"
                  onclick={() => (editorTab = "editor")}
                >
                  CSS Editor
                </button>
                <button
                  type="button"
                  class="tab-btn {editorTab === 'docs' ? 'active' : ''}"
                  onclick={() => (editorTab = "docs")}
                >
                  Variables Guide
                </button>
              </div>

              {#if editorTab === "editor"}
                <div class="editor-container">
                  <div class="editor-header">
                    <span class="editor-lang">CSS</span>
                    <button
                      type="button"
                      class="btn-editor-clear"
                      title="Clear CSS"
                      onclick={async () => {
                        customCss = "";
                        await invoke("set_custom_css", { css: "", saveToConfig: true });
                      }}
                    >
                      Clear
                    </button>
                  </div>
                  <textarea
                    class="code-textarea"
                    placeholder={cssPlaceholder}
                    value={customCss}
                    oninput={handleCssInput}
                  ></textarea>
                </div>

                <div class="template-loader-section">
                  <span class="setting-label">Quick Templates</span>
                  <div class="presets-grid">
                    <button
                      type="button"
                      class="btn-preset"
                      style="border-left: 3px solid #10b981;"
                      onclick={() => applyCssTemplate("amoled")}
                    >
                      AMOLED Black
                    </button>
                    <button
                      type="button"
                      class="btn-preset"
                      style="border-left: 3px solid #059669;"
                      onclick={() => applyCssTemplate("matrix")}
                    >
                      Matrix Green
                    </button>
                  </div>
                </div>
              {:else}
                <div class="docs-container">
                  <div class="docs-section">
                    <h4 class="docs-section-title">Key CSS Variables</h4>
                    <p class="docs-text">Override these inside <code>body</code> or <code>#app</code> using <code>!important</code>:</p>
                    <ul class="docs-list">
                      <li><code>--WDS-accent</code>: Primary green brand/accent color</li>
                      <li><code>--background-default</code>: Chat list sidebar background</li>
                      <li><code>--WDS-surface-default</code>: Header and bar background</li>
                      <li><code>--WDS-surface-emphasized</code>: Right-side panel background</li>
                      <li><code>--WDS-systems-bubble-surface-incoming</code>: Incoming chat bubble</li>
                      <li><code>--WDS-systems-bubble-surface-outgoing</code>: Outgoing chat bubble</li>
                    </ul>
                  </div>
                  <div class="docs-section" style="margin-top: 8px;">
                    <h4 class="docs-section-title">Useful Classes</h4>
                    <ul class="docs-list">
                      <li><code>.message-in</code>: Target incoming message container</li>
                      <li><code>.message-out</code>: Target outgoing message container</li>
                      <li><code>.selectable-text</code>: Message content text</li>
                    </ul>
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        {/if}

        {#if !searchQuery || sectionHasMatches("fixes")}
          <button
            class="nav-btn accordion-toggle {activeSection === 'fixes' || searchQuery
              ? 'active'
              : ''}"
            onclick={() => toggleSection("fixes")}
          >
            <div class="btn-content">
              <svg
                class="nav-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><path
                  d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                ></path></svg
              >
              <span class="nav-text">Layout Fixes</span>
            </div>
            <svg
              class="chevron-icon {activeSection === 'fixes' || searchQuery ? 'open' : ''}"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><polyline points="6 9 12 15 18 9"></polyline></svg
            >
          </button>
          {#if activeSection === "fixes" || searchQuery}
            <div class="accordion-content">
              <div class="setting-group">
                <span class="setting-label">Search Container Gap</span>
                <div class="segment-control">
                  <button
                    class="segment-btn {searchContainerFix === 'as-is'
                      ? 'active'
                      : ''}"
                    onclick={() => (searchContainerFix = "as-is")}>As-is</button
                  >
                  <button
                    class="segment-btn {searchContainerFix === 'fixed'
                      ? 'active'
                      : ''}"
                    onclick={() => (searchContainerFix = "fixed")}>Fixed</button
                  >
                </div>
              </div>
            </div>
          {/if}
        {/if}
      </section>
    </nav>

    <div class="sidebar-footer">
      <div class="footer-text">
        <p class="footer-title">Wrap It App Client</p>
        <p class="footer-sub">v1.2.0</p>
      </div>
    </div>

    <div class="resizer" onmousedown={startResize}></div>
  </aside>

  <main class="main-content"></main>
</div>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap");

  /* Keep all your original base CSS styles here ... */
  .presets-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 8px;
  }
  .btn-preset {
    background: var(--bg-main);
    border: 1px solid var(--border);
    color: var(--text-primary);
    border-radius: 6px;
    padding: 10px;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    text-align: center;
    transition: all 0.15s ease;
  }
  .btn-preset:hover {
    border-color: var(--border-hover);
    background: var(--bg-hover);
    transform: translateY(-1px);
  }
  .btn-preset:active {
    transform: translateY(0);
  }
  .btn-preset.theme-teal {
    border-left: 3px solid #0d9488;
  }
  .btn-preset.theme-cyberpunk {
    border-left: 3px solid #f43f5e;
  }
  .btn-preset.theme-nord {
    border-left: 3px solid #88c0d0;
  }
  .btn-preset.theme-sunset {
    border-left: 3px solid #b45309;
  }

  :root {
    --bg-main: #09090b;
    --bg-sidebar: #18181b;
    --bg-surface: #27272a;
    --bg-hover: #3f3f46;
    --text-primary: #fafafa;
    --text-secondary: #a1a1aa;
    --text-muted: #71717a;
    --accent: #10b981;
    --accent-hover: #059669;
    --danger: #ef4444;
    --border: #27272a;
    --border-hover: #3f3f46;
    font-family: "Inter", sans-serif;
    font-size: 13px;
    color: var(--text-primary);
    user-select: none;
    -webkit-user-select: none;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: var(--bg-main);
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .layout {
    display: flex;
    height: 100vh;
    width: 100vw;
  }
  .main-content {
    flex: 1;
    background-color: var(--bg-main);
  }

  .sidebar {
    position: relative;
    height: 100vh;
    background-color: var(--bg-sidebar);
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border);
    transition: width 0.1s ease;
  }

  .sidebar-header {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border-bottom: 1px solid var(--border);
  }
  .app-identity {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .app-icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    flex-shrink: 0;
    cursor: pointer;
    padding: 0;
    transition:
      background 0.15s,
      border-color 0.15s,
      transform 0.1s,
      box-shadow 0.15s;
  }
  .app-icon-btn:hover {
    background: var(--bg-hover);
    border-color: var(--border-hover);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  }
  .app-icon-btn:active {
    transform: scale(0.92);
    background: var(--bg-main);
    box-shadow: none;
  }
  .app-icon-img {
    display: block;
    border-radius: 4px;
  }
  .app-name {
    font-weight: 600;
    font-size: 14px;
    white-space: nowrap;
  }

  .search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-surface);
    border: 1px solid transparent;
    padding: 6px 10px;
    border-radius: 6px;
    color: var(--text-muted);
    font-size: 12px;
    transition: all 0.2s;
    cursor: pointer;
  }
  .search-bar:hover {
    border-color: var(--border-hover);
    color: var(--text-secondary);
  }
  .search-icon {
    flex-shrink: 0;
  }
  .search-input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-size: 12px;
    width: 100%;
    font-family: inherit;
    padding: 0;
  }
  .search-input::placeholder {
    color: var(--text-muted);
  }
  .search-kbd {
    margin-left: auto;
    font-size: 10px;
    font-family: "JetBrains Mono", monospace;
    background: var(--bg-hover);
    padding: 2px 4px;
    border-radius: 4px;
  }

  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 16px 12px;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
  .section-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
    display: block;
    padding-left: 8px;
    white-space: nowrap;
  }

  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: transparent;
    border: none;
    padding: 8px;
    border-radius: 6px;
    color: var(--text-secondary);
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }
  .nav-btn .btn-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .nav-btn:hover {
    background: var(--bg-surface);
    color: var(--text-primary);
  }
  .nav-btn.active {
    color: var(--text-primary);
    background: var(--bg-surface);
  }

  .chevron-icon {
    transition: transform 0.2s;
    flex-shrink: 0;
  }
  .chevron-icon.open {
    transform: rotate(180deg);
  }

  /* ── New Accordion Styles ── */
  .accordion-content {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 4px 0 8px 0;
    border: 1px solid var(--border);
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .setting-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-secondary);
  }
  .setting-hint {
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    color: var(--text-muted);
    font-weight: 400;
    opacity: 0.7;
  }

  .color-picker-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--bg-main);
    border: 1px solid var(--border);
    padding: 6px 8px;
    border-radius: 6px;
  }
  .btn-color-reset {
    margin-left: auto;
    background: none;
    border: none;
    padding: 2px;
    cursor: pointer;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    border-radius: 3px;
    opacity: 0.5;
    transition:
      opacity 0.15s,
      color 0.15s;
    flex-shrink: 0;
  }
  .btn-color-reset:hover {
    opacity: 1;
    color: var(--danger);
  }
  .color-input {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    padding: 0;
    background: transparent;
  }
  .color-input::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  .color-input::-webkit-color-swatch {
    border: 1px solid var(--border);
    border-radius: 4px;
  }
  .color-value {
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    color: var(--text-secondary);
    text-transform: uppercase;
  }

  .segment-control {
    display: flex;
    background: var(--bg-main);
    border-radius: 6px;
    padding: 2px;
    border: 1px solid var(--border);
  }
  .segment-btn {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-muted);
    padding: 6px;
    font-size: 12px;
    border-radius: 4px;
    cursor: pointer;
  }
  .segment-btn.active {
    background: var(--bg-surface);
    color: var(--text-primary);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .wallpaper-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .input-field {
    background: var(--bg-main);
    border: 1px solid var(--border);
    padding: 8px;
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 12px;
    width: 100%;
    outline: none;
    font-family: inherit;
  }
  .input-field:focus {
    border-color: var(--accent);
  }
  .file-browse-row {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
  }
  .file-name {
    font-size: 11px;
    font-family: "JetBrains Mono", monospace;
    color: var(--accent);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .toggle-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-family: inherit;
  }
  .toggle-label {
    font-size: 12px;
    color: var(--text-secondary);
  }
  .switch {
    width: 32px;
    height: 18px;
    background: var(--bg-main);
    border-radius: 10px;
    position: relative;
    transition: background 0.2s;
    border: 1px solid var(--border);
  }
  .switch.active {
    background: var(--accent);
    border-color: var(--accent);
  }
  .switch-thumb {
    width: 12px;
    height: 12px;
    background: var(--text-primary);
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.2s;
  }
  .switch.active .switch-thumb {
    transform: translateX(14px);
    background: #000;
  }

  .warning-box {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #fca5a5;
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 11px;
    display: flex;
    gap: 6px;
    align-items: center;
    margin-top: 4px;
  }
  .status-msg {
    font-size: 11px;
    font-family: "JetBrains Mono", monospace;
    color: var(--accent);
    margin: 0;
    text-align: center;
  }

  .action-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 4px;
  }
  .btn-outline,
  .btn-primary,
  .btn-danger-text {
    border: none;
    border-radius: 6px;
    padding: 8px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-family: inherit;
  }
  .w-full {
    width: 100%;
  }
  .btn-outline {
    background: var(--bg-main);
    border: 1px solid var(--border);
    color: var(--text-primary);
  }
  .btn-outline:hover {
    background: var(--bg-hover);
  }
  .btn-primary {
    background: var(--text-primary);
    color: var(--bg-main);
  }
  .btn-primary:hover {
    background: #e4e4e7;
  }
  .btn-danger-text {
    background: transparent;
    color: var(--danger);
  }
  .btn-danger-text:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 12px;
    overflow: hidden;
  }
  .footer-text {
    display: flex;
    flex-direction: column;
  }
  .footer-title {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
  }
  .footer-sub {
    margin: 0;
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .resizer {
    width: 6px;
    height: 100%;
    position: absolute;
    right: -3px;
    top: 0;
    cursor: col-resize;
    z-index: 20;
  }
  .resizer:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .sidebar.collapsed .app-name,
  .sidebar.collapsed .search-input,
  .sidebar.collapsed .search-kbd,
  .sidebar.collapsed .section-label,
  .sidebar.collapsed .nav-text,
  .sidebar.collapsed .chevron-icon,
  .sidebar.collapsed .footer-text,
  .sidebar.collapsed .accordion-content {
    display: none;
  }
  .sidebar.collapsed .sidebar-header {
    padding: 16px 8px;
  }
  .sidebar.collapsed .app-identity {
    justify-content: center;
  }
  .sidebar.collapsed .search-bar {
    justify-content: center;
    padding: 8px;
    border-radius: 8px;
  }
  .sidebar.collapsed .nav-btn {
    justify-content: center;
    padding: 10px;
  }
  .sidebar.collapsed .btn-content {
    justify-content: center;
  }
  .sidebar.collapsed .sidebar-footer {
    justify-content: center;
    padding: 16px 0;
  }

  /* ── Tabs Layout ── */
  .tab-header {
    display: flex;
    gap: 4px;
    background: var(--bg-main);
    padding: 3px;
    border-radius: 6px;
    border: 1px solid var(--border);
  }
  .tab-btn {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-muted);
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .tab-btn:hover {
    color: var(--text-secondary);
  }
  .tab-btn.active {
    background: var(--bg-surface);
    color: var(--text-primary);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  /* ── CSS Editor Textarea ── */
  .editor-container {
    display: flex;
    flex-direction: column;
    background: #000000;
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
  }
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    background: #111111;
    border-bottom: 1px solid var(--border);
  }
  .editor-lang {
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    font-weight: 600;
  }
  .btn-editor-clear {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 10px;
    cursor: pointer;
    font-weight: 500;
  }
  .btn-editor-clear:hover {
    color: var(--danger);
  }
  .code-textarea {
    background: transparent;
    border: none;
    outline: none;
    color: #4ade80;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    padding: 10px;
    resize: vertical;
    min-height: 120px;
    line-height: 1.5;
    tab-size: 2;
  }

  /* ── Documentation Layout ── */
  .docs-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 11px;
  }
  .docs-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .docs-section-title {
    margin: 0;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-primary);
  }
  .docs-text {
    margin: 0;
    color: var(--text-secondary);
  }
  .docs-list {
    margin: 0;
    padding-left: 16px;
    color: var(--text-muted);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .docs-list code {
    font-family: "JetBrains Mono", monospace;
    background: var(--bg-main);
    color: var(--text-secondary);
    padding: 1px 3px;
    border-radius: 3px;
    font-size: 10px;
  }
  .template-loader-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 4px;
  }
</style>
