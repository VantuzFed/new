let mounted = false;

export async function mountWinamp(root: HTMLElement) {
  const holder = root.querySelector<HTMLElement>('[data-winamp-holder]');
  if (!holder) return;

  if (mounted) return;
  mounted = true;

  holder.innerHTML = '<p style="text-align:center;">Загрузка плеера…</p>';

  try {
    const { default: Webamp } = await import('webamp');
    if (!Webamp.browserIsSupported()) {
      holder.innerHTML = '<p>Ваш браузер не поддерживает Winamp-плеер.</p>';
      return;
    }
    holder.innerHTML = '';
    const webamp = new Webamp({});
    await webamp.renderWhenReady(holder);
  } catch {
    holder.innerHTML = '<p>Не удалось загрузить плеер.</p>';
    mounted = false;
  }
}
