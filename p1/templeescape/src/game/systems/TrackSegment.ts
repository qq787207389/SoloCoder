import * as THREE from 'three';
import { GameConfig } from '../config/GameConfig';
import { ThemeConfig } from '../config/ThemeConfig';

export type ThemeType = keyof typeof ThemeConfig;

export class TrackSegment {
  public mesh: THREE.Group;
  public theme: ThemeType;
  public length: number = GameConfig.TRACK_SEGMENT_LENGTH;
  public active: boolean = false;
  public startZ: number = 0;

  constructor(theme: ThemeType) {
    this.theme = theme;
    this.mesh = new THREE.Group();
    this.createTrack();
  }

  private createTrack(): void {
    const colors = ThemeConfig[this.theme];
    
    const trackWidth = GameConfig.LANE_WIDTH * GameConfig.LANE_COUNT + 2;
    
    const groundGeometry = new THREE.PlaneGeometry(trackWidth, this.length, 10, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: colors.ground,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.mesh.add(ground);

    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    for (let i = 1; i < GameConfig.LANE_COUNT; i++) {
      const lineGeometry = new THREE.PlaneGeometry(0.1, this.length);
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.x = (i - GameConfig.LANE_COUNT / 2 + 0.5) * GameConfig.LANE_WIDTH;
      line.position.y = 0.01;
      this.mesh.add(line);
    }

    const edgeGeometry = new THREE.BoxGeometry(0.3, 0.2, this.length);
    const edgeMaterial = new THREE.MeshStandardMaterial({ color: colors.groundDark });
    
    const leftEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    leftEdge.position.x = -trackWidth / 2 + 0.15;
    leftEdge.position.y = 0.1;
    leftEdge.castShadow = true;
    this.mesh.add(leftEdge);

    const rightEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    rightEdge.position.x = trackWidth / 2 - 0.15;
    rightEdge.position.y = 0.1;
    rightEdge.castShadow = true;
    this.mesh.add(rightEdge);

    this.addDecorations(colors);
  }

  private addDecorations(_colors: typeof ThemeConfig[keyof typeof ThemeConfig]): void {
    if (this.theme === 'forest') {
      for (let i = 0; i < 8; i++) {
        const tree = this.createTree();
        tree.position.set(
          (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 5),
          0,
          -this.length / 2 + Math.random() * this.length
        );
        this.mesh.add(tree);
      }
    } else if (this.theme === 'city') {
      for (let i = 0; i < 6; i++) {
        const building = this.createBuilding();
        building.position.set(
          (Math.random() > 0.5 ? 1 : -1) * (6 + Math.random() * 4),
          0,
          -this.length / 2 + (i + 0.5) * (this.length / 6)
        );
        this.mesh.add(building);
      }
    } else if (this.theme === 'cave') {
      for (let i = 0; i < 10; i++) {
        const stalactite = this.createStalactite();
        stalactite.position.set(
          (Math.random() - 0.5) * 12,
          8 + Math.random() * 4,
          -this.length / 2 + Math.random() * this.length
        );
        this.mesh.add(stalactite);
      }
    }
  }

  private createTree(): THREE.Group {
    const tree = new THREE.Group();
    
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.castShadow = true;
    tree.add(trunk);

    const leavesGeometry = new THREE.ConeGeometry(1.2, 2.5, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 3;
    leaves.castShadow = true;
    tree.add(leaves);

    return tree;
  }

  private createBuilding(): THREE.Group {
    const building = new THREE.Group();
    const height = 3 + Math.random() * 5;
    const width = 1.5 + Math.random() * 1.5;
    
    const buildingGeometry = new THREE.BoxGeometry(width, height, width);
    const buildingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x607d8b,
      roughness: 0.7,
    });
    const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
    buildingMesh.position.y = height / 2;
    buildingMesh.castShadow = true;
    building.add(buildingMesh);

    return building;
  }

  private createStalactite(): THREE.Group {
    const stalactite = new THREE.Group();
    const height = 2 + Math.random() * 3;
    
    const geometry = new THREE.ConeGeometry(0.3 + Math.random() * 0.3, height, 6);
    const material = new THREE.MeshStandardMaterial({ color: 0x4a4a5a, roughness: 0.9 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI;
    mesh.castShadow = true;
    stalactite.add(mesh);

    return stalactite;
  }

  public activate(startZ: number, theme?: ThemeType): void {
    this.active = true;
    this.startZ = startZ;
    this.mesh.visible = true;
    this.mesh.position.z = startZ - this.length / 2;

    if (theme && theme !== this.theme) {
      this.theme = theme;
      while (this.mesh.children.length > 0) {
        this.mesh.remove(this.mesh.children[0]);
      }
      this.createTrack();
    }
  }

  public deactivate(): void {
    this.active = false;
    this.mesh.visible = false;
  }

  public update(deltaTime: number, speed: number): void {
    if (!this.active) return;
    this.mesh.position.z += speed * deltaTime;
    this.startZ += speed * deltaTime;
  }
}
