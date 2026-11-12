const SETTINGS_KEY = 'wrapit:settings';
const STYLE_ENGINE_ID = 'wrapit-engine';
const STYLE_CUSTOM_ID = 'wrapit-custom-css';
const ROOT = document.documentElement;
const WRITTEN_KEYS = new Set();
const WALLPAPER_SELECTORS = '[data-testid="conversation-background-default_chat_wallpaper"], body #app [data-asset-chat-background-dark], body #app [data-asset-chat-background-light], body #app [data-asset-chat-background-beige]';
const RGB_PAIRS = {
  '--WDS-accent': '--WDS-accent-RGB',
  '--WDS-surface-highlight': '--WDS-surface-highlight-RGB',
  '--WDS-systems-bubble-surface-incoming': '--WDS-systems-bubble-surface-incoming-RGB',
  '--WDS-systems-bubble-surface-outgoing': '--WDS-systems-bubble-surface-outgoing-RGB',
};
const TOKEN_ALIASES = {
  '--WDS-accent': ['--accent', '--green', '--teal'],
  '--WDS-surface-default': ['--background-default', '--panel-background', '--conversation-panel-background'],
  '--WDS-surface-elevated-default': ['--panel-header-background', '--dropdown-background', '--reactions-panel-background-color'],
  '--WDS-surface-highlight': ['--hover-overlay', '--always-dark-overlay'],
  '--WDS-systems-bubble-surface-outgoing': ['--outgoing-bubble-background'],
  '--WDS-systems-bubble-surface-incoming': ['--incoming-bubble-background'],
  '--WDS-systems-chat-surface-composer': ['--compose-input-background', '--text-input-bar-background'],
  '--WDS-systems-chat-background-wallpaper': ['--conversation-background'],
  '--WDS-content-default': ['--message-primary', '--primary-strong', '--primary-text'],
  '--WDS-content-deemphasized': ['--secondary-text', '--bubble-meta', '--document-meta'],
  '--WDS-content-read': ['--icon-ack'],
  '--WDS-lines-divider': ['--divider', '--border-default'],
};
const PRESETS = {
  default: {},
  'teal-delight': {
    '--WDS-accent': '#14b8a6',
    '--WDS-accent-deemphasized': '#0f766e',
    '--WDS-accent-emphasized': '#99f6e4',
    '--WDS-accent-RGB': '20, 184, 166',
    '--WDS-persistent-always-branded': '#14b8a6',
    '--WDS-surface-default': '#111827',
    '--WDS-surface-elevated-default': '#1f2937',
    '--WDS-surface-elevated-emphasized': '#2d3748',
    '--WDS-surface-emphasized': '#2d3748',
    '--WDS-surface-highlight': '#374151',
    '--WDS-surface-highlight-RGB': '55, 65, 81',
    '--WDS-background-wash-plain': '#111827',
    '--WDS-background-wash-inset': '#111827',
    '--WDS-background-elevated-wash-plain': '#1f2937',
    '--WDS-background-elevated-wash-inset': '#1f2937',
    '--WDS-components-surface-nav-bar': '#1f2937',
    '--WDS-components-filter-surface-selected': '#0f766e',
    '--WDS-components-active-list-row': '#1f2937',
    '--WDS-systems-bubble-surface-incoming': '#374151',
    '--WDS-systems-bubble-surface-incoming-RGB': '55, 65, 81',
    '--WDS-systems-bubble-surface-outgoing': '#047857',
    '--WDS-systems-bubble-surface-outgoing-RGB': '4, 120, 87',
    '--WDS-systems-bubble-surface-overlay': '#374151',
    '--WDS-systems-chat-surface-composer': '#1f2937',
    '--WDS-systems-chat-background-wallpaper': '#0b0f19',
    '--WDS-content-default': '#f3f4f6',
    '--WDS-content-deemphasized': 'rgba(236, 252, 241, .6)',
    '--WDS-content-read': '#53bdeb',
    '--WDS-content-on-accent': '#ffffff',
    '--WDS-lines-divider': '#374151',
    '--WDS-lines-outline-default': '#374151',
  },
  cyberpunk: {
    '--WDS-accent': '#00ffff',
    '--WDS-accent-deemphasized': '#083344',
    '--WDS-accent-emphasized': '#e0f2fe',
    '--WDS-accent-RGB': '0, 255, 255',
    '--WDS-persistent-always-branded': '#00ffff',
    '--WDS-surface-default': '#0a0a0a',
    '--WDS-surface-elevated-default': '#111111',
    '--WDS-surface-elevated-emphasized': '#27272a',
    '--WDS-surface-emphasized': '#27272a',
    '--WDS-surface-highlight': '#3f3f46',
    '--WDS-surface-highlight-RGB': '63, 63, 70',
    '--WDS-background-wash-plain': '#000000',
    '--WDS-background-wash-inset': '#000000',
    '--WDS-background-elevated-wash-plain': '#111111',
    '--WDS-background-elevated-wash-inset': '#111111',
    '--WDS-components-surface-nav-bar': '#111111',
    '--WDS-components-filter-surface-selected': '#f472b6',
    '--WDS-components-active-list-row': '#18181b',
    '--WDS-systems-bubble-surface-incoming': '#222222',
    '--WDS-systems-bubble-surface-incoming-RGB': '34, 34, 34',
    '--WDS-systems-bubble-surface-outgoing': '#8a2be2',
    '--WDS-systems-bubble-surface-outgoing-RGB': '138, 43, 226',
    '--WDS-systems-bubble-surface-overlay': '#3f3f46',
    '--WDS-systems-chat-surface-composer': '#111111',
    '--WDS-systems-chat-background-wallpaper': '#050508',
    '--WDS-content-default': '#f4f4f5',
    '--WDS-content-deemphasized': 'rgba(224, 242, 254, .6)',
    '--WDS-content-read': '#00ffff',
    '--WDS-content-on-accent': '#000000',
    '--WDS-lines-divider': '#27272a',
    '--WDS-lines-outline-default': '#27272a',
  },
  'nordic-frost': {
    '--WDS-accent': '#88c0d0',
    '--WDS-accent-deemphasized': '#434c5e',
    '--WDS-accent-emphasized': '#e5e9f0',
    '--WDS-accent-RGB': '136, 192, 208',
    '--WDS-persistent-always-branded': '#88c0d0',
    '--WDS-surface-default': '#2e3440',
    '--WDS-surface-elevated-default': '#3b4252',
    '--WDS-surface-elevated-emphasized': '#4c566a',
    '--WDS-surface-emphasized': '#4c566a',
    '--WDS-surface-highlight': '#4c566a',
    '--WDS-surface-highlight-RGB': '76, 86, 106',
    '--WDS-background-wash-plain': '#2e3440',
    '--WDS-background-wash-inset': '#2e3440',
    '--WDS-background-elevated-wash-plain': '#3b4252',
    '--WDS-background-elevated-wash-inset': '#3b4252',
    '--WDS-components-surface-nav-bar': '#3b4252',
    '--WDS-components-filter-surface-selected': '#434c5e',
    '--WDS-components-active-list-row': '#3b4252',
    '--WDS-systems-bubble-surface-incoming': '#4c566a',
    '--WDS-systems-bubble-surface-incoming-RGB': '76, 86, 106',
    '--WDS-systems-bubble-surface-outgoing': '#5e81ac',
    '--WDS-systems-bubble-surface-outgoing-RGB': '94, 129, 172',
    '--WDS-systems-bubble-surface-overlay': '#4c566a',
    '--WDS-systems-chat-surface-composer': '#3b4252',
    '--WDS-systems-chat-background-wallpaper': '#242933',
    '--WDS-content-default': '#eceff4',
    '--WDS-content-deemphasized': 'rgba(236, 239, 244, .6)',
    '--WDS-content-read': '#88c0d0',
    '--WDS-content-on-accent': '#2e3440',
    '--WDS-lines-divider': '#4c566a',
    '--WDS-lines-outline-default': '#4c566a',
  },
  'sunset-rose': {
    '--WDS-accent': '#f472b6',
    '--WDS-accent-deemphasized': '#831843',
    '--WDS-accent-emphasized': '#fbcfe8',
    '--WDS-accent-RGB': '244, 114, 182',
    '--WDS-persistent-always-branded': '#f472b6',
    '--WDS-surface-default': '#1c1917',
    '--WDS-surface-elevated-default': '#292524',
    '--WDS-surface-elevated-emphasized': '#44403c',
    '--WDS-surface-emphasized': '#44403c',
    '--WDS-surface-highlight': '#57534e',
    '--WDS-surface-highlight-RGB': '87, 83, 78',
    '--WDS-background-wash-plain': '#1c1917',
    '--WDS-background-wash-inset': '#1c1917',
    '--WDS-background-elevated-wash-plain': '#292524',
    '--WDS-background-elevated-wash-inset': '#292524',
    '--WDS-components-surface-nav-bar': '#292524',
    '--WDS-components-filter-surface-selected': '#9d174d',
    '--WDS-components-active-list-row': '#292524',
    '--WDS-systems-bubble-surface-incoming': '#44403c',
    '--WDS-systems-bubble-surface-incoming-RGB': '68, 64, 60',
    '--WDS-systems-bubble-surface-outgoing': '#9f1239',
    '--WDS-systems-bubble-surface-outgoing-RGB': '159, 18, 57',
    '--WDS-systems-bubble-surface-overlay': '#57534e',
    '--WDS-systems-chat-surface-composer': '#292524',
    '--WDS-systems-chat-background-wallpaper': '#170f12',
    '--WDS-content-default': '#fef2f2',
    '--WDS-content-deemphasized': 'rgba(252, 241, 241, .6)',
    '--WDS-content-read': '#fda4af',
    '--WDS-content-on-accent': '#ffffff',
    '--WDS-lines-divider': '#44403c',
    '--WDS-lines-outline-default': '#44403c',
  },
};
let started = false;
let headObserver = null;
let rootObserver = null;
let currentSettings = {};
let lastEngineCss = '';
let lastCustomCss = '';

