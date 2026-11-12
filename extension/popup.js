const SETTINGS_KEY = 'wrapit:settings';

const TOKENS = {
  '--WDS-accent': { label: 'Accent', group: 'accent', default: '#21C063' },
  '--WDS-accent-deemphasized': { label: 'Accent soft', group: 'accent', default: '#103529' },
  '--WDS-accent-emphasized': { label: 'Accent bright', group: 'accent', default: '#D9FDD3' },
  '--WDS-accent-RGB': { label: 'Accent RGB', group: 'accent', default: '33, 192, 99' },
  '--WDS-persistent-always-branded': { label: 'Brand color', group: 'accent', default: '#21C063' },
  '--WDS-surface-default': { label: 'App background', group: 'surface', default: '#111827' },
  '--WDS-surface-elevated-default': { label: 'Raised surface', group: 'surface', default: '#1f2937' },
  '--WDS-surface-elevated-emphasized': { label: 'Elevated Emphasized', group: 'surface', default: '#2d3748' },
  '--WDS-surface-emphasized': { label: 'Surface Emphasized', group: 'surface', default: '#2d3748' },
  '--WDS-surface-highlight': { label: 'Highlight', group: 'surface', default: '#374151' },
  '--WDS-surface-highlight-RGB': { label: 'Surface Highlight RGB', group: 'surface', default: '55, 65, 81' },
  '--WDS-background-wash-plain': { label: 'Chat list bg', group: 'surface', default: '#111827' },
  '--WDS-background-wash-inset': { label: 'Chat list inset', group: 'surface', default: '#111827' },
  '--WDS-background-elevated-wash-plain': { label: 'Panel bg', group: 'surface', default: '#1f2937' },
  '--WDS-background-elevated-wash-inset': { label: 'Panel inset', group: 'surface', default: '#1f2937' },
  '--WDS-components-surface-nav-bar': { label: 'Top bar', group: 'surface', default: '#1f2937' },
  '--WDS-components-filter-surface-selected': { label: 'Selected filter', group: 'surface', default: '#0f766e' },
  '--WDS-components-active-list-row': { label: 'Active chat row', group: 'surface', default: '#1f2937' },
  '--WDS-systems-bubble-surface-incoming': { label: 'Incoming bubble', group: 'bubble', default: '#1f2937' },
  '--WDS-systems-bubble-surface-incoming-RGB': { label: 'Incoming Bubble RGB', group: 'bubble', default: '31, 41, 55' },
  '--WDS-systems-bubble-surface-outgoing': { label: 'Outgoing bubble', group: 'bubble', default: '#047857' },
  '--WDS-systems-bubble-surface-outgoing-RGB': { label: 'Outgoing Bubble RGB', group: 'bubble', default: '4, 120, 87' },
  '--WDS-systems-bubble-surface-overlay': { label: 'Bubble overlay', group: 'bubble', default: '#374151' },
  '--WDS-systems-chat-surface-composer': { label: 'Chat Composer Surface', group: 'composer', default: '#1f2937' },
  '--WDS-systems-chat-background-wallpaper': { label: 'Chat Wallpaper Color', group: 'composer', default: '#0b0f19' },
  '--WDS-content-default': { label: 'Message text', group: 'content', default: '#f3f4f6' },
  '--WDS-content-deemphasized': { label: 'Timestamp text', group: 'content', default: 'rgba(255, 255, 255, .6)' },
  '--WDS-content-read': { label: 'Read ticks', group: 'content', default: '#53bdeb' },
  '--WDS-content-on-accent': { label: 'Text on accent', group: 'content', default: '#ffffff' },
  '--WDS-lines-divider': { label: 'Dividers', group: 'lines', default: '#374151' },
  '--WDS-lines-outline-default': { label: 'Outlines', group: 'lines', default: '#374151' },
};

const UI_GROUPS = [
  {
    id: 'accent',
    title: 'Accent and Brand',
    icon: 'Accent',
    tokens: [
      '--WDS-accent',
      '--WDS-accent-deemphasized',
      '--WDS-accent-emphasized',
      '--WDS-persistent-always-branded',
    ],
  },
  {
    id: 'bubble',
    title: 'Message Bubbles',
    icon: 'Bubbles',
    tokens: [
      '--WDS-systems-bubble-surface-outgoing',
      '--WDS-systems-bubble-surface-incoming',
      '--WDS-systems-bubble-surface-overlay',
    ],
  },
  {
    id: 'surface',
    title: 'Surfaces and Panels',
    icon: 'Panels',
    tokens: [
      '--WDS-surface-default',
      '--WDS-surface-elevated-default',
      '--WDS-surface-highlight',
      '--WDS-components-surface-nav-bar',
      '--WDS-components-active-list-row',
      '--WDS-components-filter-surface-selected',
      '--WDS-background-wash-plain',
      '--WDS-background-wash-inset',
      '--WDS-background-elevated-wash-plain',
      '--WDS-background-elevated-wash-inset',
    ],
  },
  {
    id: 'content',
    title: 'Text and Indicators',
    icon: 'Text',
    tokens: [
      '--WDS-content-default',
      '--WDS-content-deemphasized',
      '--WDS-content-read',
      '--WDS-content-on-accent',
      '--WDS-lines-divider',
      '--WDS-lines-outline-default',
    ],
  },
];

