import { APPS } from './apps';
import type { AppDef } from './apps';
import { makeDraggable } from './drag';
import { toggleWinamp } from './features/winamp';

let zCounter = 10;
let focusedId: string | null = null;
const closedApps = new Set<string>();
const minimizedApps = new Set<string>();
const desktopWindowEls = new Map<string, HTMLElement>();

/* ------------------------- SHARED ------------------------- */

function buildTitleBar(app: AppDef) {
  const bar = document.createElement('div');
  bar.className = 'title-bar';

  const text = document.createElement('div');
  text.className = 'title-bar-text';
  text.textContent = app.title;
  bar.appendChild(text);

  const controls = document.createElement('div');
  controls.className = 'title-bar-controls';
  const min = document.createElement('button');
  min.setAttribute('aria-label', 'Minimize');
  let max: HTMLButtonElement | null = null;
  if (!app.noMaximize) {
    max = document.createElement('button');
    max.setAttribute('aria-label', 'Maximize');
  }
  const close = document.createElement('button');
  close.setAttribute('aria-label', 'Close');
  controls.append(min, ...(max ? [max] : []), close);

  bar.appendChild(controls);
  return { bar, min, max, close };
}

function wireContentActions(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-open-app]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-open-app')!;
      if (currentMode() === 'mobile') openMobileApp(id);
      else openDesktopWindow(id);
    });
  });
  root.querySelectorAll<HTMLElement>('[data-winamp-trigger]').forEach((btn) => {
    btn.addEventListener('click', () => toggleWinamp());
  });
  root.querySelectorAll<HTMLElement>('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const href = btn.getAttribute('data-nav')!;
      if (href.startsWith('http')) window.open(href, '_blank', 'noopener,noreferrer');
      else window.location.href = href;
    });
  });
}

function playOpenAnimation(win: HTMLElement) {
  win.classList.remove('opening');
  void win.offsetWidth;
  win.classList.add('opening');
}

/** Adds an oversized, faded duplicate of each list-row icon as a decorative
 * watermark, so mobile buttons don't look so flat/empty. Mobile-only. */
function enrichMobileButtons(root: HTMLElement) {
  root.querySelectorAll<HTMLImageElement>('.link-list img').forEach((img) => {
    const ghost = img.cloneNode(true) as HTMLImageElement;
    ghost.className = 'row-icon-ghost';
    ghost.removeAttribute('width');
    ghost.removeAttribute('height');
    ghost.setAttribute('aria-hidden', 'true');
    img.closest('button, a')?.appendChild(ghost);
  });
}

/* ------------------------- DESKTOP WINDOWS ------------------------- */

function buildDesktopWindow(app: AppDef, desktop: HTMLElement) {
  if (!app.desktop || !app.content) return;
  const win = document.createElement('div');
  win.className = 'windows window opening';
  win.style.width = `${app.desktop.width}px`;
  win.style.top = `${app.desktop.top}px`;
  win.style.left = `${app.desktop.left}px`;
  if (app.desktop.height) win.style.height = `${app.desktop.height}px`;
  win.style.zIndex = String(zCounter++);
  win.dataset.appId = app.id;

  const { bar, min, max, close } = buildTitleBar(app);
  win.appendChild(bar);

  const body = document.createElement('div');
  body.className = 'window-body';
  if (app.centered) body.style.textAlign = 'center';
  body.innerHTML = app.content();
  win.appendChild(body);

  desktop.appendChild(win);
  desktopWindowEls.set(app.id, win);
  makeDraggable(win, bar, desktop);

  win.addEventListener('pointerdown', () => focusWindow(app.id));

  min.addEventListener('click', (e) => {
    e.stopPropagation();
    minimizeWindow(app.id);
  });

  let maximized = false;
  let savedRect = { top: win.style.top, left: win.style.left, width: win.style.width, height: win.style.height };
  max?.addEventListener('click', (e) => {
    e.stopPropagation();
    win.classList.add('win-transition');
    if (!maximized) {
      savedRect = { top: win.style.top, left: win.style.left, width: win.style.width, height: win.style.height };
      const rect = desktop.getBoundingClientRect();
      win.style.top = '0px';
      win.style.left = '0px';
      win.style.width = `${rect.width}px`;
      win.style.height = `${rect.height}px`;
      win.classList.add('is-maximized');
      max.setAttribute('aria-label', 'Restore');
    } else {
      Object.assign(win.style, savedRect);
      win.classList.remove('is-maximized');
      max.setAttribute('aria-label', 'Maximize');
    }
    maximized = !maximized;
    focusWindow(app.id);
    window.setTimeout(() => win.classList.remove('win-transition'), 420);
  });

  close.addEventListener('click', (e) => {
    e.stopPropagation();
    win.classList.add('disabled');
    closedApps.add(app.id);
    minimizedApps.delete(app.id);
    renderTaskbar();
  });

  wireContentActions(body);
  app.mount?.(body);

  return win;
}

