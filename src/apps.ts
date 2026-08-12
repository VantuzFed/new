import { galleryGridHtml, mountGallery } from './features/gallery';

export type AppKind = 'window' | 'link' | 'action';

export interface AppDef {
  id: string;
  title: string;
  icon: string; // path to an icon image
  kind: AppKind;
  href?: string; // for kind === 'link'
  desktop?: { width: number; top: number; left: number };
  centered?: boolean;
  tileColor?: string; // background color for the mobile (WP/CE-style) tile
  tileWide?: boolean; // renders as a double-width tile on the mobile home screen
  /** Mobile app screens normally sit inside the padded CE content area — set
   * this for apps (terminal, changelog) that need to fill it edge-to-edge. */
  mobileFullBleed?: boolean;
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

/** The Minecraft-server status rows: shared markup shape (same data-mc-*
 * hooks) for both desktop and mobile — only the layout around them differs. */
function mcRow(icon: string, attr: string) {
  return `<div><img src="${icon}" width="14" height="13" alt="" /><span ${attr}></span></div>`;
}

export const APPS: AppDef[] = [
  {
    id: 'cmd',
    title: 'Command Prompt',
    icon: '/img/folder.png',
    kind: 'window',
    desktop: { width: 870, top: 5, left: 40 },
    tileColor: '#1BA1E2',
    tileWide: true,
    mobileFullBleed: true,
    content: () => `<pre>${CMD_ASCII}</pre>`,
    mobileContent: () => `<pre class="cmd-pre-mobile">${CMD_ASCII}</pre>`,
  },
  {
    id: 'links',
    title: 'Links',
    icon: '/img/folder.png',
    kind: 'window',
    desktop: { width: 230, top: 340, left: 40 },
    tileColor: '#FA6800',
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
    desktop: { width: 230, top: 340, left: 300 },
    content: () => `
      <div class="link-list">
        <button type="button" data-open-app="gallery"><img src="/img/pic.png" width="14" height="13" alt="" /> Gallery</button>
        <button type="button" data-nav="/cube.html"><img src="/img/grass_block_top.png" width="14" height="13" alt="" /> Block Cube</button>
        <button type="button" data-nav="/threed.html"><img src="/img/folder.png" width="14" height="13" alt="" /> 3D Demo</button>
        <button type="button" data-open-app="changelog"><img src="/img/folder.png" width="14" height="13" alt="" /> Changelog</button>
        <button type="button" data-winamp-trigger><img src="/img/winamp.png" width="14" height="13" alt="" /> Winamp</button>
      </div>
    `,
  },
  {
    id: 'minecraft',
    title: 'Minecraft Server',
    icon: '/img/grass_block_top.png',
    kind: 'window',
    desktop: { width: 400, top: 340, left: 560 },
    centered: true,
    tileColor: '#60A917',
    tileWide: true,
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
      <div class="mc-mobile-hero">
        <img data-mc-icon style="display:none;" alt="server icon" />
      </div>
      <p data-mc-loading style="text-align:center;"><progress></progress></p>
      <div class="link-list">
        ${mcRow('/img/folder.png', 'data-mc-ip')}
        ${mcRow('/img/folder.png', 'data-mc-version')}
        ${mcRow('/img/folder.png', 'data-mc-players')}
        ${mcRow('/img/folder.png', 'data-mc-status')}
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
    desktop: { width: 500, top: 120, left: 900 },
    tileColor: '#A200FF',
    mobileFullBleed: true,
    content: () =>
      `<pre data-changelog-text style="height:380px; width:100%; min-height:200px; overflow:scroll; color:#000; background:#fff; resize:both; user-select:text;"></pre>`,
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
    desktop: { width: 560, top: 60, left: 560 },
    tileColor: '#2FB6C4',
    content: () => galleryGridHtml('desktop'),
    mobileContent: () => galleryGridHtml('mobile'),
    mount: (root) => mountGallery(root),
  },
  {
    id: 'cube',
    title: 'Block Cube',
    icon: '/img/grass_block_top.png',
    kind: 'link',
    href: '/cube.html',
    tileColor: '#825A2C',
  },
  {
    id: 'threed',
    title: '3D Demo',
    icon: '/img/folder.png',
    kind: 'link',
    href: '/threed.html',
    tileColor: '#00ABA9',
  },
  {
    id: 'winamp',
    title: 'Winamp',
    icon: '/img/winamp.png',
    kind: 'action',
    tileColor: '#E51400',
  },
];

export function getApp(id: string): AppDef | undefined {
  return APPS.find((a) => a.id === id);
}