const PRESETS = [
  { id: 'default', name: 'WhatsApp Default', vars: {} },
  {
    id: 'teal-delight',
    name: 'Teal Delight',
    vars: {
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
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    vars: {
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
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    vars: {
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
  },
  {
    id: 'sunset-rose',
    name: 'Sunset Rose',
    vars: {
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
  },
];

const HEX_TO_RGB = {
  '--WDS-accent': '--WDS-accent-RGB',
  '--WDS-surface-highlight': '--WDS-surface-highlight-RGB',
  '--WDS-systems-bubble-surface-incoming': '--WDS-systems-bubble-surface-incoming-RGB',
  '--WDS-systems-bubble-surface-outgoing': '--WDS-systems-bubble-surface-outgoing-RGB',
};

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const TABS = ['presets', 'customize', 'advanced'];
const AUTOMATCH_FALLBACK_ACCENTS = ['#21c063', '#14b8a6'];

const state = {
  settings: { enabled: false, presetId: 'default', overrides: {}, customCss: '', customWallpaper: '', wallpaper: { type: 'none', color: '#0b0f19', dataUrl: '' }, autoMatchOnWallpaperChange: false },
  timers: new Map(),
  filter: '',
  tab: 'presets',
  wallpaperMode: 'color',
  wallpaperBusy: false,
  autoMatchSnapshot: null,
  autoMatchBusy: false,
};

const $ = (sel) => document.querySelector(sel);
const presetGrid = $('#presetGrid');
const tokenGroups = $('#tokenGroups');
const enabledToggle = $('#enabledToggle');
const enabledLabel = $('#enabledLabel');
const customCss = $('#customCss');
const statusText = $('#statusText');
const statusDot = $('#statusDot');
const statusBadge = $('#statusBadge');
const resetAllButton = $('#resetAllButton');
const tokenSearch = $('#tokenSearch');
const searchEmpty = $('#searchEmpty');
const wallpaperInput = $('#wallpaperInput');
const wallpaperHex = $('#wallpaperHex');
const wallpaperClear = $('#wallpaperClear');
const wallpaperFile = $('#wallpaperFile');
const wallpaperUrl = $('#wallpaperUrl');
const wallpaperFetch = $('#wallpaperFetch');
const wallpaperThumb = $('#wallpaperThumb');
const wallpaperMeta = $('#wallpaperMeta');
const wallpaperActiveWrap = $('#wallpaperActiveWrap');
const wallpaperRemove = $('#wallpaperRemove');
const wallpaperStatus = $('#wallpaperStatus');
const wallpaperModeColor = $('#wallpaperModeColor');
const wallpaperModeFile = $('#wallpaperModeFile');
const wallpaperModeUrl = $('#wallpaperModeUrl');
const wallpaperPanelColor = $('#wallpaperPanelColor');
const wallpaperPanelFile = $('#wallpaperPanelFile');
const wallpaperPanelUrl = $('#wallpaperPanelUrl');
const wallpaperAdjustWrap = $('#wallpaperAdjustWrap');
const wallpaperPanPad = $('#wallpaperPanPad');
const wallpaperPanHandle = $('#wallpaperPanHandle');
const wallpaperAlignGrid = $('#wallpaperAlignGrid');
const wallpaperPosX = $('#wallpaperPosX');
const wallpaperPosY = $('#wallpaperPosY');
const wallpaperScale = $('#wallpaperScale');
const wallpaperRepeat = $('#wallpaperRepeat');
const wallpaperPosXValue = $('#wallpaperPosXValue');
const wallpaperPosYValue = $('#wallpaperPosYValue');
const wallpaperScaleValue = $('#wallpaperScaleValue');
const wallpaperBrightness = $('#wallpaperBrightness');
const wallpaperBrightnessValue = $('#wallpaperBrightnessValue');
const wallpaperResetPos = $('#wallpaperResetPos');
const autoMatchButton = $('#autoMatchButton');
const revertAutoMatchButton = $('#revertAutoMatchButton');
const autoMatchStatus = $('#autoMatchStatus');
const autoMatchToggle = $('#autoMatchToggle');
const previewChat = $('#previewChat');
const previewIncoming = $('#previewIncoming');
const previewOutgoing = $('#previewOutgoing');
const previewIncomingText = $('#previewIncomingText');
const previewOutgoingText = $('#previewOutgoingText');
const previewIncomingTime = $('#previewIncomingTime');
const previewOutgoingTime = $('#previewOutgoingTime');
const previewTicks = $('#previewTicks');
const tabButtons = {
  presets: $('#tab-presets'),
  customize: $('#tab-customize'),
  advanced: $('#tab-advanced'),
};
const tabPanels = {
  presets: $('#panel-presets'),
  customize: $('#panel-customize'),
  advanced: $('#panel-advanced'),
};

const WALLPAPER_FAILURE = 'Failed to load image from URL. Due to security restrictions on some hosts, download the image and use Image File instead.';
const WALLPAPER_INVALID = 'Invalid image file. Choose another image.';
const WALLPAPER_MAX = 1920;

function normalizeWallpaper(input, legacyColor) {
  const clampPos = (v, fallback) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.min(100, Math.round(n)));
  };
  const clampScale = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return 100;
    return Math.max(100, Math.min(250, Math.round(n)));
  };
  if (input && typeof input === 'object') {
    if (input.type === 'image' && typeof input.dataUrl === 'string' && input.dataUrl.startsWith('data:image/')) {
      return {
        type: 'image',
        color: '',
        dataUrl: input.dataUrl,
        width: Number(input.width) || 0,
        height: Number(input.height) || 0,
        posX: clampPos(input.posX, 50),
        posY: clampPos(input.posY, 50),
        scale: clampScale(input.scale),
        repeat: input.repeat === true,
        brightness: clampNumber(input.brightness, 20, 100, 100),
      };
    }
    if (input.type === 'color' && HEX_RE.test(String(input.color || ''))) {
      return { type: 'color', color: String(input.color).toLowerCase(), dataUrl: '', brightness: clampNumber(input.brightness, 20, 100, 100) };
    }
    if (input.type === 'none') return { type: 'none', color: '', dataUrl: '', brightness: 100 };
  }
  if (HEX_RE.test(legacyColor || '')) return { type: 'color', color: String(legacyColor).toLowerCase(), dataUrl: '' };
  return { type: 'none', color: '', dataUrl: '' };
}

function wallpaperGeom(wallpaper) {
  const w = wallpaper && typeof wallpaper === 'object' ? wallpaper : {};
  const posX = typeof w.posX === 'number' && Number.isFinite(w.posX) ? Math.max(0, Math.min(100, Math.round(w.posX))) : 50;
  const posY = typeof w.posY === 'number' && Number.isFinite(w.posY) ? Math.max(0, Math.min(100, Math.round(w.posY))) : 50;
  const scale = typeof w.scale === 'number' && Number.isFinite(w.scale) ? Math.max(100, Math.min(250, Math.round(w.scale))) : 100;
  const repeat = w.repeat === true;
  const brightness = typeof w.brightness === 'number' && Number.isFinite(w.brightness) ? Math.max(20, Math.min(100, Math.round(w.brightness))) : 100;
  return { posX, posY, scale, repeat, brightness };
}

function normalizeSettings(input) {
  const settings = input && typeof input === 'object' ? input : {};
  const legacyColor = typeof settings.customWallpaper === 'string' ? settings.customWallpaper : '';
  const wallpaper = normalizeWallpaper(settings.wallpaper, legacyColor);
  return {
    enabled: settings.enabled === true,
    presetId: typeof settings.presetId === 'string' ? settings.presetId : 'default',
    overrides: settings.overrides && typeof settings.overrides === 'object' ? { ...settings.overrides } : {},
    customCss: typeof settings.customCss === 'string' ? settings.customCss : '',
    customWallpaper: wallpaper.type === 'color' ? wallpaper.color : '',
    wallpaper,
    autoMatchOnWallpaperChange: settings.autoMatchOnWallpaperChange === true,
  };
}

function processImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || (typeof file.type === 'string' && file.type && !file.type.startsWith('image/'))) {
      reject(new Error(WALLPAPER_INVALID));
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, WALLPAPER_MAX / img.naturalWidth, WALLPAPER_MAX / img.naturalHeight);
        const width = Math.max(1, Math.round(img.naturalWidth * scale));
        const height = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        URL.revokeObjectURL(objectUrl);
        resolve({ dataUrl, width, height, sizeKb: Math.round((dataUrl.length * 3) / 4096) });
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(WALLPAPER_INVALID));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(WALLPAPER_INVALID));
    };
    img.src = objectUrl;
  });
}