function focusWindow(id: string) {
  const win = desktopWindowEls.get(id);
  if (!win) return;
  win.style.zIndex = String(++zCounter);
  focusedId = id;
  renderTaskbar();
}

function minimizeWindow(id: string) {
  const win = desktopWindowEls.get(id);
  if (!win) return;
  win.classList.add('minimized');
  minimizedApps.add(id);
  if (focusedId === id) focusedId = null;
  renderTaskbar();
}

function restoreWindow(id: string) {
  const win = desktopWindowEls.get(id);
  if (!win) return;
  win.classList.remove('minimized');
  minimizedApps.delete(id);
  playOpenAnimation(win);
  focusWindow(id);
}

export function openDesktopWindow(id: string) {
  const win = desktopWindowEls.get(id);
  if (!win) return;
  const wasClosed = closedApps.has(id);
  win.classList.remove('disabled', 'minimized');
  closedApps.delete(id);
  minimizedApps.delete(id);
  if (wasClosed) playOpenAnimation(win);
  focusWindow(id);
}

/* ------------------------- TASKBAR + START MENU ------------------------- */

function renderTaskbar() {
  const space = document.querySelector<HTMLElement>('.task-bar_space');
  if (!space) return;
  space.innerHTML = '';
  for (const app of APPS) {
    if (app.kind !== 'window') continue;
    if (closedApps.has(app.id)) continue;
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'taskbar-item';
    if (focusedId === app.id && !minimizedApps.has(app.id)) item.classList.add('is-active');
    item.innerHTML = `<img src="${app.icon}" alt="" /><span>${app.title}</span>`;
    item.addEventListener('click', () => {
      if (minimizedApps.has(app.id)) {
        restoreWindow(app.id);
      } else if (focusedId === app.id) {
        minimizeWindow(app.id);
      } else {
        focusWindow(app.id);
      }
    });
    space.appendChild(item);
  }
}

let startOpen = false;

function toggleStartMenu(forceClose = false) {
  const existing = document.querySelector<HTMLElement>('.start-popup');
  if (forceClose || startOpen) {
    startOpen = false;
    existing?.remove();
    return;
  }
  startOpen = true;
  const popup = document.createElement('div');
  popup.className = 'start-popup window';
  popup.innerHTML = `<div class="title-bar"><div class="title-bar-text">VantuzFed OS</div></div><div class="window-body start-popup__list"></div>`;
  const list = popup.querySelector('.start-popup__list')!;

  for (const app of APPS) {
    const item = document.createElement('button');
    item.className = 'start-popup__item';
    item.innerHTML = `<img src="${app.icon}" alt="" /><span>${app.title}</span>`;
    item.addEventListener('click', () => {
      if (app.kind === 'action') {
        toggleWinamp();
      } else if (app.kind === 'link') {
        window.location.href = app.href!;
      } else if (minimizedApps.has(app.id)) {
        restoreWindow(app.id);
      } else if (closedApps.has(app.id)) {
        openDesktopWindow(app.id);
      } else {
        focusWindow(app.id);
      }
      toggleStartMenu();
    });
    list.appendChild(item);
  }

  document.body.appendChild(popup);

  setTimeout(() => {
    document.addEventListener(
      'pointerdown',
      (e) => {
        const target = e.target as Node;
        const startBtn = document.getElementById('start_menu');
        if (popup.contains(target) || startBtn?.contains(target)) return;
        toggleStartMenu(true);
      },
      { once: true }
    );
  }, 0);
}

/* ------------------------- MOBILE (Windows CE / Windows Phone style) ------------------------- */

function renderMobileTiles() {
  const grid = document.querySelector<HTMLElement>('.mobile-tiles');
  if (!grid) return;
  grid.innerHTML = '';
  for (const app of APPS) {
    if (app.id === 'utils' || app.id === 'winamp') continue; // "Utils" is a desktop-only folder window; Winamp has no touch-friendly mobile UI
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'tile' + (app.tileWide ? ' tile-wide' : '');
    if (app.tileColor) tile.style.setProperty('--tile-color', app.tileColor);
    tile.innerHTML = `
      <img class="tile-icon-ghost" src="${app.icon}" alt="" aria-hidden="true" />
      <img class="tile-icon" src="${app.icon}" alt="" />
      <span>${app.title}</span>
    `;
    tile.addEventListener('click', () => {
      if (app.kind === 'action') toggleWinamp();
      else if (app.kind === 'link') window.location.href = app.href!;
      else openMobileApp(app.id);
    });
    grid.appendChild(tile);
  }
}

