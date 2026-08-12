export interface Photo {
  src: string;
  title: string;
}

export const PHOTOS: Photo[] = [
  { src: '/img/lenin.jpg', title: 'Lenin and Coca-Cola artwork' },
  { src: '/img/dostoinstvo.jpg', title: "Russian's Empire Tinder" },
  { src: '/img/vova.png', title: 'Legendary picture of vova' },
  { src: '/img/kronk.png', title: 'The best man in the world' },
  { src: '/img/wave.jpg', title: 'My PC' },
  { src: '/img/nyan.jpg', title: 'Nyan' },
  { src: '/img/putin.jpg', title: 'Putin' },
  { src: '/img/asd.jpg', title: 'asd' },
];

function ensureLightbox(): { box: HTMLElement; img: HTMLImageElement } {
  let box = document.getElementById('gallery-lightbox');
  if (!box) {
    box = document.createElement('div');
    box.id = 'gallery-lightbox';
    box.className = 'gallery-lightbox';
    box.innerHTML = '<img alt="" />';
    box.addEventListener('click', () => box!.classList.remove('active'));
    document.body.appendChild(box);
  }
  return { box, img: box.querySelector('img')! };
}

export function galleryGridHtml(variant: 'desktop' | 'mobile'): string {
  const cls = variant === 'desktop' ? 'gallery-grid' : 'gallery-grid gallery-grid--mobile';
  return `<div class="${cls}">${PHOTOS.map(
    (p, i) =>
      `<button type="button" class="gallery-thumb" data-photo-index="${i}"><img src="${p.src}" alt="${p.title}" loading="lazy" /></button>`
  ).join('')}</div>`;
}

export function mountGallery(root: HTMLElement) {
  const { box, img } = ensureLightbox();
  root.querySelectorAll<HTMLElement>('[data-photo-index]').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const idx = Number(thumb.getAttribute('data-photo-index'));
      const photo = PHOTOS[idx];
      if (!photo) return;
      img.src = photo.src;
      img.alt = photo.title;
      box.classList.add('active');
    });
  });
}
