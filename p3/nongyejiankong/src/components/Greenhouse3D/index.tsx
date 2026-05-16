import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useAppContext } from '../../store/AppContext';
import { SENSOR_CONFIG } from '../../utils/constants';
import './Greenhouse3D.scss';

export const Greenhouse3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sensorMarkersRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const { state, selectSensor } = useAppContext();

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1419);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(8, 6, 8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 4;
    controls.maxDistance = 20;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const groundGeometry = new THREE.PlaneGeometry(12, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d5c3d,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const greenhouseGroup = new THREE.Group();

    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x6b7280,
      metalness: 0.5,
      roughness: 0.3,
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });

    const verticalPoleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 4, 8);
    const polePositions = [
      [-5, 2, -4], [5, 2, -4], [-5, 2, 4], [5, 2, 4],
      [-2.5, 2, -4], [2.5, 2, -4], [-2.5, 2, 4], [2.5, 2, 4],
    ];

    polePositions.forEach(([x, y, z]) => {
      const pole = new THREE.Mesh(verticalPoleGeometry, frameMaterial);
      pole.position.set(x, y, z);
      pole.castShadow = true;
      greenhouseGroup.add(pole);
    });

    const horizontalBeamGeometry = new THREE.CylinderGeometry(0.06, 0.06, 10, 8);
    const zPositions = [-4, 0, 4];
    zPositions.forEach((z) => {
      const beam = new THREE.Mesh(horizontalBeamGeometry, frameMaterial);
      beam.rotation.z = Math.PI / 2;
      beam.position.set(0, 4, z);
      beam.castShadow = true;
      greenhouseGroup.add(beam);
    });

    const crossBeamGeometry = new THREE.CylinderGeometry(0.06, 0.06, 8, 8);
    const xPositions = [-5, 0, 5];
    xPositions.forEach((x) => {
      const beam = new THREE.Mesh(crossBeamGeometry, frameMaterial);
      beam.rotation.x = Math.PI / 2;
      beam.position.set(x, 4, 0);
      beam.castShadow = true;
      greenhouseGroup.add(beam);
    });

    const roofShape = new THREE.Shape();
    roofShape.moveTo(-5, 4);
    roofShape.lineTo(0, 6);
    roofShape.lineTo(5, 4);
    roofShape.lineTo(-5, 4);

    const extrudeSettings = {
      depth: 8,
      bevelEnabled: false,
    };

    const roofGeometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
    const roof = new THREE.Mesh(roofGeometry, glassMaterial);
    roof.rotation.x = Math.PI / 2;
    roof.position.set(0, 0, -4);
    greenhouseGroup.add(roof);

    const sideWallGeometry = new THREE.PlaneGeometry(10, 4);
    const sideWallPositions = [
      { pos: [0, 2, -4], rot: [0, 0, 0] },
      { pos: [0, 2, 4], rot: [0, 0, 0] },
      { pos: [-5, 2, 0], rot: [0, Math.PI / 2, 0] },
      { pos: [5, 2, 0], rot: [0, Math.PI / 2, 0] },
    ];

    sideWallPositions.forEach(({ pos, rot }) => {
      const wall = new THREE.Mesh(sideWallGeometry, glassMaterial);
      wall.position.set(pos[0], pos[1], pos[2]);
      wall.rotation.set(rot[0], rot[1], rot[2]);
      greenhouseGroup.add(wall);
    });

    scene.add(greenhouseGroup);

    const plantGeometry = new THREE.ConeGeometry(0.3, 1, 8);
    const plantMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    
    for (let i = -3; i <= 3; i += 1.5) {
      for (let j = -2; j <= 2; j += 1.5) {
        const plant = new THREE.Mesh(plantGeometry, plantMaterial);
        plant.position.set(i, 0.5, j);
        plant.castShadow = true;
        scene.add(plant);
      }
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Array.from(sensorMarkersRef.current.values()));

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const sensorId = clickedMesh.userData.sensorId;
        selectSensor(sensorId);
      }
    };

    renderer.domElement.addEventListener('click', onMouseClick);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      
      sensorMarkersRef.current.forEach((marker) => {
        marker.rotation.y += 0.01;
        if (marker.userData.status !== 'normal') {
          marker.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.2);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', onMouseClick);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectSensor]);

  useEffect(() => {
    if (!sceneRef.current) return;

    state.sensors.forEach((sensor) => {
      let marker = sensorMarkersRef.current.get(sensor.id);
      
      if (!marker) {
        const geometry = new THREE.SphereGeometry(0.25, 16, 16);
        const material = new THREE.MeshStandardMaterial({
          color: SENSOR_CONFIG[sensor.type].color,
          emissive: SENSOR_CONFIG[sensor.type].color,
          emissiveIntensity: 0.3,
        });
        marker = new THREE.Mesh(geometry, material);
        marker.userData.sensorId = sensor.id;
        sceneRef.current?.add(marker);
        sensorMarkersRef.current.set(sensor.id, marker);
      }

      marker.position.set(
        sensor.location.x,
        sensor.location.y,
        sensor.location.z
      );
      marker.userData.status = sensor.status;
      
      const material = marker.material as THREE.MeshStandardMaterial;
      if (sensor.status === 'danger') {
        material.emissiveIntensity = 0.8;
        material.emissive.setHex(0xff0000);
      } else if (sensor.status === 'warning') {
        material.emissiveIntensity = 0.6;
        material.emissive.setHex(0xffa500);
      } else {
        material.emissiveIntensity = 0.3;
        material.emissive.set(SENSOR_CONFIG[sensor.type].color);
      }
    });
  }, [state.sensors]);

  return (
    <div className="greenhouse-3d">
      <h3 className="greenhouse-3d__title">温室三维可视化</h3>
      <div ref={containerRef} className="greenhouse-3d__canvas" />
      <div className="greenhouse-3d__legend">
        {Object.entries(SENSOR_CONFIG).map(([key, config]) => (
          <div key={key} className="greenhouse-3d__legend-item">
            <span 
              className="greenhouse-3d__legend-dot"
              style={{ backgroundColor: config.color }}
            />
            <span>{config.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