async function processImageUrl(url) {
  let parsed;
  try {
    parsed = new URL(String(url || '').trim());
  } catch (err) {
    throw new Error(WALLPAPER_FAILURE);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error(WALLPAPER_FAILURE);
  let response;
  try {
    response = await fetch(parsed.toString());
  } catch (err) {
    throw new Error(WALLPAPER_FAILURE);
  }
  if (!response || !response.ok) throw new Error(WALLPAPER_FAILURE);
  const blob = await response.blob();
  if (!blob || typeof blob.type !== 'string' || !blob.type.startsWith('image/')) throw new Error(WALLPAPER_FAILURE);
  try {
    return await processImageFile(blob);
  } catch (err) {
    throw new Error(WALLPAPER_FAILURE);
  }
}

function setWallpaperStatus(message, isError) {
  if (!wallpaperStatus) return;
  wallpaperStatus.textContent = message || '';
  wallpaperStatus.dataset.state = message ? (isError ? 'error' : 'ok') : '';
}

function setWallpaperMode(mode) {
  if (!['color', 'file', 'url'].includes(mode)) return;
  state.wallpaperMode = mode;
  const modes = { color: wallpaperModeColor, file: wallpaperModeFile, url: wallpaperModeUrl };
  const panels = { color: wallpaperPanelColor, file: wallpaperPanelFile, url: wallpaperPanelUrl };
  for (const key of Object.keys(modes)) {
    const active = key === mode;
    if (modes[key]) modes[key].setAttribute('aria-pressed', String(active));
    if (panels[key]) panels[key].hidden = !active;
  }
}

function formatScaleLabel(scale) {
  if (scale <= 100) return '100% (Cover)';
  return `${scale}%`;
}

function syncAdjustControls() {
  const wallpaper = state.settings.wallpaper || { type: 'none' };
  const isImage = wallpaper.type === 'image' && typeof wallpaper.dataUrl === 'string' && wallpaper.dataUrl.startsWith('data:image/');
  if (wallpaperAdjustWrap) wallpaperAdjustWrap.hidden = !isImage;
  if (!isImage) return;
  const geom = wallpaperGeom(wallpaper);
  if (wallpaperPanPad) {
    wallpaperPanPad.style.backgroundImage = `url("${wallpaper.dataUrl}")`;
    wallpaperPanPad.style.backgroundPosition = `${geom.posX}% ${geom.posY}%`;
    wallpaperPanPad.style.backgroundSize = geom.scale > 100 ? `${geom.scale}%` : 'cover';
    wallpaperPanPad.style.backgroundRepeat = geom.repeat ? 'repeat' : 'no-repeat';
  }
  if (wallpaperPanHandle) {
    wallpaperPanHandle.style.left = `${geom.posX}%`;
    wallpaperPanHandle.style.top = `${geom.posY}%`;
    wallpaperPanHandle.setAttribute('aria-valuetext', `${geom.posX} percent horizontal, ${geom.posY} percent vertical`);
  }
  if (wallpaperPosX) wallpaperPosX.value = String(geom.posX);
  if (wallpaperPosY) wallpaperPosY.value = String(geom.posY);
  if (wallpaperScale) wallpaperScale.value = String(geom.scale);
  if (wallpaperRepeat) wallpaperRepeat.checked = geom.repeat;
  if (wallpaperBrightness) wallpaperBrightness.value = String(geom.brightness);
  if (wallpaperPosXValue) wallpaperPosXValue.textContent = `${geom.posX}%`;
  if (wallpaperPosYValue) wallpaperPosYValue.textContent = `${geom.posY}%`;
  if (wallpaperScaleValue) wallpaperScaleValue.textContent = formatScaleLabel(geom.scale);
  if (wallpaperBrightnessValue) wallpaperBrightnessValue.textContent = geom.brightness === 100 ? '100% (Normal)' : `${geom.brightness}%`;
  if (wallpaperAlignGrid) {
    const buttons = wallpaperAlignGrid.querySelectorAll('button[data-x]');
    for (const btn of buttons) {
      const bx = Number(btn.dataset.x);
      const by = Number(btn.dataset.y);
      btn.dataset.active = String(bx === geom.posX && by === geom.posY);
    }
  }
}

function applyWallpaperGeom(patch) {
  const wallpaper = state.settings.wallpaper;
  if (!wallpaper || wallpaper.type !== 'image') return;
  const base = wallpaperGeom(wallpaper);
  const posX = patch.posX !== undefined ? Math.max(0, Math.min(100, Math.round(Number(patch.posX)))) : base.posX;
  const posY = patch.posY !== undefined ? Math.max(0, Math.min(100, Math.round(Number(patch.posY)))) : base.posY;
  const scale = patch.scale !== undefined ? Math.max(100, Math.min(250, Math.round(Number(patch.scale)))) : base.scale;
  const repeat = patch.repeat !== undefined ? patch.repeat === true : base.repeat;
  const brightness = patch.brightness !== undefined ? Math.max(20, Math.min(100, Math.round(Number(patch.brightness)))) : base.brightness;
  const safeX = Number.isFinite(posX) ? posX : base.posX;
  const safeY = Number.isFinite(posY) ? posY : base.posY;
  const safeScale = Number.isFinite(scale) ? scale : base.scale;
  const safeBrightness = Number.isFinite(brightness) ? brightness : base.brightness;
  state.settings.wallpaper = { ...wallpaper, posX: safeX, posY: safeY, scale: safeScale, repeat, brightness: safeBrightness };
  syncAdjustControls();
  updatePreview();
  schedulePersist('wallpaper', state.settings.wallpaper);
}

function wallpaperPosFromEvent(event) {
  if (!wallpaperPanPad) return null;
  const rect = wallpaperPanPad.getBoundingClientRect();
  if (!rect || rect.width <= 0 || rect.height <= 0) return null;
  let clientX = 0;
  let clientY = 0;
  if (event && typeof event.clientX === 'number') {
    clientX = event.clientX;
    clientY = event.clientY;
  } else if (event && event.touches && event.touches[0]) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    return null;
  }
  const x = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)));
  const y = Math.max(0, Math.min(100, Math.round(((clientY - rect.top) / rect.height) * 100)));
  return { posX: x, posY: y };
}

