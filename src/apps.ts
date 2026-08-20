import { galleryGridHtml, mountGallery } from './features/gallery';
import { blockCubeHtml, mountBlockCube } from './features/blockcube';
import { calculatorHtml, mountCalculator } from './features/calculator';
import { blogMockupHtml } from './features/blog';
import { playerHtml, mountPlayer } from './features/player';
import { textEditorHtml, mountTextEditor } from './features/texteditor';

export type AppKind = 'window' | 'link' | 'action';

export interface AppDef {
  id: string;
  title: string;
  icon: string; // path to an icon image
  kind: AppKind;
  href?: string; // for kind === 'link'
  dockBottom?: boolean; // pins the window to the bottom of the screen (still horizontally centered)
  desktop?: { width: number; height?: number };
  noMaximize?: boolean; // hides the Maximize control for small utility windows
  centered?: boolean;
  tileColor?: string; // background color for the mobile (WP/CE-style) tile
  tileWide?: boolean; // renders as a double-width tile on the mobile home screen
  /** Mobile app screens normally sit inside the padded CE content area — set
   * this for apps (terminal, changelog, cube) that need to fill it
   * edge-to-edge. */
  mobileFullBleed?: boolean;
  /** Desktop windows are open by default unless this is set — then they
   * start closed and are only reachable from the Start menu. */
  startClosed?: boolean;
  content?: () => string;
  /** Falls back to `content()` when omitted. */
  mobileContent?: () => string;
  mount?: (root: HTMLElement) => void | Promise<void>;
}

const CMD_ASCII = `Microsoft\u00ae Windows DOS
\u00a9 Copyright Microsoft Corp 1990-2001.

C:\\WINDOWS\\SYSTEM32&gt;
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
'##::::'##::::'###::::'##::: ##:'########:'##::::'##:'########:'########:'########:'########::
 ##:::: ##:::'## ##::: ###:: ##:... ##..:: ##:::: ##:..... ##:: ##.....:: ##.....:: ##.... ##:
 ##:::: ##::'##:. ##:: ####: ##:::: ##:::: ##:::: ##::::: ##::: ##::::::: ##::::::: ##:::: ##:
 ##:::: ##:'##:::. ##: ## ## ##:::: ##:::: ##:::: ##:::: ##:::: ######::: ######::: ##:::: ##:
. ##:: ##:: #########: ##. ####:::: ##:::: ##:::: ##::: ##::::: ##...:::: ##...:::: ##:::: ##:
:. ## ##::: ##.... ##: ##:. ###:::: ##:::: ##:::: ##:: ##:::::: ##::::::: ##::::::: ##:::: ##:
 ::. ###:::: ##:::: ##: ##::. ##:::: ##::::. #######:: ########: ##::::::: ########: ########::
:::...:::::..:::::..::..::::..:::::..::::::.......:::........::..::::::::........::........:::`;

const LINKS: { label: string; href: string; icon: string; w: number; h: number }[] = [
  { label: 'My Telegram', href: 'https://t.me/vantuzfed', icon: '/img/tel.png', w: 13, h: 13 },
  { label: 'My YouTube', href: 'https://www.youtube.com/@vantuzfed', icon: '/img/you.png', w: 18, h: 13 },
  { label: 'My Steam Rus', href: 'https://steamcommunity.com/id/vantuzfed', icon: '/img/steam.png', w: 13, h: 13 },
  { label: 'My Steam TL', href: 'https://steamcommunity.com/id/vantuztur', icon: '/img/steam.png', w: 13, h: 13 },
  { label: 'My Twitter', href: 'https://twitter.com/vantuzfed', icon: '/img/twit.png', w: 16, h: 13 },
  { label: 'My Github', href: 'https://github.com/VantuzFed', icon: '/img/git.png', w: 14, h: 13 },
  { label: 'My Reddit', href: 'https://www.reddit.com/user/VantuzFed', icon: '/img/reddit.png', w: 14, h: 13 },
  { label: 'My SoundCloud', href: 'https://soundcloud.com/vantuzfed', icon: '/img/sound.png', w: 14, h: 13 },
];

