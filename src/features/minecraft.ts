const DEFAULT_IP = 'hypixel.net';

interface McStatus {
  online?: boolean;
  hostname?: string;
  version?: string;
  icon?: string;
  players?: { online: number; max: number };
}

export function mountMinecraft(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>('[data-mc-input]')!;
  const refreshBtn = root.querySelector<HTMLButtonElement>('[data-mc-refresh]')!;
  const resetBtn = root.querySelector<HTMLButtonElement>('[data-mc-reset]')!;
  const icon = root.querySelector<HTMLImageElement>('[data-mc-icon]')!;
  const ip = root.querySelector<HTMLElement>('[data-mc-ip]')!;
  const version = root.querySelector<HTMLElement>('[data-mc-version]')!;
  const players = root.querySelector<HTMLElement>('[data-mc-players]')!;
  const status = root.querySelector<HTMLElement>('[data-mc-status]')!;
  const loading = root.querySelector<HTMLElement>('[data-mc-loading]')!;

  async function fetchStatus() {
    const address = input.value.trim() || DEFAULT_IP;
    resetBtn.disabled = address === DEFAULT_IP;
    loading.style.display = '';
    [icon, version, players, ip, status].forEach((el) => (el.style.display = 'none'));

    try {
      const res = await fetch(`https://api.mcsrvstat.us/2/${encodeURIComponent(address)}`);
      const data: McStatus = await res.json();

      ip.textContent = `IP: ${data.hostname ?? address}`;
      ip.style.display = '';

      if (data.icon) {
        icon.src = data.icon;
        icon.style.display = '';
      }

      if (data.version) {
        version.textContent = `Version: ${data.version}`;
        version.style.display = '';
      }

      if (data.players) {
        players.textContent = `Players: ${data.players.online}/${data.players.max}`;
        players.style.display = '';
      }

      status.textContent = data.online ? 'Status: Online \u{1F7E2}' : 'Status: Offline \u{1F534}';
      status.style.display = '';
    } catch {
      status.textContent = 'Status: request failed';
      status.style.display = '';
    } finally {
      loading.style.display = 'none';
    }
  }

  refreshBtn.addEventListener('click', fetchStatus);
  resetBtn.addEventListener('click', () => {
    input.value = DEFAULT_IP;
    fetchStatus();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchStatus();
  });

  fetchStatus();
}
