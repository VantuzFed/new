import 'xp.css/dist/XP.css';
import './styles/base.css';
import './styles/windows.css';
import './styles/mobile.css';
import { initDesktopEnvironment } from './manager';

initDesktopEnvironment();

/** Keeps the inline Windows-XP-style boot screen up until every initial
 * asset (fonts, wallpaper, icons, xp.css, etc.) has actually finished
 * loading — on a warm cache this resolves almost instantly, on a cold
 * load it stays up for as long as it genuinely takes. */
function hideBootScreen() {
  const boot = document.getElementById('boot-screen');
  if (!boot) return;
  boot.classList.add('boot-done');
  setTimeout(() => boot.remove(), 550);
}

if (document.readyState === 'complete') {
  hideBootScreen();
} else {
  window.addEventListener('load', hideBootScreen);
}
