import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 30;
camera.position.y = 10;
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(-10, -10, 10);
scene.add(pointLight);

const cubes = [];
const cubeData = [];

for (let i = 0; i < 20; i++) {
    const width = Math.random() * 3 + 1;
    const height = Math.random() * 3 + 1;
    const depth = Math.random() * 3 + 1;

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(Math.random(), Math.random(), Math.random()),
        shininess: 100
    });
    const cube = new THREE.Mesh(geometry, material);

    cube.position.x = (Math.random() - 0.5) * 40;
    cube.position.y = (Math.random() - 0.5) * 20;
    cube.position.z = (Math.random() - 0.5) * 40;

    cube.rotation.x = Math.random() * Math.PI;
    cube.rotation.y = Math.random() * Math.PI;

    scene.add(cube);
    cubes.push(cube);

    cubeData.push({
        mesh: cube,
        originalColor: material.color.clone(),
        position: cube.position.clone(),
        size: { width, height, depth }
    });
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedCube = null;
let animationId = null;

const cubeInfoDiv = document.getElementById('cube-info');
const noSelectionDiv = document.getElementById('no-selection');

function updateUI(data) {
    if (data) {
        cubeInfoDiv.innerHTML = `
            <div class="info-section">
                <div class="info-label">Position</div>
                <div class="info-content">
                    <div>X: <span class="coord-x">${data.position.x.toFixed(2)}</span></div>
                    <div>Y: <span class="coord-y">${data.position.y.toFixed(2)}</span></div>
                    <div>Z: <span class="coord-z">${data.position.z.toFixed(2)}</span></div>
                </div>
            </div>
            <div class="info-section">
                <div class="info-label">Size</div>
                <div class="info-content">
                    <div>Width: <span class="size-w">${data.size.width.toFixed(2)}</span></div>
                    <div>Height: <span class="size-h">${data.size.height.toFixed(2)}</span></div>
                    <div>Depth: <span class="size-d">${data.size.depth.toFixed(2)}</span></div>
                </div>
            </div>
        `;
        noSelectionDiv.classList.add('hidden');
    } else {
        cubeInfoDiv.innerHTML = '<div class="placeholder">Click a cube to see its information here.</div>';
        noSelectionDiv.classList.remove('hidden');
    }
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(cubes);

    if (selectedCube) {
        const prevData = cubeData.find(d => d.mesh === selectedCube);
        if (prevData) {
            selectedCube.material.color.copy(prevData.originalColor);
            selectedCube.material.emissive.setHex(0x000000);
        }
    }

    if (intersects.length > 0) {
        selectedCube = intersects[0].object;
        const data = cubeData.find(d => d.mesh === selectedCube);

        if (data) {
            selectedCube.material.color.setHex(0xffff00);
            selectedCube.material.emissive.setHex(0xff6600);

            updateUI(data);

            const startScale = 1;
            const endScale = 1.2;
            const duration = 300;
            const startTime = Date.now();

            const animatePulse = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                let scale;
                if (progress < 0.5) {
                    scale = startScale + (endScale - startScale) * (progress * 2);
                } else {
                    scale = endScale - (endScale - startScale) * ((progress - 0.5) * 2);
                }

                selectedCube.scale.set(scale, scale, scale);

                if (progress < 1) {
                    animationId = requestAnimationFrame(animatePulse);
                }
            };

            if (animationId) cancelAnimationFrame(animationId);
            animatePulse();
        }
    } else {
        selectedCube = null;
        updateUI(null);
    }
}

window.addEventListener('click', onMouseClick);

const rotationSpeed = 0.001;
function animate() {
    requestAnimationFrame(animate);

    cubes.forEach((cube, i) => {
        cube.rotation.x += rotationSpeed * (1 + i * 0.1);
        cube.rotation.y += rotationSpeed * (1 + i * 0.1);
    });

    const time = Date.now() * 0.0001;
    camera.position.x = Math.sin(time) * 30;
    camera.position.z = Math.cos(time) * 30;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

animate();

function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleResize);