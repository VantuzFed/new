export function playerHtml(): string {
  return `
    <div class="player">
      <div class="player__art"><span>\u266a</span></div>
      <div class="player__title" data-player-title>No track loaded</div>
      <input class="player__seek" type="range" min="0" max="100" value="0" data-player-seek />
      <div class="player__time">
        <span data-player-current>0:00</span>
        <span data-player-duration>0:00</span>
      </div>
      <div class="player__controls">
        <button type="button" class="player__btn" data-player-open title="Open file">\u{1F4C2}</button>
        <button type="button" class="player__btn player__btn--play" data-player-play title="Play/Pause">\u25B6</button>
        <button type="button" class="player__btn" data-player-stop title="Stop">\u23F9</button>
      </div>
      <div class="player__volume">
        <span>\u{1F50A}</span>
        <input type="range" min="0" max="100" value="80" data-player-volume />
      </div>
      <input type="file" accept="audio/*" data-player-file class="visually-hidden" />
    </div>
  `;
}

function formatTime(sec: number): string {
  if (!isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

export function mountPlayer(root: HTMLElement) {
  const audio = new Audio();
  const title = root.querySelector<HTMLElement>('[data-player-title]')!;
  const seek = root.querySelector<HTMLInputElement>('[data-player-seek]')!;
  const current = root.querySelector<HTMLElement>('[data-player-current]')!;
  const duration = root.querySelector<HTMLElement>('[data-player-duration]')!;
  const playBtn = root.querySelector<HTMLButtonElement>('[data-player-play]')!;
  const stopBtn = root.querySelector<HTMLButtonElement>('[data-player-stop]')!;
  const openBtn = root.querySelector<HTMLButtonElement>('[data-player-open]')!;
  const fileInput = root.querySelector<HTMLInputElement>('[data-player-file]')!;
  const volume = root.querySelector<HTMLInputElement>('[data-player-volume]')!;
  const art = root.querySelector<HTMLElement>('.player__art')!;

  audio.volume = 0.8;

  openBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    audio.src = URL.createObjectURL(file);
    title.textContent = file.name.replace(/\.[a-z0-9]+$/i, '');
    audio.play();
  });

  playBtn.addEventListener('click', () => {
    if (!audio.src) {
      fileInput.click();
      return;
    }
    if (audio.paused) audio.play();
    else audio.pause();
  });

  stopBtn.addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;
  });

  audio.addEventListener('play', () => {
    playBtn.textContent = '\u23F8';
    art.classList.add('player__art--spinning');
  });
  audio.addEventListener('pause', () => {
    playBtn.textContent = '\u25B6';
    art.classList.remove('player__art--spinning');
  });
  audio.addEventListener('loadedmetadata', () => {
    duration.textContent = formatTime(audio.duration);
  });
  audio.addEventListener('timeupdate', () => {
    current.textContent = formatTime(audio.currentTime);
    if (audio.duration) seek.value = String((audio.currentTime / audio.duration) * 100);
  });

  seek.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = (Number(seek.value) / 100) * audio.duration;
  });

  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value) / 100;
  });
}