let panDragging = false;

function handlePanStart(event) {
  const pos = wallpaperPosFromEvent(event);
  if (!pos) return;
  const wallpaper = state.settings.wallpaper;
  if (!wallpaper || wallpaper.type !== 'image') return;
  panDragging = true;
  if (event && event.preventDefault) event.preventDefault();
  try {
    if (wallpaperPanPad && event && event.pointerId !== undefined && wallpaperPanPad.setPointerCapture) {
      wallpaperPanPad.setPointerCapture(event.pointerId);
    }
  } catch (err) {
    /* capture is best effort */
  }
  applyWallpaperGeom(pos);
}

function handlePanMove(event) {
  if (!panDragging) return;
  const pos = wallpaperPosFromEvent(event);
  if (!pos) return;
  if (event && event.preventDefault && event.cancelable !== false) event.preventDefault();
  applyWallpaperGeom(pos);
}

function handlePanEnd() {
  panDragging = false;
}

function renderWallpaper() {
  const wallpaper = state.settings.wallpaper || { type: 'none' };
  if (wallpaper.type === 'image' && wallpaperThumb && wallpaperActiveWrap) {
    wallpaperThumb.src = wallpaper.dataUrl;
    wallpaperActiveWrap.hidden = false;
    if (wallpaperMeta) {
      const dims = wallpaper.width && wallpaper.height ? `${wallpaper.width}x${wallpaper.height}px` : 'image';
      const size = wallpaper.dataUrl ? `, about ${Math.round((wallpaper.dataUrl.length * 3) / 4096)}KB stored` : '';
      wallpaperMeta.textContent = `Active image wallpaper, ${dims}${size}.`;
    }
  } else if (wallpaperActiveWrap) {
    wallpaperActiveWrap.hidden = true;
    if (wallpaperThumb) wallpaperThumb.removeAttribute('src');
    if (wallpaperMeta) wallpaperMeta.textContent = '';
  }
  if (wallpaper.type === 'image') setWallpaperMode('file');
  else if (state.wallpaperMode === 'file' && wallpaper.type !== 'image') setWallpaperMode(state.wallpaperMode);
  syncAdjustControls();
}

function saveWallpaper(wallpaper, autoMatchSeed) {
  const next = normalizeSettings(state.settings);
  next.wallpaper = normalizeWallpaper(wallpaper, '');
  next.customWallpaper = next.wallpaper.type === 'color' ? next.wallpaper.color : '';
  persist(next);
  renderAll();
  scheduleAutoMatchAfterWallpaper(autoMatchSeed || null);
}

async function applyFileBlob(file) {
  if (state.wallpaperBusy) return;
  state.wallpaperBusy = true;
  setWallpaperStatus('Processing image...', false);
  try {
    const result = await processImageFile(file);
    saveWallpaper(
      { type: 'image', dataUrl: result.dataUrl, width: result.width, height: result.height, posX: 50, posY: 50, scale: 100, repeat: false },
      { kind: 'image', dataUrl: result.dataUrl },
    );
    setWallpaperStatus(`Wallpaper applied, ${result.width}x${result.height}px, about ${result.sizeKb}KB stored.`, false);
  } catch (err) {
    setWallpaperStatus(err && err.message ? err.message : WALLPAPER_INVALID, true);
  } finally {
    state.wallpaperBusy = false;
    if (wallpaperFile) wallpaperFile.value = '';
  }
}

function persist(next) {
  for (const timer of state.timers.values()) clearTimeout(timer);
  state.timers.clear();
  state.settings = normalizeSettings(next);
  chrome.storage.local.set({ [SETTINGS_KEY]: state.settings });
}

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
  else if (max === gn) h = ((bn - rn) / d + 2) * 60;
  else h = ((rn - gn) / d + 4) * 60;
  return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
  const hn = ((Number(h) % 360) + 360) % 360 / 360;
  const sn = clampNumber(s, 0, 100, 0) / 100;
  const ln = clampNumber(l, 0, 100, 0) / 100;
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const channel = (t) => {
    let tc = t;
    if (tc < 0) tc += 1;
    if (tc > 1) tc -= 1;
    if (tc < 1 / 6) return p + (q - p) * 6 * tc;
    if (tc < 1 / 2) return q;
    if (tc < 2 / 3) return p + (q - p) * (2 / 3 - tc) * 6;
    return p;
  };
  const toByte = (v) => Math.round(clampNumber(v, 0, 1, 0) * 255).toString(16).padStart(2, '0');
  return `#${toByte(channel(hn + 1 / 3))}${toByte(channel(hn))}${toByte(channel(hn - 1 / 3))}`;
}

function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const parts = rgb.split(',').map((n) => Number(n.trim()));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  return rgbToHsl(parts[0], parts[1], parts[2]);
}

function loadWallpaperImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('unreadable'));
    img.src = dataUrl;
  });
}

function sampleImageHsl(img) {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, size, size);
  let data = null;
  try {
    data = ctx.getImageData(0, 0, size, size).data;
  } catch (err) {
    return [];
  }
  const samples = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    samples.push(rgbToHsl(data[i], data[i + 1], data[i + 2]));
  }
  return samples;
}