function hexToRgb(hex) {
  if (typeof hex !== 'string') return '';
  let h = hex.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(h)) {
    h = h.split('').map((c) => c + c).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return '';
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function readSettings() {
  return chrome.storage.local.get(SETTINGS_KEY).then((result) => result[SETTINGS_KEY] || {});
}

function clearRootVars() {
  for (const key of WRITTEN_KEYS) {
    ROOT.style.removeProperty(key);
  }
  WRITTEN_KEYS.clear();
}

function applyRootVars(vars) {
  clearRootVars();
  for (const [key, value] of Object.entries(vars)) {
    ROOT.style.setProperty(key, value);
    WRITTEN_KEYS.add(key);
    const aliases = TOKEN_ALIASES[key];
    if (aliases) {
      for (const alias of aliases) {
        ROOT.style.setProperty(alias, value);
        WRITTEN_KEYS.add(alias);
      }
    }
  }
}

function ensureStyle(id, text) {
  if (!document.head) return;
  let style = document.getElementById(id);
  if (!style) {
    style = document.createElement('style');
    style.id = id;
    document.head.appendChild(style);
  }
  if (style.textContent !== text) style.textContent = text;
}

function removeStyle(id) {
  const style = document.getElementById(id);
  if (style) style.remove();
}

function serializeVars(vars) {
  const lines = [];
  for (const [name, value] of Object.entries(vars)) {
    lines.push(`${name}: ${value} !important;`);
    const aliases = TOKEN_ALIASES[name];
    if (aliases) {
      for (const alias of aliases) {
        lines.push(`${alias}: ${value} !important;`);
      }
    }
  }
  if (lines.length === 0) return '';
  return `:root, body, #app, *, *::before, *::after { ${lines.join(' ')} }`;
}

function getWallpaper(settings) {
  const fallback = { type: 'none', color: '', dataUrl: '', posX: 50, posY: 50, scale: 100, repeat: false, brightness: 100 };
  if (!settings || typeof settings !== 'object') return fallback;
  const raw = settings.wallpaper;
  if (raw && typeof raw === 'object') {
    const brightness = typeof raw.brightness === 'number' && Number.isFinite(raw.brightness) ? Math.max(20, Math.min(100, Math.round(raw.brightness))) : 100;
    const type = raw.type;
    if (type === 'image') {
      const dataUrl = typeof raw.dataUrl === 'string' ? raw.dataUrl.trim() : '';
      if (dataUrl.startsWith('data:image/')) {
        const posX = typeof raw.posX === 'number' && Number.isFinite(raw.posX) ? Math.max(0, Math.min(100, Math.round(raw.posX))) : 50;
        const posY = typeof raw.posY === 'number' && Number.isFinite(raw.posY) ? Math.max(0, Math.min(100, Math.round(raw.posY))) : 50;
        const scale = typeof raw.scale === 'number' && Number.isFinite(raw.scale) ? Math.max(100, Math.min(250, Math.round(raw.scale))) : 100;
        const repeat = raw.repeat === true;
        return { type: 'image', color: '', dataUrl, posX, posY, scale, repeat, brightness };
      }
      return fallback;
    }
    if (type === 'color') {
      const color = typeof raw.color === 'string' ? raw.color.trim() : '';
      if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) return { type: 'color', color, dataUrl: '', brightness };
      return fallback;
    }
    if (type === 'none') return fallback;
  }
  const custom = typeof settings.customWallpaper === 'string' ? settings.customWallpaper.trim() : '';
  if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(custom)) return { type: 'color', color: custom, dataUrl: '' };
  return fallback;
}

