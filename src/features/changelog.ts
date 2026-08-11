export async function mountChangelog(root: HTMLElement) {
  const pre = root.querySelector<HTMLElement>('[data-changelog-text]');
  if (!pre) return;
  try {
    const res = await fetch('/data/changelog.txt');
    pre.textContent = await res.text();
  } catch {
    pre.textContent = 'Не удалось загрузить changelog.';
  }
}
