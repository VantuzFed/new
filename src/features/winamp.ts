// Winamp is never wrapped in our own window chrome — clicking the button
// just creates (or brings back) the real Webamp instance, which draws its
// own skinned, draggable window straight onto the desktop.
let webampInstance: import('webamp').default | null = null;
let container: HTMLElement | null = null;

export async function toggleWinamp() {
  const { default: Webamp } = await import('webamp');

  if (webampInstance) {
    webampInstance.reopen();
    return;
  }

  if (!Webamp.browserIsSupported()) {
    // eslint-disable-next-line no-alert
    alert('Ваш браузер не поддерживает Winamp-плеер.');
    return;
  }

  container = document.createElement('div');
  container.id = 'webamp-root';
  document.body.appendChild(container);

  webampInstance = new Webamp({});
  await webampInstance.renderWhenReady(container);
}