export const APPS: AppDef[] = [
  {
    id: 'cmd',
    title: 'Command Prompt',
    icon: '/img/folder.png',
    kind: 'window',
    desktop: { width: 870 },
    tileColor: '#1BA1E2',
    tileWide: true,
    mobileFullBleed: true,
    content: () => `<pre class="cmd-pre-desktop">${CMD_ASCII}</pre>`,
    mobileContent: () => `<pre class="cmd-pre-mobile">${CMD_ASCII}</pre>`,
  },
  {
    id: 'links',
    title: 'Links',
    icon: '/img/folder.png',
    kind: 'window',
    desktop: { width: 230 },
    tileColor: '#FA6800',
    noMaximize: true,
    content: () =>
      `<div class="link-list">${LINKS.map(
        (l) =>
          `<button type="button" data-nav="${l.href}"><img src="${l.icon}" width="${l.w}" height="${l.h}" alt="" /> ${l.label}</button>`
      ).join('')}</div>`,
  },
  {
    id: 'utils',
    title: 'Utils',
    icon: '/img/folder.png',
    kind: 'window',
    desktop: { width: 230 },
    noMaximize: true,
    content: () => `
      <div class="link-list">
        <button type="button" data-open-app="gallery"><img src="/img/pic.png" width="14" height="13" alt="" /> Gallery</button>
        <button type="button" data-open-app="cube"><img src="/img/grass_block_top.png" width="14" height="13" alt="" /> Block Cube</button>
        <button type="button" data-open-app="changelog"><img src="/img/folder.png" width="14" height="13" alt="" /> Changelog</button>
        <button type="button" data-open-app="calculator"><img src="/img/folder.png" width="14" height="13" alt="" /> Calculator</button>
        <button type="button" data-open-app="player"><img src="/img/winamp.png" width="14" height="13" alt="" /> Player</button>
        <button type="button" data-open-app="texteditor"><img src="/img/folder.png" width="14" height="13" alt="" /> Text Editor</button>
        <button type="button" data-open-app="blog"><img src="/img/folder.png" width="14" height="13" alt="" /> Blog</button>
      </div>
    `,
  },
  {
    id: 'minecraft',
    title: 'Minecraft Server',
    icon: '/img/grass_block_top.png',
    kind: 'window',
    desktop: { width: 400 },
    centered: true,
    tileColor: '#60A917',
    tileWide: true,
    noMaximize: true,
    content: () => `
      <h4>
        <img data-mc-icon style="display:none; image-rendering:pixelated;" alt="server icon" />
        <p data-mc-ip></p>
        <p data-mc-version></p>
        <p data-mc-loading><progress></progress></p>
        <p data-mc-players></p>
        <p data-mc-status></p>
      </h4>
      <p><input data-mc-input type="text" value="hypixel.net" /></p>
      <p>
        <button data-mc-refresh type="button">Refresh</button>
        <button data-mc-reset type="button">Reset</button>
      </p>
    `,
    mobileContent: () => `
      <div class="mc-card">
        <div class="mc-card__icon"><img data-mc-icon style="display:none;" alt="server icon" /></div>
        <div class="mc-card__ip" data-mc-ip>hypixel.net</div>
        <div class="mc-card__stats">
          <div class="mc-stat"><span class="mc-stat__label">Version</span><span class="mc-stat__value" data-mc-version>&mdash;</span></div>
          <div class="mc-stat"><span class="mc-stat__label">Players</span><span class="mc-stat__value" data-mc-players>&mdash;</span></div>
          <div class="mc-stat mc-stat--status"><span class="mc-stat__label">Status</span><span class="mc-stat__value" data-mc-status>&mdash;</span></div>
        </div>
        <p data-mc-loading class="mc-card__loading"><progress></progress></p>
      </div>
      <div class="mc-mobile-controls">
        <input data-mc-input type="text" value="hypixel.net" />
        <div class="mc-mobile-buttons">
          <button data-mc-refresh type="button">Refresh</button>
          <button data-mc-reset type="button">Reset</button>
        </div>
      </div>
    `,
    mount: async (root) => {
      const { mountMinecraft } = await import('./features/minecraft');
      mountMinecraft(root);
    },
  },
  {
    id: 'changelog',
    title: 'Changelog',
    icon: '/img/folder.png',
    kind: 'window',
    desktop: { width: 500, height: 460 },
    tileColor: '#A200FF',
    mobileFullBleed: true,
    startClosed: true,
    content: () => `<pre data-changelog-text class="changelog-desktop"></pre>`,
    mobileContent: () => `<pre data-changelog-text class="changelog-mobile"></pre>`,
    mount: async (root) => {
      const { mountChangelog } = await import('./features/changelog');
      mountChangelog(root);
    },
  },
  {
    id: 'gallery',
    title: 'Gallery',
    icon: '/img/pic.png',
    kind: 'window',
    desktop: { width: 420, height: 340 },
    dockBottom: true,
    tileColor: '#2FB6C4',
    content: () => galleryGridHtml('desktop'),
    mobileContent: () => galleryGridHtml('mobile'),
    mount: (root) => mountGallery(root),
  },
  {
    id: 'cube',
    title: 'Block Cube',
    icon: '/img/grass_block_top.png',
    kind: 'window',
    desktop: { width: 360, height: 420 },
    tileColor: '#825A2C',
    mobileFullBleed: true,
    startClosed: true,
    content: () => blockCubeHtml(),
    mobileContent: () => blockCubeHtml(),
    mount: (root) => mountBlockCube(root),
  },
  {
    id: 'calculator',
    title: 'Calculator',
    icon: '/img/folder.png',
    kind: 'window',
    desktop: { width: 340, height: 480 },
    noMaximize: true,
    tileColor: '#4a4a52',
    startClosed: true,
    mobileFullBleed: true,
    content: () => calculatorHtml(),
    mobileContent: () => calculatorHtml(),
    mount: (root) => mountCalculator(root),
  },
  {
    id: 'blog',
    title: 'Blog',
    icon: '/img/folder.png',
    kind: 'window',
    desktop: { width: 620, height: 480 },
    tileColor: '#FFB400',
    mobileFullBleed: true,
    startClosed: true,
    content: () => blogMockupHtml(),
    mobileContent: () => blogMockupHtml(),
  },
  {
    id: 'player',
    title: 'Player',
    icon: '/img/winamp.png',
    kind: 'window',
    desktop: { width: 320, height: 300 },
    noMaximize: true,
    tileColor: '#E51400',
    startClosed: true,
    content: () => playerHtml(),
    mobileContent: () => playerHtml(),
    mount: (root) => mountPlayer(root),
  },
  {
    id: 'texteditor',
    title: 'Text Editor',
    icon: '/img/folder.png',
    kind: 'window',
    desktop: { width: 520, height: 420 },
    tileColor: '#3a6ea5',
    mobileFullBleed: true,
    startClosed: true,
    content: () => textEditorHtml(),
    mobileContent: () => textEditorHtml(),
    mount: (root) => mountTextEditor(root),
  },
];

export function getApp(id: string): AppDef | undefined {
  return APPS.find((a) => a.id === id);
}
