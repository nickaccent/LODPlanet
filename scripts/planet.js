import * as THREE from 'three';
import { TerrainFace } from './terrainFace';

export class Planet {
  constructor(size = 10, scene, player) {
    this.meshFilters = new THREE.Group();
    this.scene = scene;
    scene.add(this.meshFilters);
    this.terrainFaces = [];
    this.size = size;
    this.player = player;

    this.detailLevelDistances = [];
    this.detailLevelDistances.push(9999999999999.99);
    this.detailLevelDistances.push(60.0);
    this.detailLevelDistances.push(25.0);
    this.detailLevelDistances.push(10.0);
    this.detailLevelDistances.push(4.0);
    this.detailLevelDistances.push(1.5);
    this.detailLevelDistances.push(0.7);
    this.detailLevelDistances.push(0.3);
    this.detailLevelDistances.push(0.1);

    this.up = new THREE.Vector3(0, 1, 0);
    this.down = new THREE.Vector3(0, -1, 0);
    this.forward = new THREE.Vector3(0, 0, 1);
    this.back = new THREE.Vector3(0, 0, -1);
    this.left = new THREE.Vector3(-1, 0, 0);
    this.right = new THREE.Vector3(1, 0, 0);

    this.Initialize();
    this.GenerateMesh();
  }

  PlanetGenerationLoop() {
    this.GenerateMesh();
  }

  Initialize() {
    this.terrainFaces.push(new TerrainFace(4, this.forward, this.size));
    this.terrainFaces.push(new TerrainFace(4, this.back, this.size));
    this.terrainFaces.push(new TerrainFace(4, this.left, this.size));
    this.terrainFaces.push(new TerrainFace(4, this.right, this.size));
    this.terrainFaces.push(new TerrainFace(4, this.up, this.size));
    this.terrainFaces.push(new TerrainFace(4, this.down, this.size));
    for (const face of this.terrainFaces) {
      this.meshFilters.add(face);
    }
  }

  GenerateMesh() {
    for (const face of this.terrainFaces) {
      face.ConstructTree(this);
    }
  }
}
