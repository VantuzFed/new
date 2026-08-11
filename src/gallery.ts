import 'xp.css/dist/XP.css';
import './styles/base.css';
import './styles/page.css';

interface Photo {
  src: string;
  title: string;
}

const PHOTOS: Photo[] = [
  { src: '/img/lenin.jpg', title: 'Lenin and Coca-Cola artwork' },
  { src: '/img/dostoinstvo.jpg', title: "Russian's Empire Tinder" },
  { src: '/img/vova.png', title: 'Legendary picture of vova' },
  { src: '/img/kronk.png', title: 'The best man in the world' },
  { src: '/img/wave.jpg', title: 'My PC' },
  { src: '/img/nyan.jpg', title: 'Nyan' },
  { src: '/img/putin.jpg', title: 'Putin' },
  { src: '/img/asd.jpg', title: 'asd' },
];

document.getElementById('app')!.innerHTML = `
  <div class="page-shell">
    <div class="windows window page-window">
      <div class="title-bar">
        <div class="title-bar-text">File Viewer — Wall of Fame</div>
        <div class="title-bar-controls">
          <button aria-label="Back" onclick="history.back()"></button>
        </div>
      </div>
      <div class="window-body">
        <div class="gallery-grid" id="gallery"></div>
      </div>
    </div>
  </div>
  <div class="lightbox" id="lightbox" hidden>
    <img id="lightbox-img" alt="" />
  </div>
`;

const grid = document.getElementById('gallery')!;
const lightbox = document.getElementById('lightbox')!;
const lightboxImg = document.getElementById('lightbox-img') as HTMLImageElement;

for (const photo of PHOTOS) {
  const fig = document.createElement('figure');
  fig.className = 'gallery-item';
  fig.innerHTML = `<img src="${photo.src}" alt="${photo.title}" loading="lazy" />`;
  fig.addEventListener('click', () => {
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.title;
    lightbox.hidden = false;
  });
  grid.appendChild(fig);
}

lightbox.addEventListener('click', () => (lightbox.hidden = true));
