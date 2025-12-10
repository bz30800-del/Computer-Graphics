import * as THREE from 'three';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Donut (torus)
const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
const material = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
const material2 = new THREE.MeshStandardMaterial({ color: 0x00aaff });
const material3 = new THREE.MeshStandardMaterial({ color: 0xaaff00 });
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);

const torus2 = new THREE.Mesh(geometry, material2);
torus2.position.x = 3;
scene.add(torus2);

const torus3 = new THREE.Mesh(geometry, material3);
torus3.position.x = -3;
scene.add(torus3);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 5, 5);
scene.add(light);

// Axes Helper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Animate
function animate() {
    requestAnimationFrame(animate);

    torus.rotation.x += 0.01;
    torus.rotation.y += 0.01;
    torus.rotation.z += 0.005;

    torus2.rotation.x -= 0.01;
    torus2.rotation.y -= 0.01;
    torus2.rotation.z -= 0.005;

    torus3.rotation.x += 0.01;

    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});