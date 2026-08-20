type Face = 'front' | 'back' | 'right' | 'left' | 'top' | 'bottom';

const GRASS: Record<Face, string> = {
  front: '/img/grass_block_side.png',
  back: '/img/grass_block_side.png',
  right: '/img/grass_block_side.png',
  left: '/img/grass_block_side.png',
  top: '/img/grass_block_top.png',
  bottom: '/img/dirt.png',
};

export function blockCubeHtml(): string {
  return `
    <div class="cube-embed">
      <div class="cube-embed__scene">
        <div class="cube-embed__cube">
          <img data-face="front" class="cube-embed__f cube-embed__f-front" />
          <img data-face="back" class="cube-embed__f cube-embed__f-back" />
          <img data-face="right" class="cube-embed__f cube-embed__f-right" />
          <img data-face="left" class="cube-embed__f cube-embed__f-left" />
          <img data-face="top" class="cube-embed__f cube-embed__f-top" />
          <img data-face="bottom" class="cube-embed__f cube-embed__f-bottom" />
        </div>
      </div>
      <div class="cube-embed__controls">
        <button type="button" data-cube-meme>ZHIRINOVSKIY</button>
        <button type="button" data-cube-mine>MINECRAFT</button>
      </div>
    </div>
  `;
}

export function mountBlockCube(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll<HTMLImageElement>('.cube-embed__f'));

  function applyFaces(map: Record<Face, string>) {
    for (const img of imgs) {
      const face = img.dataset.face as Face;
      img.src = map[face];
    }
  }

  applyFaces(GRASS);

  root.querySelector('[data-cube-meme]')?.addEventListener('click', () => {
    for (const img of imgs) img.src = '/img/dfsf.jpg';
  });
  root.querySelector('[data-cube-mine]')?.addEventListener('click', () => applyFaces(GRASS));
}