function dominantHueAndSaturation(samples) {
  const buckets = 36;
  const weight = new Array(buckets).fill(0);
  const satSum = new Array(buckets).fill(0);
  const satCount = new Array(buckets).fill(0);
  let totalSat = 0;
  let totalCount = 0;
  for (const px of samples) {
    if (px.l < 10 || px.l > 90) continue;
    const idx = Math.min(buckets - 1, Math.floor(px.h / (360 / buckets)));
    weight[idx] += 1 + px.s / 100;
    if (px.s >= 8) {
      satSum[idx] += px.s;
      satCount[idx] += 1;
    }
    totalSat += px.s;
    totalCount += 1;
  }
  let best = 0;
  for (let i = 1; i < buckets; i++) {
    if (weight[i] > weight[best]) best = i;
  }
  const h = best * (360 / buckets) + 360 / buckets / 2;
  const bucketSat = satCount[best] > 0 ? satSum[best] / satCount[best] : 0;
  const overallSat = totalCount > 0 ? totalSat / totalCount : 0;
  const s = clampNumber(Math.max(bucketSat, overallSat), 15, 60, 30);
  return { h, s };
}

function pickVibrantAccent(samples) {
  let best = null;
  for (const px of samples) {
    if (px.l < 15 || px.l > 85) continue;
    if (px.s < 35 || px.l < 35 || px.l > 75) continue;
    if (!best || px.s > best.s) best = px;
  }
  return best;
}

function buildAutoMatchPalette(baseH, baseS, accentHex, accentH) {
  const surfSat = baseS * 0.25;
  const surf = (l) => hslToHex(baseH, surfSat, l);
  const accent = accentHex.toLowerCase();
  const incoming = surf(20);
  const outgoing = hslToHex(accentH, 65, 24);
  const highlight = surf(22);
  return {
    '--WDS-accent': accent,
    '--WDS-accent-RGB': hexToRgb(accent),
    '--WDS-persistent-always-branded': accent,
    '--WDS-surface-default': surf(8),
    '--WDS-surface-elevated-default': surf(13),
    '--WDS-surface-elevated-emphasized': surf(17),
    '--WDS-surface-emphasized': surf(17),
    '--WDS-surface-highlight': highlight,
    '--WDS-surface-highlight-RGB': hexToRgb(highlight),
    '--WDS-background-wash-plain': surf(7),
    '--WDS-background-wash-inset': surf(7),
    '--WDS-components-surface-nav-bar': surf(12),
    '--WDS-components-active-list-row': hslToHex(baseH, baseS * 0.3, 18),
    '--WDS-systems-bubble-surface-incoming': incoming,
    '--WDS-systems-bubble-surface-incoming-RGB': hexToRgb(incoming),
    '--WDS-systems-bubble-surface-outgoing': outgoing,
    '--WDS-systems-bubble-surface-outgoing-RGB': hexToRgb(outgoing),
    '--WDS-systems-chat-surface-composer': surf(13),
    '--WDS-content-default': '#f3f4f6',
    '--WDS-content-deemphasized': 'rgba(240, 243, 245, 0.65)',
    '--WDS-content-read': '#53bdeb',
  };
}

async function resolveAutoMatchSeed(force) {
  if (force) return force;
  const wallpaper = state.settings.wallpaper || { type: 'none' };
  if (wallpaper.type === 'image' && typeof wallpaper.dataUrl === 'string' && wallpaper.dataUrl.startsWith('data:image/')) {
    return { kind: 'image', dataUrl: wallpaper.dataUrl };
  }
  if (wallpaper.type === 'color' && HEX_RE.test(wallpaper.color || '')) {
    return { kind: 'color', hex: wallpaper.color.toLowerCase() };
  }
  const presetVars = presetById(state.settings.presetId).vars || {};
  const tokenColor = presetVars['--WDS-systems-chat-background-wallpaper'] || TOKENS['--WDS-systems-chat-background-wallpaper'].default;
  const hex = toHexColor(tokenColor, '#0b0f19');
  return { kind: 'color', hex };
}

function setAutoMatchStatus(message, isError) {
  if (!autoMatchStatus) return;
  autoMatchStatus.textContent = message || '';
  autoMatchStatus.dataset.state = message ? (isError ? 'error' : 'ok') : '';
}

function syncAutoMatchUI() {
  const hasSnapshot = Boolean(state.autoMatchSnapshot) && Object.keys(state.autoMatchSnapshot).length > 0;
  if (revertAutoMatchButton) revertAutoMatchButton.hidden = !hasSnapshot;
  if (autoMatchToggle) autoMatchToggle.checked = state.settings.autoMatchOnWallpaperChange === true;
}

async function runAutoMatch(forceSeed) {
  if (state.autoMatchBusy) return false;
  state.autoMatchBusy = true;
  setAutoMatchStatus('Analyzing wallpaper...', false);
  try {
    const seed = await resolveAutoMatchSeed(forceSeed || null);
    if (!seed) {
      setAutoMatchStatus('Set a wallpaper first, then auto-match.', true);
      return false;
    }
    let baseH = 220;
    let baseS = 30;
    let accentHex = AUTOMATCH_FALLBACK_ACCENTS[0];
    let accentHsl = hexToHsl(accentHex);
    let accentH = accentHsl ? accentHsl.h : 140;
    if (seed.kind === 'image') {
      const img = await loadWallpaperImage(seed.dataUrl);
      const samples = sampleImageHsl(img);
      if (samples.length === 0) throw new Error('empty');
      const dom = dominantHueAndSaturation(samples);
      baseH = dom.h;
      baseS = dom.s;
      const vibrant = pickVibrantAccent(samples);
      if (vibrant) {
        accentH = vibrant.h;
        accentHex = hslToHex(vibrant.h, clampNumber(vibrant.s, 60, 80, 65), clampNumber(vibrant.l, 42, 58, 50));
      }
    } else {
      const hsl = hexToHsl(seed.hex);
      if (!hsl) throw new Error('color');
      baseH = hsl.h;
      baseS = clampNumber(hsl.s, 15, 60, 30);
      if (hsl.s < 12) {
        accentHex = AUTOMATCH_FALLBACK_ACCENTS[0];
        const fallbackHsl = hexToHsl(accentHex);
        accentH = fallbackHsl ? fallbackHsl.h : 140;
      } else {
        accentH = (hsl.h + 180) % 360;
        accentHex = hslToHex(accentH, 70, 50);
      }
    }
    const palette = buildAutoMatchPalette(baseH, baseS, accentHex, accentH);
    if (!state.autoMatchSnapshot) state.autoMatchSnapshot = { ...state.settings.overrides };
    const next = normalizeSettings(state.settings);
    next.overrides = palette;
    persist(next);
    renderAll();
    syncAutoMatchUI();
    setAutoMatchStatus('Theme matched to wallpaper.', false);
    return true;
  } catch (err) {
    setAutoMatchStatus('Could not read wallpaper colors.', true);
    return false;
  } finally {
    state.autoMatchBusy = false;
  }
}

