import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Chunk } from './chunk';

export class TerrainFace extends THREE.Group {
  constructor(resolution, localUp, radius) {
    super();
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.MeshStandardMaterial();
    this.mesh = new THREE.Mesh();
    this.add(this.mesh);
    this.resolution = resolution;
    this.localUp = localUp;
    this.axisA = new THREE.Vector3();
    this.axisB = new THREE.Vector3();
    this.radius = radius;

    this.vertices = [];
    this.triangles = [];

    this.GenerateTerrainFace();
  }

  GenerateTerrainFace() {
    this.axisA = new THREE.Vector3(this.localUp.y, this.localUp.z, this.localUp.x);
    this.axisB = this.localUp.clone();
    this.axisB = this.axisB.cross(this.axisA);
  }

  ConstructTree(Planet) {
    const parentChunk = new Chunk(
      null,
      null,
      this.localUp.normalize().multiplyScalar(Planet.size),
      this.radius,
      0,
      this.localUp,
      this.axisA,
      this.axisB,
    );

    parentChunk.GenerateChildren(Planet);
    let geometries = [];
    for (const child of parentChunk.GetVisibleChildren()) {
      const verticesAndTriangles = child.CalculateVerticesAndTriangles(Planet);
      let geometry = new THREE.BufferGeometry();
      const verticesArray = new Float32Array(verticesAndTriangles.vertices);
      geometry.setIndex(verticesAndTriangles.triangles);
      geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
      geometry.computeVertexNormals();
      geometry.normalizeNormals();
      geometry.computeBoundingBox();
      geometries.push(geometry);
    }
    this.mesh.geometry.dispose();
    this.mesh.clear();

    this.geometry = BufferGeometryUtils.mergeGeometries(geometries);
    this.geometry.computeVertexNormals();
    this.geometry.normalizeNormals();
    this.geometry.computeBoundingBox();
    this.material.face = THREE.DoubleFace;
    this.material.wireframe = true;
    this.material.receiveShadow = true;
    this.mesh.geometry = this.geometry;
    this.mesh.material = this.material;
  }
}
