import * as THREE from 'three';
import './styles/base.css';

document.getElementById('app')!.innerHTML = `
  <a href="/index.html" class="back-btn" aria-label="Back">\u2190 Back</a>
`;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xdddddd, 1);
Object.assign(renderer.domElement.style, {
  position: 'fixed',
  inset: '0',
  display: 'block',
});
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;
scene.add(camera);

const geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshBasicMaterial({ color: 0x0095dd });
const cube = new THREE.Mesh(geometry, material);
cube.rotation.set(0.4, 0.2, 0);
scene.add(cube);

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

function render() {
  requestAnimationFrame(render);
  cube.rotation.x += 0.003;
  cube.rotation.y += 0.004;
  renderer.render(scene, camera);
}
render();