function revertAutoMatch() {
  if (!state.autoMatchSnapshot) return;
  const next = normalizeSettings(state.settings);
  next.overrides = { ...state.autoMatchSnapshot };
  state.autoMatchSnapshot = null;
  persist(next);
  renderAll();
  syncAutoMatchUI();
  setAutoMatchStatus('Reverted to previous colors.', false);
}

function scheduleAutoMatchAfterWallpaper(seed) {
  if (state.settings.autoMatchOnWallpaperChange !== true) return;
  clearTimeout(state.timers.get('autoMatch'));
  state.timers.set(
    'autoMatch',
    setTimeout(() => {
      runAutoMatch(seed || null);
    }, 500),
  );
}

function schedulePersist(key, value) {
  clearTimeout(state.timers.get(key));
  state.timers.set(
    key,
    setTimeout(() => {
      const next = normalizeSettings(state.settings);
      next[key] = value;
      persist(next);
    }, 150),
  );
}

function hexToRgb(hex) {
  if (typeof hex !== 'string') return '';
  let h = hex.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(h)) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return '';
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function toHexColor(value, fallback) {
  if (typeof value === 'string') {
    const v = value.trim();
    if (HEX_RE.test(v)) {
      let h = v.slice(1);
      if (h.length === 3) h = h.split('').map((c) => c + c).join('');
      return `#${h.toLowerCase()}`;
    }
    const m = v.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
    if (m) {
      const r = Math.max(0, Math.min(255, Number(m[1])));
      const g = Math.max(0, Math.min(255, Number(m[2])));
      const b = Math.max(0, Math.min(255, Number(m[3])));
      return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
    }
  }
  if (HEX_RE.test(fallback || '')) return fallback.toLowerCase();
  return '#000000';
}

function presetById(id) {
  return PRESETS.find((preset) => preset.id === id) || PRESETS[0];
}

function effectiveValue(tokenId) {
  if (state.settings.overrides[tokenId] !== undefined) return state.settings.overrides[tokenId];
  const presetVars = presetById(state.settings.presetId).vars || {};
  if (presetVars[tokenId] !== undefined) return presetVars[tokenId];
  const meta = TOKENS[tokenId];
  return meta ? meta.default : '';
}

function syncLinkedRgb(hexTokenId, hexValue) {
  const rgbTokenId = HEX_TO_RGB[hexTokenId];
  if (!rgbTokenId) return;
  const rgb = hexToRgb(hexValue);
  if (!rgb) return;
  state.settings.overrides[rgbTokenId] = rgb;
}

function swatchColors(preset) {
  return [
    preset.vars['--WDS-accent'] || TOKENS['--WDS-accent'].default,
    preset.vars['--WDS-systems-bubble-surface-outgoing'] || TOKENS['--WDS-systems-bubble-surface-outgoing'].default,
    preset.vars['--WDS-background-wash-plain'] || TOKENS['--WDS-background-wash-plain'].default,
    preset.vars['--WDS-components-surface-nav-bar'] || TOKENS['--WDS-components-surface-nav-bar'].default,
  ];
}

