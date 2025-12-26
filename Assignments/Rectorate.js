import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const SEEUCampus = () => {
  const mountRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [info, setInfo] = useState('Click Rectorate to change color • Press L to toggle lights • Hover for info');

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(50, 35, 50);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Orbit Controls (manual implementation)
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;
    const rotationSpeed = 0.005;
    const radius = 80;

    const onMouseDown = (e) => {
      isMouseDown = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;
      targetRotationY += deltaX * rotationSpeed;
      targetRotationX += deltaY * rotationSpeed;
      targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX));
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      camera.position.multiplyScalar(e.deltaY > 0 ? 1.1 : 0.9);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel);

    // Create textures using canvas (procedural textures)
    const createBrickTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, 0, 512, 512);
      
      ctx.fillStyle = '#A0522D';
      for (let y = 0; y < 512; y += 64) {
        for (let x = 0; x < 512; x += 128) {
          const offsetX = (y / 64) % 2 === 0 ? 0 : 64;
          ctx.fillRect(x + offsetX, y, 120, 60);
        }
      }
      
      return new THREE.CanvasTexture(canvas);
    };

    const createConcreteTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#CCCCCC';
      ctx.fillRect(0, 0, 512, 512);
      
      for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const shade = Math.random() * 50 - 25;
        ctx.fillStyle = `rgb(${204 + shade}, ${204 + shade}, ${204 + shade})`;
        ctx.fillRect(x, y, 2, 2);
      }
      
      return new THREE.CanvasTexture(canvas);
    };

    const createGrassTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#2d5a2d';
      ctx.fillRect(0, 0, 512, 512);
      
      for (let i = 0; i < 3000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const shade = Math.random() * 40 - 20;
        ctx.fillStyle = `rgb(${45 + shade}, ${90 + shade}, ${45 + shade})`;
        ctx.fillRect(x, y, 1, 3);
      }
      
      return new THREE.CanvasTexture(canvas);
    };

    const createRoadTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(0, 0, 512, 512);
      
      return new THREE.CanvasTexture(canvas);
    };

    const brickTexture = createBrickTexture();
    const concreteTexture = createConcreteTexture();
    const grassTexture = createGrassTexture();
    const roadTexture = createRoadTexture();

    brickTexture.wrapS = brickTexture.wrapT = THREE.RepeatWrapping;
    brickTexture.repeat.set(3, 3);
    concreteTexture.wrapS = concreteTexture.wrapT = THREE.RepeatWrapping;
    concreteTexture.repeat.set(2, 2);
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(15, 15);
    roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(5, 5);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(40, 60, 30);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -60;
    directionalLight.shadow.camera.right = 60;
    directionalLight.shadow.camera.top = 60;
    directionalLight.shadow.camera.bottom = -60;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x2d5a2d, 0.3);
    scene.add(hemisphereLight);

    const pointLight = new THREE.PointLight(0xffaa00, 1.5, 60);
    pointLight.position.set(0, 20, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Ground - Grass
    const grassGeometry = new THREE.PlaneGeometry(120, 120);
    const grassMaterial = new THREE.MeshStandardMaterial({ 
      map: grassTexture,
      roughness: 0.8
    });
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;
    scene.add(grass);

    // Create Rectorate Building (Large complex structure)
    const rectorateGroup = new THREE.Group();
    
    // Main building - central tower
    const mainBuildingGeometry = new THREE.BoxGeometry(25, 25, 20);
    const mainBuildingMaterial = new THREE.MeshStandardMaterial({ 
      map: brickTexture,
      roughness: 0.7,
      metalness: 0.1
    });
    const mainBuilding = new THREE.Mesh(mainBuildingGeometry, mainBuildingMaterial);
    mainBuilding.position.set(0, 12.5, 0);
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    rectorateGroup.add(mainBuilding);

    // Left wing
    const leftWingGeometry = new THREE.BoxGeometry(15, 15, 15);
    const leftWingMaterial = new THREE.MeshPhongMaterial({ 
      map: concreteTexture,
      shininess: 30
    });
    const leftWing = new THREE.Mesh(leftWingGeometry, leftWingMaterial);
    leftWing.position.set(-18, 7.5, 0);
    leftWing.castShadow = true;
    leftWing.receiveShadow = true;
    rectorateGroup.add(leftWing);

    // Right wing
    const rightWing = new THREE.Mesh(leftWingGeometry, leftWingMaterial);
    rightWing.position.set(18, 7.5, 0);
    rightWing.castShadow = true;
    rightWing.receiveShadow = true;
    rectorateGroup.add(rightWing);

    // Front entrance
    const entranceGeometry = new THREE.BoxGeometry(8, 12, 5);
    const entranceMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xe8d4a0
    });
    const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
    entrance.position.set(0, 6, 12.5);
    entrance.castShadow = true;
    entrance.receiveShadow = true;
    rectorateGroup.add(entrance);

    // Add many windows to the rectorate
    const windowMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      transparent: true,
      opacity: 0.7,
      shininess: 80
    });

    // Windows for main building
    for (let floor = 0; floor < 5; floor++) {
      for (let col = 0; col < 6; col++) {
        const window = new THREE.Mesh(
          new THREE.BoxGeometry(2.5, 2.5, 0.2),
          windowMaterial
        );
        window.position.set(
          -10 + col * 4,
          3 + floor * 4.5,
          10.1
        );
        rectorateGroup.add(window);
      }
    }

    // Windows for wings
    for (let floor = 0; floor < 3; floor++) {
      for (let col = 0; col < 3; col++) {
        const windowLeft = new THREE.Mesh(
          new THREE.BoxGeometry(2.5, 2.5, 0.2),
          windowMaterial
        );
        windowLeft.position.set(
          -22 + col * 4,
          2 + floor * 4.5,
          7.6
        );
        rectorateGroup.add(windowLeft);

        const windowRight = new THREE.Mesh(
          new THREE.BoxGeometry(2.5, 2.5, 0.2),
          windowMaterial
        );
        windowRight.position.set(
          14 + col * 4,
          2 + floor * 4.5,
          7.6
        );
        rectorateGroup.add(windowRight);
      }
    }

    rectorateGroup.userData = { name: 'SEEU Rectorate Building' };
    scene.add(rectorateGroup);

    // Create Roundabout in front of Rectorate
    const roundaboutGroup = new THREE.Group();
    roundaboutGroup.position.set(0, 0.1, 35);

    // Outer circle (road)
    const outerRingGeometry = new THREE.RingGeometry(10, 14, 64);
    const outerRingMaterial = new THREE.MeshStandardMaterial({ 
      map: roadTexture,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.receiveShadow = true;
    roundaboutGroup.add(outerRing);

    // Inner circle (grass island)
    const innerCircleGeometry = new THREE.CircleGeometry(10, 64);
    const innerCircleMaterial = new THREE.MeshStandardMaterial({ 
      map: grassTexture,
      roughness: 0.8
    });
    const innerCircle = new THREE.Mesh(innerCircleGeometry, innerCircleMaterial);
    innerCircle.rotation.x = -Math.PI / 2;
    innerCircle.receiveShadow = true;
    roundaboutGroup.add(innerCircle);

    // Central fountain/monument
    const monumentGeometry = new THREE.CylinderGeometry(1, 1.5, 4, 16);
    const monumentMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B7355,
      metalness: 0.3,
      roughness: 0.7
    });
    const monument = new THREE.Mesh(monumentGeometry, monumentMaterial);
    monument.position.y = 2;
    monument.castShadow = true;
    roundaboutGroup.add(monument);

    scene.add(roundaboutGroup);

    // Roads connecting to roundabout
    const roadToBuilding = new THREE.PlaneGeometry(8, 22);
    const roadMat = new THREE.MeshStandardMaterial({ 
      map: roadTexture,
      roughness: 0.6
    });
    const road1 = new THREE.Mesh(roadToBuilding, roadMat);
    road1.rotation.x = -Math.PI / 2;
    road1.position.set(0, 0.05, 24);
    road1.receiveShadow = true;
    scene.add(road1);

    // Main entrance road
    const entranceRoad = new THREE.PlaneGeometry(8, 30);
    const road2 = new THREE.Mesh(entranceRoad, roadMat);
    road2.rotation.x = -Math.PI / 2;
    road2.position.set(0, 0.05, 64);
    road2.receiveShadow = true;
    scene.add(road2);

    // Create Flag Poles in front of Rectorate
    const createFlagPole = (x, z, flagColor, countryName) => {
      const poleGroup = new THREE.Group();
      
      // Pole
      const poleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 14, 8);
      const poleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xcccccc,
        metalness: 0.9,
        roughness: 0.2
      });
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.y = 7;
      pole.castShadow = true;
      poleGroup.add(pole);

      // Pole base
      const baseGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.5, 8);
      const base = new THREE.Mesh(baseGeometry, poleMaterial);
      base.position.y = 0.25;
      base.castShadow = true;
      poleGroup.add(base);

      // Flag
      const flagGeometry = new THREE.PlaneGeometry(4, 2.5);
      const flagMaterial = new THREE.MeshStandardMaterial({ 
        color: flagColor,
        side: THREE.DoubleSide
      });
      const flag = new THREE.Mesh(flagGeometry, flagMaterial);
      flag.position.set(2, 12, 0);
      flag.castShadow = true;
      poleGroup.add(flag);

      poleGroup.position.set(x, 0, z);
      poleGroup.userData = { flag, countryName, time: Math.random() * Math.PI * 2 };
      
      return poleGroup;
    };

    // Five flag poles in front
    const flags = [];
    flags.push(createFlagPole(-12, 27, 0xff0000, 'North Macedonia'));
    flags.push(createFlagPole(-6, 27, 0x0000ff, 'European Union'));
    flags.push(createFlagPole(0, 27, 0xffffff, 'SEEU'));
    flags.push(createFlagPole(6, 27, 0x00ff00, 'Albania'));
    flags.push(createFlagPole(12, 27, 0xffff00, 'Kosovo'));

    flags.forEach(flagPole => scene.add(flagPole));

    // Add decorative trees around
    const createTree = (x, z) => {
      const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.5, 4, 8);
      const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x4a2511 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, 2, z);
      trunk.castShadow = true;
      scene.add(trunk);

      const leavesGeometry = new THREE.SphereGeometry(2.5, 8, 8);
      const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5a2d });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.set(x, 5, z);
      leaves.castShadow = true;
      scene.add(leaves);

      return { trunk, leaves };
    };

    const trees = [];
    trees.push(createTree(-35, 15));
    trees.push(createTree(35, 15));
    trees.push(createTree(-30, 40));
    trees.push(createTree(30, 40));
    trees.push(createTree(-25, -10));
    trees.push(createTree(25, -10));

    // Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(rectorateGroup.children, true);

      if (intersects.length > 0) {
        const randomColor = Math.random() * 0xffffff;
        mainBuildingMaterial.color.setHex(randomColor);
        setInfo('Rectorate Building - Color changed!');
        setTimeout(() => setInfo('Click Rectorate to change color • Press L to toggle lights • Hover for info'), 2000);
      }
    };

    const onHover = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(rectorateGroup.children, true);

      if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
        setInfo('Hovering: SEEU Rectorate Building');
      } else {
        document.body.style.cursor = 'default';
        setInfo('Click Rectorate to change color • Press L to toggle lights • Hover for info');
      }
    };

    let lightsOn = true;
    const onKeyPress = (event) => {
      if (event.key === 'l' || event.key === 'L') {
        lightsOn = !lightsOn;
        directionalLight.intensity = lightsOn ? 0.8 : 0.2;
        pointLight.intensity = lightsOn ? 1.5 : 0;
        setInfo(`Lights ${lightsOn ? 'ON' : 'OFF'}`);
        setTimeout(() => setInfo('Click Rectorate to change color • Press L to toggle lights • Hover for info'), 1500);
      }
    };

    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('mousemove', onHover);
    window.addEventListener('keypress', onKeyPress);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Animate flags (waving)
      flags.forEach(flagPole => {
        const flagTime = time + flagPole.userData.time;
        const flag = flagPole.userData.flag;
        flag.rotation.y = Math.sin(flagTime * 2) * 0.2;
        flag.position.x = 2 + Math.sin(flagTime * 2) * 0.3;
      });

      // Animate point light (pulsing)
      pointLight.intensity = 1.5 + Math.sin(time * 3) * 0.4;

      // Rotate trees slightly
      trees.forEach((tree, index) => {
        tree.leaves.rotation.y += 0.002 * (index % 2 === 0 ? 1 : -1);
      });

      // Smooth camera rotation
      currentRotationX += (targetRotationX - currentRotationX) * 0.05;
      currentRotationY += (targetRotationY - currentRotationY) * 0.05;

      camera.position.x = radius * Math.sin(currentRotationY) * Math.cos(currentRotationX);
      camera.position.y = radius * Math.sin(currentRotationX) + 25;
      camera.position.z = radius * Math.cos(currentRotationY) * Math.cos(currentRotationX);
      camera.lookAt(0, 8, 0);

      renderer.render(scene, camera);
    };

    animate();
    setIsLoading(false);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('click', onMouseClick);
      window.removeEventListener('keypress', onKeyPress);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#000' }}>
      <div 
        ref={mountRef} 
        style={{ width: '100%', height: '100%' }}
      />
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '24px',
          fontFamily: 'Arial, sans-serif'
        }}>
          Loading SEEU Rectorate...
        </div>
      )}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '15px 25px',
        borderRadius: '10px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        textAlign: 'center',
        maxWidth: '80%'
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>SEEU Rectorate - Tetovo, North Macedonia</h2>
        <p style={{ margin: 0 }}>{info}</p>
      </div>
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px'
      }}>
        <p style={{ margin: '5px 0' }}><strong>Controls:</strong></p>
        <p style={{ margin: '5px 0' }}>🖱️ Drag to rotate</p>
        <p style={{ margin: '5px 0' }}>🖱️ Scroll to zoom</p>
        <p style={{ margin: '5px 0' }}>🖱️ Click Rectorate to change color</p>
        <p style={{ margin: '5px 0' }}>⌨️ Press 'L' to toggle lights</p>
      </div>
    </div>
  );
};

export default SEEUCampus;