function buildWallpaperCss(vars, settings) {
  const wallpaper = getWallpaper(settings);
  if (wallpaper.type === 'image') {
    const safe = wallpaper.dataUrl.replace(/'/g, '');
    const posX = typeof wallpaper.posX === 'number' ? Math.max(0, Math.min(100, wallpaper.posX)) : 50;
    const posY = typeof wallpaper.posY === 'number' ? Math.max(0, Math.min(100, wallpaper.posY)) : 50;
    const scale = typeof wallpaper.scale === 'number' && wallpaper.scale > 100 ? `${wallpaper.scale}%` : 'cover';
    const repeat = wallpaper.repeat ? 'repeat' : 'no-repeat';
    let bgImage = `url('${safe}')`;
    if (wallpaper.brightness < 100) {
      const dim = ((100 - wallpaper.brightness) / 100).toFixed(2);
      bgImage = `linear-gradient(rgba(0, 0, 0, ${dim}), rgba(0, 0, 0, ${dim})), url('${safe}')`;
    }
    return `${WALLPAPER_SELECTORS} { background-image: ${bgImage} !important; background-position: ${posX}% ${posY}% !important; background-size: ${scale} !important; background-repeat: ${repeat} !important; opacity: 1 !important; filter: none !important; mask-image: unset !important; mask-repeat: unset !important; mask-size: unset !important; }`;
  }
  const tokenColor = vars ? vars['--WDS-systems-chat-background-wallpaper'] : '';
  const custom = wallpaper.type === 'color' ? wallpaper.color : '';
  const color = custom || tokenColor || '';
  if (!color) return '';
  if (!/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) return '';
  if (wallpaper.brightness < 100) {
    const dim = ((100 - wallpaper.brightness) / 100).toFixed(2);
    return `${WALLPAPER_SELECTORS} { background-color: ${color} !important; background-image: linear-gradient(rgba(0, 0, 0, ${dim}), rgba(0, 0, 0, ${dim})) !important; }`;
  }
  return `${WALLPAPER_SELECTORS} { background-color: ${color} !important; background-image: none !important; }`;
}

function getResolvedVars(settings) {
  if (!settings || settings.enabled === false) return {};
  const resolved = { ...(PRESETS[settings.presetId] || {}) };
  if (settings.overrides && typeof settings.overrides === 'object') {
    Object.assign(resolved, settings.overrides);
  }
  for (const [hexKey, rgbKey] of Object.entries(RGB_PAIRS)) {
    if (resolved[hexKey] && !resolved[rgbKey]) {
      const rgb = hexToRgb(String(resolved[hexKey]));
      if (rgb) resolved[rgbKey] = rgb;
    }
  }
  return resolved;
}

function applySettings(settings) {
  currentSettings = settings || {};
  if (!currentSettings || currentSettings.enabled === false) {
    removeStyle(STYLE_ENGINE_ID);
    removeStyle(STYLE_CUSTOM_ID);
    clearRootVars();
    lastEngineCss = '';
    lastCustomCss = '';
    return;
  }

  const vars = getResolvedVars(currentSettings);
  applyRootVars(vars);
  const engineCss = serializeVars(vars);
  const wallpaperCss = buildWallpaperCss(vars, currentSettings);
  lastEngineCss = wallpaperCss ? `${engineCss} ${wallpaperCss}` : engineCss;
  ensureStyle(STYLE_ENGINE_ID, lastEngineCss);

  if (typeof currentSettings.customCss === 'string' && currentSettings.customCss.trim()) {
    lastCustomCss = currentSettings.customCss;
    ensureStyle(STYLE_CUSTOM_ID, lastCustomCss);
  } else {
    lastCustomCss = '';
    removeStyle(STYLE_CUSTOM_ID);
  }

  console.info('[Wrap It] applied', currentSettings.presetId || 'default');
}

function restoreStyles() {
  if (!document.head) return;
  if (!currentSettings || currentSettings.enabled === false) return;
  if (!document.getElementById(STYLE_ENGINE_ID) && lastEngineCss) {
    ensureStyle(STYLE_ENGINE_ID, lastEngineCss);
  } else if (!document.getElementById(STYLE_ENGINE_ID)) {
    applySettings(currentSettings);
    return;
  }
  if (lastCustomCss && !document.getElementById(STYLE_CUSTOM_ID)) {
    ensureStyle(STYLE_CUSTOM_ID, lastCustomCss);
  }
}

function watchHead() {
  if (!document.head || !document.documentElement) return;
  if (headObserver) return;
  headObserver = new MutationObserver(() => {
    if (!document.head) return;
    if (!document.getElementById(STYLE_ENGINE_ID)) {
      restoreStyles();
      return;
    }
    if (lastCustomCss && !document.getElementById(STYLE_CUSTOM_ID)) {
      restoreStyles();
    }
  });
  headObserver.observe(document.head, { childList: true });
  rootObserver = new MutationObserver(() => {
    if (!document.head) return;
    if (!document.head.contains(document.getElementById(STYLE_ENGINE_ID))) {
      restoreStyles();
    }
  });
  rootObserver.observe(document.documentElement, { childList: true });
}

function init() {
  if (started) return;
  started = true;
  readSettings().then(applySettings);
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes[SETTINGS_KEY]) return;
    applySettings(changes[SETTINGS_KEY].newValue || {});
  });
  if (document.head) {
    watchHead();
  } else {
    const boot = new MutationObserver(() => {
      if (document.head && document.documentElement) {
        boot.disconnect();
        watchHead();
        restoreStyles();
      }
    });
    boot.observe(document.documentElement, { childList: true });
  }
}

init();
