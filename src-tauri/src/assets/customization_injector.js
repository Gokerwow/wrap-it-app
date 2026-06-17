(function() {
    const payload = window.__whatsWrapPayload;
    if (!payload) return;
    console.log("payload", payload)

    // 1. Static Core Engine (For Wallpaper CSS structural rules)
    let WallTag = document.getElementById('wrap-wallpaper-engine');
    if (!WallTag) {
        WallTag = document.createElement('style');
        WallTag.id = 'wrap-wallpaper-engine';
        WallTag.textContent = payload.staticCssRules;
        document.head.appendChild(WallTag);
    }

    // 2. Dynamic Theme Engine (For Color Variables)
    let themeTag = document.getElementById('wrap-dynamic-theme');
    if (!themeTag) {
        themeTag = document.createElement('style');
        themeTag.id = 'wrap-dynamic-theme';
        document.head.appendChild(themeTag);
    }

    // 3. Setup Global State for Live Updates
    window.__whatsWrapState = {
        '--WDS-accent': payload.mainColor,
        '--WDS-content-default': payload.contentDefault,
        '--WDS-content-deemphasized': payload.contentDeemphasized,
        '--WDS-surface-default': payload.surfaceDefault,
        '--WDS-surface-highlight': payload.surfaceHighlight,
        '--WDS-surface-emphasized': payload.surfaceEmphasized,
        '--background-default': payload.backgroundDefault,
        '--WDS-systems-bubble-surface-incoming': payload.bubbleSurfaceIncoming,
        '--WDS-systems-bubble-surface-outgoing': payload.bubbleSurfaceOutgoing,
        '--message-primary': payload.messagePrimary,
        '--WDS-content-read': payload.contentRead,
        '--WDS-systems-chat-surface-composer': payload.chatSurfaceComposer,
        '--WDS-systems-chat-background-wallpaper': payload.chatBackgroundWallpaper,
        '--WDS-persistent-always-branded': payload.persistentAlwaysBranded,
        '--WDS-content-on-accent': payload.contentOnAccent,
        '--WDS-components-active-list-row': payload.componentsActiveListRow,
    };

    // 4. The Recompiler Function (Called by Rust during Live Preview)
    window.__whatsWrapUpdateTheme = function(prop, val) {
        if (prop !== undefined) {
            window.__whatsWrapState[prop] = val;
        }
        
        let cssVars = "";
        for (const [key, value] of Object.entries(window.__whatsWrapState)) {
            if (value) {
                // If a value exists, write it!
                cssVars += `${key}: ${value} !important;\n`;
            }
        }
        
        const tag = document.getElementById('wrap-dynamic-theme');
        if (tag) {
            // Target EVERYTHING to overpower WhatsApp's nested React components
            tag.textContent = `body, #app, .dark, .light, * { \n${cssVars}\n }`;
        }
    };

    // Initialize the colors immediately on load
    window.__whatsWrapUpdateTheme();

    // 5. Wallpaper specific (safe to leave inline on body)
    if (payload.wallpaperB64) {
        document.body.style.setProperty(
            '--whats-wrap-wallpaper',
            `url('data:image/jpeg;base64,${payload.wallpaperB64}')`,
            "important"
        );
    } else {
        WallTag.remove()
        document.body.style.removeProperty('--whats-wrap-wallpaper');
    }

    // 6. Search Fix
    if (payload.searchContainerFix === 'fixed') {
        const el = document.querySelector('[data-testid="chat-list-search-container"]');
        if (el) {
            const mb = window.getComputedStyle(el).marginBottom;
            el.style.marginBottom = '0';
            el.style.paddingBottom = mb || '8px';
        }
    }

    // 7. Custom CSS Engine
    let customCssTag = document.getElementById('wrap-custom-css');
    if (!customCssTag) {
        customCssTag = document.createElement('style');
        customCssTag.id = 'wrap-custom-css';
        document.head.appendChild(customCssTag);
    }
    customCssTag.textContent = payload.customCss || "";

    window.__whatsWrapUpdateCustomCss = function(cssText) {
        const tag = document.getElementById('wrap-custom-css');
        if (tag) {
            tag.textContent = cssText || "";
        }
    };
})();