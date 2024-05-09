import * as THREE from 'three';
import { TerrainFace } from './terrainFace';

export class Planet {
  constructor(position, size = 1000, player, scene) {
    this.position = position;
    this.meshFilters = new THREE.Group();
    this.scene = scene;
    scene.add(this.meshFilters);
    this.terrainFaces = [];
    this.size = size;
    this.player = player;
    this.startResolution = 9;
    this.cullingMinAngle = 1.91986218;

    this.distanceToPlayer = 0.0;

    this.detailLevelDistances = [];
    this.detailLevelDistances.push(9999999999999.99);
    let max = this.size * 6;
    this.detailLevelDistances.push(max);
    this.detailLevelDistances.push(max / 2);
    this.detailLevelDistances.push(max / 2 / 2);
    this.detailLevelDistances.push(max / 2 / 2 / 2);
    this.detailLevelDistances.push(max / 2 / 2 / 2 / 3);
    this.detailLevelDistances.push(max / 2 / 2 / 2 / 3 / 3);
    this.detailLevelDistances.push(max / 2 / 2 / 2 / 3 / 3 / 3);
    this.detailLevelDistances.push(max / 2 / 2 / 2 / 3 / 3 / 3 / 3);

    this.up = new THREE.Vector3(0, 1, 0);
    this.down = new THREE.Vector3(0, -1, 0);
    this.forward = new THREE.Vector3(0, 0, 1);
    this.back = new THREE.Vector3(0, 0, -1);
    this.left = new THREE.Vector3(-1, 0, 0);
    this.right = new THREE.Vector3(1, 0, 0);

    this.Initialize();
    this.GenerateMesh();
  }

  Update() {
    this.distanceToPlayer = this.position.distanceTo(this.player.position);
    this.UpdateMesh();
  }

  PlanetGenerationLoop() {
    this.GenerateMesh();
  }

  Initialize() {
    this.terrainFaces.push(new TerrainFace(4, this.forward, this.size, this));
    this.terrainFaces.push(new TerrainFace(4, this.back, this.size, this));
    this.terrainFaces.push(new TerrainFace(4, this.left, this.size, this));
    this.terrainFaces.push(new TerrainFace(4, this.right, this.size, this));
    this.terrainFaces.push(new TerrainFace(4, this.up, this.size, this));
    this.terrainFaces.push(new TerrainFace(4, this.down, this.size, this));
    for (const face of this.terrainFaces) {
      this.meshFilters.add(face);
    }
  }

  GenerateMesh() {
    for (const face of this.terrainFaces) {
      face.ConstructTree();
    }
  }

  UpdateMesh() {
    for (const face of this.terrainFaces) {
      face.UpdateTree();
    }
  }
}
