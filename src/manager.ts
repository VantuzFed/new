import { APPS } from './apps';
import type { AppDef } from './apps';
import { makeDraggable } from './drag';

let zCounter = 10;
let focusedId: string | null = null;
const closedApps = new Set<string>();
const minimizedApps = new Set<string>();
const desktopWindowEls = new Map<string, HTMLElement>();

function buildTitleBar(app: AppDef, opts: { mobile: boolean }) {
  const bar = document.createElement('div');
  bar.className = 'title-bar';

  const text = document.createElement('div');
  text.className = 'title-bar-text';
  text.textContent = app.title;
  bar.appendChild(text);

  const controls = document.createElement('div');
  controls.className = 'title-bar-controls';

  if (opts.mobile) {
    const back = document.createElement('button');
    back.setAttribute('aria-label', 'Back');
    back.addEventListener('click', closeMobileApp);
    controls.appendChild(back);
  } else {
    const min = document.createElement('button');
    min.setAttribute('aria-label', 'Minimize');
    const max = document.createElement('button');
    max.setAttribute('aria-label', 'Maximize');
    const close = document.createElement('button');
    close.setAttribute('aria-label', 'Close');
    controls.append(min, max, close);
  }

  bar.appendChild(controls);
  return bar;
}

function wireContentActions(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-open-app]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-open-app')!;
      if (window.matchMedia('(max-width: 760px)').matches) {
        openMobileApp(id);
      } else {
        openDesktopWindow(id);
      }
    });
  });
}

/** Retrigger the 3D "pop in" animation, used whenever a window opens/restores. */
function playOpenAnimation(win: HTMLElement) {
  win.classList.remove('opening');
  // Force reflow so the animation can be re-applied.
  void win.offsetWidth;
  win.classList.add('opening');
}

/* ------------------------- DESKTOP ------------------------- */

function buildDesktopWindow(app: AppDef, desktop: HTMLElement) {
  if (!app.desktop || !app.content) return;
  const win = document.createElement('div');
  win.className = 'windows window opening';
  win.style.width = `${app.desktop.width}px`;
  win.style.top = `${app.desktop.top}px`;
  win.style.left = `${app.desktop.left}px`;
  win.style.zIndex = String(zCounter++);
  win.dataset.appId = app.id;

  const bar = buildTitleBar(app, { mobile: false });
  win.appendChild(bar);

  const body = document.createElement('div');
  body.className = 'window-body';
  body.innerHTML = app.content();
  win.appendChild(body);

  desktop.appendChild(win);
  desktopWindowEls.set(app.id, win);
  makeDraggable(win, bar, desktop);

  win.addEventListener('pointerdown', () => focusWindow(app.id));

  const [minBtn, maxBtn, closeBtn] = Array.from(
    bar.querySelectorAll<HTMLButtonElement>('.title-bar-controls button')
  );

  minBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    minimizeWindow(app.id);
  });

  let maximized = false;
  let savedRect = { top: win.style.top, left: win.style.left, width: win.style.width, height: win.style.height };
  maxBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!maximized) {
      savedRect = { top: win.style.top, left: win.style.left, width: win.style.width, height: win.style.height };
      const rect = desktop.getBoundingClientRect();
      win.style.top = '0px';
      win.style.left = '0px';
      win.style.width = `${rect.width}px`;
      win.style.height = `${rect.height}px`;
      maxBtn.setAttribute('aria-label', 'Restore');
    } else {
      Object.assign(win.style, savedRect);
      maxBtn.setAttribute('aria-label', 'Maximize');
    }
    maximized = !maximized;
    focusWindow(app.id);
  });

  closeBtn.addEventListener('click', (e) => {
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

/** Fully hides the window and keeps only a taskbar entry, like a real XP minimize. */
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
    const item = document.createElement('div');
    item.className = 'taskbar-item';
    if (minimizedApps.has(app.id)) item.classList.add('is-minimized');
    item.textContent = `${app.icon} ${app.title}`;
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

function renderClock() {
  const clock = document.querySelector<HTMLElement>('.taskbar-clock');
  if (!clock) return;
  const update = () => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  update();
  setInterval(update, 15000);
}

let startOpen = false;

function toggleStartMenu() {
  startOpen = !startOpen;
  let popup = document.querySelector<HTMLElement>('.start-popup');
  if (!startOpen) {
    popup?.remove();
    return;
  }
  popup = document.createElement('div');
  popup.className = 'start-popup';
  popup.innerHTML = `<div class="start-popup__head">VantuzFed OS</div><div class="start-popup__list"></div>`;
  const list = popup.querySelector('.start-popup__list')!;

  for (const app of APPS) {
    const item = document.createElement('button');
    item.className = 'start-popup__item';
    item.innerHTML = `<span class="ico">${app.icon}</span><span>${app.title}</span>`;
    item.addEventListener('click', () => {
      const mobile = window.matchMedia('(max-width: 760px)').matches;
      if (app.kind === 'link') {
        window.location.href = app.href!;
        return;
      }
      if (mobile) {
        openMobileApp(app.id);
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
        if (!popup?.contains(e.target as Node)) {
          startOpen = false;
          popup?.remove();
        }
      },
      { once: true }
    );
  }, 0);
}

/* ------------------------- MOBILE ------------------------- */

function renderMobileHome() {
  const grid = document.querySelector<HTMLElement>('.mobile-icon-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (const app of APPS) {
    const btn = document.createElement('button');
    btn.className = 'mobile-icon';
    btn.innerHTML = `<span class="ico">${app.icon}</span><span>${app.title}</span>`;
    btn.addEventListener('click', () => {
      if (app.kind === 'link') window.location.href = app.href!;
      else openMobileApp(app.id);
    });
    grid.appendChild(btn);
  }
}

function openMobileApp(id: string) {
  const app = APPS.find((a) => a.id === id);
  if (!app || app.kind !== 'window' || !app.content) return;

  let screen = document.querySelector<HTMLElement>('.mobile-app-screen');
  if (!screen) {
    screen = document.createElement('div');
    screen.className = 'mobile-app-screen';
    document.getElementById('app')!.appendChild(screen);
  }
  screen.innerHTML = '';
  const bar = buildTitleBar(app, { mobile: true });
  const content = document.createElement('div');
  content.className = 'app-content';
  content.innerHTML = app.content();
  screen.append(bar, content);
  screen.classList.add('active');

  wireContentActions(content);
  app.mount?.(content);
}

function closeMobileApp() {
  document.querySelector('.mobile-app-screen')?.classList.remove('active');
}

/* ------------------------- INIT ------------------------- */

export function initDesktopEnvironment() {
  const appRoot = document.getElementById('app')!;
  appRoot.innerHTML = `
    <div class="desktop" id="desktop"></div>
    <div class="mobile-home">
      <div class="mobile-topbar"><span>VantuzFed OS</span><span class="mobile-clock"></span></div>
      <div class="mobile-icon-grid"></div>
    </div>
    <div class="task-bar">
      <div id="start_menu" role="button" tabindex="0">Start</div>
      <div class="task-bar_space"></div>
      <div class="taskbar-clock"></div>
    </div>
  `;

  const desktop = document.getElementById('desktop')!;
  for (const app of APPS) {
    if (app.kind === 'window') buildDesktopWindow(app, desktop);
  }
  focusedId = APPS.find((a) => a.kind === 'window')?.id ?? null;

  renderTaskbar();
  renderClock();
  renderMobileHome();

  document.getElementById('start_menu')!.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleStartMenu();
  });
}
