import './styles/base.css';
import './styles/cube.css';

type Face = 'front' | 'back' | 'right' | 'left' | 'top' | 'bottom';

const GRASS: Record<Face, string> = {
  front: '/img/grass_block_side.png',
  back: '/img/grass_block_side.png',
  right: '/img/grass_block_side.png',
  left: '/img/grass_block_side.png',
  top: '/img/grass_block_top.png',
  bottom: '/img/dirt.png',
};

document.getElementById('app')!.innerHTML = `
  <div class="cube-page">
    <a class="back-btn" href="/index.html" aria-label="Back">\u2190 Back</a>
    <div class="scene">
      <div class="cube">
        <img data-face="front" class="cube_f cube_f-front" />
        <img data-face="back" class="cube_f cube_f-back" />
        <img data-face="right" class="cube_f cube_f-right" />
        <img data-face="left" class="cube_f cube_f-left" />
        <img data-face="top" class="cube_f cube_f-top" />
        <img data-face="bottom" class="cube_f cube_f-bottom" />
      </div>
    </div>
    <div class="cube-controls">
      <button class="butt" id="btn-meme">ZHIRINOVSKIY</button>
      <button class="butt" id="btn-mine">MINECRAFT</button>
    </div>
  </div>
`;

const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('.cube_f'));

function applyFaces(map: Record<Face, string>) {
  for (const img of imgs) {
    const face = img.dataset.face as Face;
    img.src = map[face];
  }
}

applyFaces(GRASS);

document.getElementById('btn-meme')!.addEventListener('click', () => {
  for (const img of imgs) img.src = '/img/dfsf.jpg';
});

document.getElementById('btn-mine')!.addEventListener('click', () => applyFaces(GRASS));
