import * as THREE from 'three';
import { GAME_CONFIG, COLORS } from '../config';

export class GameRenderer {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  
  private track: THREE.Mesh | null = null;
  private trackEdges: THREE.Mesh[] = [];
  private player: THREE.Group | null = null;
  
  private ambientLight: THREE.AmbientLight | null = null;
  private directionalLight: THREE.DirectionalLight | null = null;
  private pointLight: THREE.PointLight | null = null;
  
  private animationFrameId: number | null = null;
  private onUpdateCallbacks: Array<(delta: number, elapsed: number) => void> = [];
  
  private isRunning = false;
  private backgroundParticles: THREE.Points | null = null;
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.BACKGROUND);
    this.scene.fog = new THREE.Fog(COLORS.BACKGROUND, 30, 100);
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 8);
    this.camera.lookAt(0, 0, -10);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    
    this.container.appendChild(this.renderer.domElement);
    
    this.setupLights();
    this.createTrack();
    this.createPlayer();
    this.createBackgroundParticles();
    this.setupResizeHandler();
  }
  
  private setupLights(): void {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);
    
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(5, 10, 5);
    this.scene.add(this.directionalLight);
    
    this.pointLight = new THREE.PointLight(COLORS.PRIMARY, 2, 30);
    this.pointLight.position.set(0, 3, 0);
    this.scene.add(this.pointLight);
  }
  
  private createTrack(): void {
    const trackWidth = GAME_CONFIG.LANE_COUNT * GAME_CONFIG.LANE_WIDTH;
    const trackGeometry = new THREE.PlaneGeometry(trackWidth, GAME_CONFIG.TRACK_LENGTH);
    const trackMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.TRACK,
      metalness: 0.3,
      roughness: 0.8,
    });
    
    this.track = new THREE.Mesh(trackGeometry, trackMaterial);
    this.track.rotation.x = -Math.PI / 2;
    this.track.position.z = -GAME_CONFIG.TRACK_LENGTH / 2 + 10;
    this.scene.add(this.track);
    
    const edgeGeometry = new THREE.BoxGeometry(0.2, 0.3, GAME_CONFIG.TRACK_LENGTH);
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.TRACK_EDGE,
      emissive: COLORS.PRIMARY,
      emissiveIntensity: 0.3,
    });
    
    const leftEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    leftEdge.position.set(-trackWidth / 2 - 0.1, 0.15, -GAME_CONFIG.TRACK_LENGTH / 2 + 10);
    this.scene.add(leftEdge);
    this.trackEdges.push(leftEdge);
    
    const rightEdge = new THREE.Mesh(edgeGeometry, edgeMaterial.clone());
    rightEdge.position.set(trackWidth / 2 + 0.1, 0.15, -GAME_CONFIG.TRACK_LENGTH / 2 + 10);
    this.scene.add(rightEdge);
    this.trackEdges.push(rightEdge);
    
    for (let i = 1; i < GAME_CONFIG.LANE_COUNT; i++) {
      const dividerGeometry = new THREE.BoxGeometry(0.1, 0.05, GAME_CONFIG.TRACK_LENGTH);
      const dividerMaterial = new THREE.MeshStandardMaterial({
        color: 0x333355,
        transparent: true,
        opacity: 0.5,
      });
      const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
      divider.position.set(
        -trackWidth / 2 + i * GAME_CONFIG.LANE_WIDTH,
        0.02,
        -GAME_CONFIG.TRACK_LENGTH / 2 + 10
      );
      this.scene.add(divider);
    }
  }
  
  private createPlayer(): void {
    this.player = new THREE.Group();
    
    const bodyGeometry = new THREE.OctahedronGeometry(0.6, 0);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.PRIMARY,
      emissive: COLORS.PRIMARY,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = GAME_CONFIG.PLAYER_Y;
    body.rotation.y = Math.PI / 4;
    this.player.add(body);
    
    const trailGeometry = new THREE.ConeGeometry(0.3, 1.5, 6);
    const trailMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.SECONDARY,
      emissive: COLORS.SECONDARY,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.7,
    });
    const trail = new THREE.Mesh(trailGeometry, trailMaterial);
    trail.rotation.x = Math.PI / 2;
    trail.position.set(0, GAME_CONFIG.PLAYER_Y, 0.8);
    this.player.add(trail);
    
    const playerLight = new THREE.PointLight(COLORS.PRIMARY, 1, 8);
    playerLight.position.y = GAME_CONFIG.PLAYER_Y + 1;
    this.player.add(playerLight);
    
    this.player.position.set(0, 0, 0);
    this.scene.add(this.player);
  }
  
  private createBackgroundParticles(): void {
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 60;
      positions[i3 + 1] = Math.random() * 30;
      positions[i3 + 2] = -Math.random() * 150;
      
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.5, 0.8, 0.6);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    
    this.backgroundParticles = new THREE.Points(geometry, material);
    this.scene.add(this.backgroundParticles);
  }
  
  private setupResizeHandler(): void {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this.animate();
  }
  
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  private animate(): void {
    if (!this.isRunning) return;
    
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();
    
    for (const callback of this.onUpdateCallbacks) {
      callback(delta, elapsed);
    }
    
    this.renderer.render(this.scene, this.camera);
  }
  
  onUpdate(callback: (delta: number, elapsed: number) => void): () => void {
    this.onUpdateCallbacks.push(callback);
    return () => {
      const index = this.onUpdateCallbacks.indexOf(callback);
      if (index > -1) this.onUpdateCallbacks.splice(index, 1);
    };
  }
  
  getScene(): THREE.Scene {
    return this.scene;
  }
  
  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }
  
  getPlayer(): THREE.Group | null {
    return this.player;
  }
  
  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
  
  getPointLight(): THREE.PointLight | null {
    return this.pointLight;
  }
  
  getBackgroundParticles(): THREE.Points | null {
    return this.backgroundParticles;
  }
  
  getTrackEdges(): THREE.Mesh[] {
    return this.trackEdges;
  }
  
  dispose(): void {
    this.stop();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