function updatePreview() {
  if (!previewChat) return;
  const wallpaper = state.settings.wallpaper || { type: 'none' };
  const fallback = effectiveValue('--WDS-systems-chat-background-wallpaper');
  previewChat.style.backgroundImage = 'none';
  if (wallpaper.type === 'image' && typeof wallpaper.dataUrl === 'string' && wallpaper.dataUrl.startsWith('data:image/')) {
    const geom = wallpaperGeom(wallpaper);
    previewChat.style.backgroundColor = fallback || '#0b0f19';
    if (geom.brightness < 100) {
      const dim = ((100 - geom.brightness) / 100).toFixed(2);
      previewChat.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, ${dim}), rgba(0, 0, 0, ${dim})), url("${wallpaper.dataUrl}")`;
    } else {
      previewChat.style.backgroundImage = `url("${wallpaper.dataUrl}")`;
    }
    previewChat.style.backgroundPosition = `${geom.posX}% ${geom.posY}%`;
    previewChat.style.backgroundSize = geom.scale > 100 ? `${geom.scale}%` : 'cover';
    previewChat.style.backgroundRepeat = geom.repeat ? 'repeat' : 'no-repeat';
  } else if (wallpaper.type === 'color' && HEX_RE.test(wallpaper.color || '')) {
    previewChat.style.backgroundColor = wallpaper.color;
    previewChat.style.backgroundImage = 'none';
    previewChat.style.backgroundSize = '';
    previewChat.style.backgroundPosition = '';
  } else {
    previewChat.style.backgroundColor = fallback;
    previewChat.style.backgroundImage = 'none';
    previewChat.style.backgroundSize = '';
    previewChat.style.backgroundPosition = '';
    previewChat.style.backgroundRepeat = '';
  }
  const incoming = effectiveValue('--WDS-systems-bubble-surface-incoming');
  const outgoing = effectiveValue('--WDS-systems-bubble-surface-outgoing');
  const text = effectiveValue('--WDS-content-default');
  const subtext = effectiveValue('--WDS-content-deemphasized');
  const ticks = effectiveValue('--WDS-content-read');

  previewIncoming.style.backgroundColor = incoming;
  previewOutgoing.style.backgroundColor = outgoing;
  previewIncomingText.style.color = text;
  previewOutgoingText.style.color = text;
  previewIncomingTime.style.color = subtext;
  previewOutgoingTime.style.color = subtext;
  previewTicks.style.color = ticks;
}

function renderPresets() {
  presetGrid.textContent = '';
  for (const preset of PRESETS) {
    const active = state.settings.presetId === preset.id;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'preset-card';
    button.dataset.active = String(active);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? `${preset.name}, active` : `Apply preset ${preset.name}`);

    const top = document.createElement('span');
    top.className = 'preset-top';

    const swatch = document.createElement('span');
    swatch.className = 'preset-swatch';
    swatch.setAttribute('aria-hidden', 'true');
    for (const color of swatchColors(preset)) {
      const dot = document.createElement('i');
      dot.style.backgroundColor = color;
      swatch.appendChild(dot);
    }

    const flag = document.createElement('span');
    flag.className = 'preset-flag';
    flag.textContent = active ? 'Active' : 'Use';

    top.append(swatch, flag);

    const name = document.createElement('span');
    name.className = 'preset-name';
    name.textContent = preset.name;

    button.append(top, name);
    button.addEventListener('click', () => {
      const next = normalizeSettings(state.settings);
      next.overrides = {};
      state.autoMatchSnapshot = null;
      next.presetId = preset.id;
      persist(next);
      if (revertAutoMatchButton) revertAutoMatchButton.hidden = true;
      if (autoMatchStatus) autoMatchStatus.textContent = '';
      renderAll();
    });
    presetGrid.appendChild(button);
  }
}

function resetToken(tokenId) {
  const next = normalizeSettings(state.settings);
  delete next.overrides[tokenId];
  const linked = HEX_TO_RGB[tokenId];
  if (linked) delete next.overrides[linked];
  persist(next);
  renderAll();
}

function renderTokenField(tokenId) {
  const token = TOKENS[tokenId];
  const row = document.createElement('div');
  row.className = 'field-row';
  row.dataset.token = `${tokenId} ${token.label}`.toLowerCase();

  const label = document.createElement('label');
  label.className = 'field-label';
  label.htmlFor = `token-${tokenId}`;
  label.textContent = token.label;

  const currentHex = toHexColor(effectiveValue(tokenId), token.default);
  const input = document.createElement('input');
  input.id = `token-${tokenId}`;
  input.className = 'field-input color-input';
  input.type = 'color';
  input.value = HEX_RE.test(currentHex) ? currentHex : '#000000';
  input.setAttribute('aria-label', token.label);

  const pill = document.createElement('span');
  pill.className = 'hex-pill';
  pill.setAttribute('aria-hidden', 'true');
  pill.textContent = input.value.toLowerCase();

  const isOverridden = state.settings.overrides[tokenId] !== undefined;
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'reset-button';
  reset.setAttribute('aria-label', `Reset ${token.label}`);
  reset.textContent = '↺';
  reset.disabled = !isOverridden;

  input.addEventListener('input', () => {
    if (!HEX_RE.test(input.value)) return;
    const next = normalizeSettings(state.settings);
    next.overrides[tokenId] = input.value.toLowerCase();
    const rgb = hexToRgb(input.value);
    const linked = HEX_TO_RGB[tokenId];
    if (linked && rgb) next.overrides[linked] = rgb;
    state.settings = next;
    schedulePersist('overrides', next.overrides);
    pill.textContent = input.value.toLowerCase();
    reset.disabled = false;
    updatePreview();
  });

  reset.addEventListener('click', () => resetToken(tokenId));

  row.append(label, input, pill, reset);
  return row;
}

function renderTokens() {
  tokenGroups.textContent = '';
  const q = state.filter.trim().toLowerCase();
  let visibleCount = 0;
  for (const group of UI_GROUPS) {
    const visible = group.tokens.filter((id) => {
      const token = TOKENS[id];
      if (!token) return false;
      if (!q) return true;
      return `${id} ${token.label}`.toLowerCase().includes(q);
    });
    if (q && visible.length === 0) continue;
    const details = document.createElement('details');
    details.className = 'group';
    details.open = group.id === 'accent' || q.length > 0;
    const summary = document.createElement('summary');
    summary.className = 'group-head';
    const title = document.createElement('span');
    title.textContent = `${group.icon} ${group.title}`;
    const caret = document.createElement('span');
    caret.className = 'group-caret';
    caret.textContent = '▾';
    caret.setAttribute('aria-hidden', 'true');
    summary.append(title, caret);
    details.appendChild(summary);
    const fields = document.createElement('div');
    fields.className = 'fields';
    for (const tokenId of visible) {
      fields.appendChild(renderTokenField(tokenId));
      visibleCount += 1;
    }
    if (visible.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'help';
      empty.textContent = 'No colors in this section match.';
      fields.appendChild(empty);
    }
    details.appendChild(fields);
    tokenGroups.appendChild(details);
  }
  searchEmpty.hidden = visibleCount !== 0;
}

function updateStatus() {
  const active = presetById(state.settings.presetId);
  statusText.textContent =
    state.settings.presetId === 'default' ? 'Using WhatsApp default' : `Preset: ${active.name}`;
  statusDot.classList.toggle('on', state.settings.enabled);
  statusBadge.classList.toggle('on', state.settings.enabled);
  statusBadge.textContent = state.settings.enabled ? 'Active' : 'Off';
  enabledLabel.textContent = state.settings.enabled ? 'Active' : 'Off';
}

function renderAll() {
  enabledToggle.checked = state.settings.enabled;
  customCss.value = state.settings.customCss;
  const wallpaper = state.settings.wallpaper || { type: 'none' };
  const wall = wallpaper.type === 'color' && HEX_RE.test(wallpaper.color || '') ? wallpaper.color.toLowerCase() : '#0b0f19';
  wallpaperInput.value = wall;
  wallpaperHex.textContent = wallpaper.type === 'color' ? wall : 'theme default';
  renderWallpaper();
  renderPresets();
  renderTokens();
  updateStatus();
  updatePreview();
  syncAutoMatchUI();
}

function setTab(name) {
  if (!TABS.includes(name)) return;
  state.tab = name;
  for (const key of TABS) {
    const selected = key === name;
    tabButtons[key].setAttribute('aria-selected', String(selected));
    tabButtons[key].tabIndex = selected ? 0 : -1;
    tabPanels[key].hidden = !selected;
  }
}

async function load() {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  state.settings = normalizeSettings(result[SETTINGS_KEY]);
  state.autoMatchSnapshot = null;
  renderAll();
  setAutoMatchStatus('', false);
}

for (const key of TABS) {
  tabButtons[key].addEventListener('click', () => setTab(key));
  tabButtons[key].addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const idx = TABS.indexOf(key);
    const next = event.key === 'ArrowRight' ? TABS[(idx + 1) % TABS.length] : TABS[(idx - 1 + TABS.length) % TABS.length];
    setTab(next);
    tabButtons[next].focus();
  });
}

enabledToggle.addEventListener('change', () => {
  const next = normalizeSettings(state.settings);
  next.enabled = enabledToggle.checked;
  persist(next);
  renderAll();
});

customCss.addEventListener('input', () => {
  clearTimeout(state.timers.get('customCss'));
  const next = normalizeSettings(state.settings);
  next.customCss = customCss.value;
  state.settings = next;
  updatePreview();
  state.timers.set(
    'customCss',
    setTimeout(() => {
      persist(next);
      updateStatus();
    }, 150),
  );
});

tokenSearch.addEventListener('input', () => {
  state.filter = tokenSearch.value || '';
  renderTokens();
});

wallpaperInput.addEventListener('input', () => {
  if (!HEX_RE.test(wallpaperInput.value)) return;
  const color = wallpaperInput.value.toLowerCase();
  const next = normalizeSettings(state.settings);
  next.wallpaper = { type: 'color', color, dataUrl: '' };
  next.customWallpaper = color;
  state.settings = next;
  wallpaperHex.textContent = color;
  setWallpaperStatus('', false);
  schedulePersist('wallpaper', next.wallpaper);
  schedulePersist('customWallpaper', next.customWallpaper);
  updatePreview();
  scheduleAutoMatchAfterWallpaper({ kind: 'color', hex: color });
});

wallpaperClear.addEventListener('click', () => {
  saveWallpaper({ type: 'none', color: '', dataUrl: '' });
  setWallpaperStatus('Wallpaper cleared. Using theme default.', false);
});

wallpaperRemove.addEventListener('click', () => {
  saveWallpaper({ type: 'none', color: '', dataUrl: '' });
  setWallpaperStatus('Wallpaper cleared. Using theme default.', false);
});

if (autoMatchButton) {
  autoMatchButton.addEventListener('click', () => {
    runAutoMatch(null);
  });
}

if (revertAutoMatchButton) {
  revertAutoMatchButton.addEventListener('click', () => {
    revertAutoMatch();
  });
}

if (autoMatchToggle) {
  autoMatchToggle.addEventListener('change', () => {
    const next = normalizeSettings(state.settings);
    next.autoMatchOnWallpaperChange = autoMatchToggle.checked;
    persist(next);
    renderAll();
  });
}

wallpaperModeColor.addEventListener('click', () => setWallpaperMode('color'));
wallpaperModeFile.addEventListener('click', () => setWallpaperMode('file'));
wallpaperModeUrl.addEventListener('click', () => setWallpaperMode('url'));

wallpaperFile.addEventListener('change', () => {
  const file = wallpaperFile.files && wallpaperFile.files[0];
  if (!file) return;
  applyFileBlob(file);
});

wallpaperFetch.addEventListener('click', async () => {
  if (state.wallpaperBusy) return;
  const url = (wallpaperUrl.value || '').trim();
  if (!url) {
    setWallpaperStatus(WALLPAPER_FAILURE, true);
    return;
  }
  state.wallpaperBusy = true;
  setWallpaperStatus('Fetching image...', false);
  try {
    const result = await processImageUrl(url);
    saveWallpaper(
      { type: 'image', dataUrl: result.dataUrl, width: result.width, height: result.height, posX: 50, posY: 50, scale: 100, repeat: false },
      { kind: 'image', dataUrl: result.dataUrl },
    );
    setWallpaperStatus(`Wallpaper applied, ${result.width}x${result.height}px, about ${result.sizeKb}KB stored.`, false);
  } catch (err) {
    setWallpaperStatus(err && err.message ? err.message : WALLPAPER_FAILURE, true);
  } finally {
    state.wallpaperBusy = false;
  }
});

if (wallpaperPanPad) {
  wallpaperPanPad.addEventListener('pointerdown', handlePanStart);
  wallpaperPanPad.addEventListener('pointermove', handlePanMove);
  wallpaperPanPad.addEventListener('pointerup', handlePanEnd);
  wallpaperPanPad.addEventListener('pointercancel', handlePanEnd);
  wallpaperPanPad.addEventListener('pointerleave', (event) => {
    if (event && event.buttons) return;
    handlePanEnd();
  });
  wallpaperPanPad.addEventListener('touchstart', handlePanStart, { passive: false });
  wallpaperPanPad.addEventListener('touchmove', handlePanMove, { passive: false });
  wallpaperPanPad.addEventListener('touchend', handlePanEnd);
  wallpaperPanPad.addEventListener('touchcancel', handlePanEnd);
}

if (wallpaperPanHandle) {
  wallpaperPanHandle.addEventListener('keydown', (event) => {
    const wallpaper = state.settings.wallpaper;
    if (!wallpaper || wallpaper.type !== 'image') return;
    const base = wallpaperGeom(wallpaper);
    const step = event.shiftKey ? 10 : 1;
    let next = null;
    if (event.key === 'ArrowLeft') next = { posX: base.posX - step, posY: base.posY };
    else if (event.key === 'ArrowRight') next = { posX: base.posX + step, posY: base.posY };
    else if (event.key === 'ArrowUp') next = { posX: base.posX, posY: base.posY - step };
    else if (event.key === 'ArrowDown') next = { posX: base.posX, posY: base.posY + step };
    else if (event.key === 'Home') next = { posX: 0, posY: 0 };
    else if (event.key === 'End') next = { posX: 100, posY: 100 };
    if (!next) return;
    event.preventDefault();
    applyWallpaperGeom(next);
  });
}

if (wallpaperAlignGrid) {
  wallpaperAlignGrid.addEventListener('click', (event) => {
    const button = event.target && event.target.closest ? event.target.closest('button[data-x]') : null;
    if (!button) return;
    applyWallpaperGeom({ posX: Number(button.dataset.x), posY: Number(button.dataset.y) });
  });
}

if (wallpaperPosX) {
  wallpaperPosX.addEventListener('input', () => applyWallpaperGeom({ posX: Number(wallpaperPosX.value) }));
}

if (wallpaperPosY) {
  wallpaperPosY.addEventListener('input', () => applyWallpaperGeom({ posY: Number(wallpaperPosY.value) }));
}

if (wallpaperScale) {
  wallpaperScale.addEventListener('input', () => applyWallpaperGeom({ scale: Number(wallpaperScale.value) }));
}

if (wallpaperBrightness) {
  wallpaperBrightness.addEventListener('input', () => applyWallpaperGeom({ brightness: Number(wallpaperBrightness.value) }));
}

if (wallpaperRepeat) {
  wallpaperRepeat.addEventListener('change', () => applyWallpaperGeom({ repeat: wallpaperRepeat.checked }));
}

if (wallpaperResetPos) {
  wallpaperResetPos.addEventListener('click', () => applyWallpaperGeom({ posX: 50, posY: 50, scale: 100, repeat: false, brightness: 100 }));
}

resetAllButton.addEventListener('click', () => {
  persist({ enabled: false, presetId: 'default', overrides: {}, customCss: '', customWallpaper: '', wallpaper: { type: 'none', color: '', dataUrl: '' }, autoMatchOnWallpaperChange: false });
  state.autoMatchSnapshot = null;
  setWallpaperStatus('', false);
  setAutoMatchStatus('', false);
  renderAll();
});

load();