function openMobileApp(id: string) {
  const app = APPS.find((a) => a.id === id);
  if (!app || app.kind !== 'window' || !app.content) return;

  const screen = document.querySelector<HTMLElement>('.mobile-app-screen')!;
  screen.innerHTML = `
    <div class="ce-title-bar"><img src="${app.icon}" alt="" /><span>${app.title}</span></div>
    <div class="ce-content"></div>
  `;
  const content = screen.querySelector<HTMLElement>('.ce-content')!;
  if (app.centered) content.style.textAlign = 'center';
  if (app.mobileFullBleed) content.classList.add('ce-content--full');
  content.innerHTML = (app.mobileContent ?? app.content)();
  screen.classList.add('active');
  document.querySelector('.mobile-home-screen')?.classList.add('is-hidden');

  wireContentActions(content);
  enrichMobileButtons(content);
  app.mount?.(content);
}

function closeMobileApp() {
  document.querySelector('.mobile-app-screen')?.classList.remove('active');
  document.querySelector('.mobile-home-screen')?.classList.remove('is-hidden');
}

let is24HourFormat = true;

function formatClockTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: !is24HourFormat });
}

function updateClocks() {
  const text = formatClockTime(new Date());
  document.querySelectorAll<HTMLElement>('.js-clock').forEach((el) => (el.textContent = text));
}

function toggleClockFormat() {
  is24HourFormat = !is24HourFormat;
  updateClocks();
}

function renderClocks() {
  updateClocks();
  setInterval(updateClocks, 15000);
  document.querySelectorAll<HTMLElement>('.js-clock').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleClockFormat();
    });
  });
}

/* ------------------------- MODE SWITCHING (desktop <-> mobile) ------------------------- */

type Mode = 'desktop' | 'mobile';

function isNarrowViewport() {
  return window.matchMedia('(max-width: 760px)').matches;
}

function currentMode(): Mode {
  return isNarrowViewport() ? 'mobile' : 'desktop';
}

function applyMode() {
  const mode = currentMode();
  const app = document.getElementById('app')!;
  app.classList.toggle('mode-mobile', mode === 'mobile');
  app.classList.toggle('mode-desktop', mode === 'desktop');
  if (mode === 'desktop') closeMobileApp();
}

/* ------------------------- INIT ------------------------- */

export function initDesktopEnvironment() {
  const appRoot = document.getElementById('app')!;
  appRoot.innerHTML = `
    <div class="desktop-shell">
      <div class="desktop" id="desktop"></div>
      <div class="task-bar">
        <button id="start_menu" type="button"></button>
        <div class="task-bar_space"></div>
        <div class="taskbar-notif">
          <img src="/img/taskbar_notif.png" alt="" />
          <button class="taskbar-clock js-clock" type="button" title="Toggle 12/24h"></button>
        </div>
      </div>
    </div>
    <div class="mobile-shell">
      <div class="mobile-bg"></div>
      <div class="mobile-status-bar">
        <div class="status-left">
          <span class="status-signal"><span></span><span></span><span></span><span></span></span>
          <span>VantuzFed Net</span>
        </div>
        <div class="status-right">
          <span class="status-clock js-clock"></span>
          <span class="status-battery"><i></i></span>
        </div>
      </div>
      <div class="mobile-home-screen">
        <div class="mobile-hero">VantuzFed<br />Mobile</div>
        <div class="mobile-tiles"></div>
      </div>
      <div class="mobile-app-screen"></div>
      <div class="mobile-softkeys">
        <button class="softkey" id="softkey-back" type="button">\u2190 Back</button>
        <div class="softkey-clock js-clock"></div>
        <button class="softkey" id="softkey-home" type="button"><img src="/img/mob.png" alt="" /> Home</button>
      </div>
    </div>
  `;

  const desktop = document.getElementById('desktop')!;
  for (const app of APPS) {
    if (app.kind === 'window') buildDesktopWindow(app, desktop);
  }
  focusedId = APPS.find((a) => a.kind === 'window')?.id ?? null;

  renderTaskbar();
  renderMobileTiles();
  renderClocks();
  applyMode();

  document.getElementById('start_menu')!.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleStartMenu();
  });

  document.getElementById('softkey-back')!.addEventListener('click', closeMobileApp);
  document.getElementById('softkey-home')!.addEventListener('click', closeMobileApp);

  window.addEventListener('resize', applyMode);
}
