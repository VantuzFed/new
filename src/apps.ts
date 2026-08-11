export type AppKind = 'window' | 'link';

export interface AppDef {
  id: string;
  title: string;
  icon: string; // emoji used as icon glyph
  kind: AppKind;
  href?: string; // for kind === 'link'
  external?: boolean;
  desktop?: { width: number; top: number; left: number; column: 'one' | 'two' | 'three' };
  content?: () => string;
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

const LINKS: { label: string; href: string; icon: string }[] = [
  { label: 'My Telegram', href: 'https://t.me/vantuzfed', icon: '\u2708\uFE0F' },
  { label: 'My YouTube', href: 'https://www.youtube.com/@vantuzfed', icon: '\u25B6\uFE0F' },
  { label: 'My Steam Rus', href: 'https://steamcommunity.com/id/vantuzfed', icon: '\u{1F3AE}' },
  { label: 'My Steam TL', href: 'https://steamcommunity.com/id/vantuztur', icon: '\u{1F3AE}' },
  { label: 'My Twitter', href: 'https://twitter.com/vantuzfed', icon: '\u{1F426}' },
  { label: 'My Github', href: 'https://github.com/VantuzFed', icon: '\u{1F419}' },
  { label: 'My Reddit', href: 'https://www.reddit.com/user/VantuzFed', icon: '\u{1F47D}' },
  { label: 'My SoundCloud', href: 'https://soundcloud.com/vantuzfed', icon: '\u{1F3B5}' },
];

export const APPS: AppDef[] = [
  {
    id: 'cmd',
    title: 'Command Prompt',
    icon: '\u{1F5A5}\uFE0F',
    kind: 'window',
    desktop: { width: 870, top: 5, left: 40, column: 'one' },
    content: () => `<pre class="crt">${CMD_ASCII}</pre>`,
  },
  {
    id: 'links',
    title: 'Links',
    icon: '\u{1F517}',
    kind: 'window',
    desktop: { width: 230, top: 340, left: 40, column: 'one' },
    content: () =>
      LINKS.map(
        (l) =>
          `<a class="btn-link" href="${l.href}" target="_blank" rel="noopener noreferrer"><span>${l.icon}</span>${l.label}</a>`
      ).join(''),
  },
  {
    id: 'utils',
    title: 'Utils',
    icon: '\u{1F9F0}',
    kind: 'window',
    desktop: { width: 230, top: 340, left: 300, column: 'two' },
    content: () => `
      <a class="btn-link" href="/gallery.html"><span>\u{1F5BC}\uFE0F</span> Gallery</a>
      <a class="btn-link" href="/cube.html"><span>\u{1F9CA}</span> Block Cube</a>
      <a class="btn-link" href="/threed.html"><span>\u{1F300}</span> 3D Demo</a>
      <button class="btn-link" type="button" data-open-app="changelog"><span>\u{1F4DC}</span> Changelog</button>
      <button class="btn-link" type="button" data-open-app="winamp"><span>\u{1F3B6}</span> Winamp</button>
    `,
  },
  {
    id: 'minecraft',
    title: 'Minecraft Server',
    icon: '\u{1F7E9}',
    kind: 'window',
    desktop: { width: 400, top: 340, left: 560, column: 'three' },
    content: () => `
      <div style="text-align:center;">
        <img data-mc-icon style="display:none; width:64px; height:64px; image-rendering:pixelated;" alt="server icon" />
        <p data-mc-ip></p>
        <p data-mc-version></p>
        <p data-mc-loading><progress></progress></p>
        <p data-mc-players></p>
        <p data-mc-status></p>
        <p><input data-mc-input type="text" value="hypixel.net" style="width:80%;" /></p>
        <p>
          <button class="btn-link" style="display:inline-block;width:auto;" data-mc-refresh type="button">Refresh</button>
          <button class="btn-link" style="display:inline-block;width:auto;" data-mc-reset type="button">Reset</button>
        </p>
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
    icon: '\u{1F4DC}',
    kind: 'window',
    desktop: { width: 500, top: 120, left: 900, column: 'three' },
    content: () =>
      `<pre data-changelog-text style="max-height:60vh; min-height:200px; overflow:auto; white-space:pre-wrap; background:#fff; color:#000; padding:10px; border:1px solid #999;"></pre>`,
    mount: async (root) => {
      const { mountChangelog } = await import('./features/changelog');
      mountChangelog(root);
    },
  },
  {
    id: 'winamp',
    title: 'Winamp',
    icon: '\u{1F3B6}',
    kind: 'window',
    desktop: { width: 280, top: 5, left: 950, column: 'three' },
    content: () => `<div data-winamp-holder style="min-height:120px;"></div>`,
    mount: async (root) => {
      const { mountWinamp } = await import('./features/winamp');
      mountWinamp(root);
    },
  },
  {
    id: 'gallery',
    title: 'Gallery',
    icon: '\u{1F5BC}\uFE0F',
    kind: 'link',
    href: '/gallery.html',
  },
  {
    id: 'cube',
    title: 'Block Cube',
    icon: '\u{1F9CA}',
    kind: 'link',
    href: '/cube.html',
  },
  {
    id: 'threed',
    title: '3D Demo',
    icon: '\u{1F300}',
    kind: 'link',
    href: '/threed.html',
  },
];

export function getApp(id: string): AppDef | undefined {
  return APPS.find((a) => a.id === id);
}
