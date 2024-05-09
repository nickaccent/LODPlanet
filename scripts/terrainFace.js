import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Chunk } from './chunk';

export class TerrainFace extends THREE.Group {
  constructor(resolution, localUp, radius, planet) {
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

    this.planet = planet;

    this.vertices = [];
    this.triangles = [];
    this.geometryCount = 0;
    this.visibleChildrenCount = 0;

    this.GenerateTerrainFace();
  }

  GenerateTerrainFace() {
    this.axisA = new THREE.Vector3(this.localUp.y, this.localUp.z, this.localUp.x);
    this.axisB = this.localUp.clone();
    this.axisB = this.axisB.cross(this.axisA);
  }

  ConstructTree() {
    this.parentChunk = new Chunk(
      this.planet,
      null,
      null,
      this.localUp.normalize().multiplyScalar(this.planet.size),
      this.radius,
      0,
      this.localUp,
      this.axisA,
      this.axisB,
      this,
    );

    this.parentChunk.GenerateChildren();
    if (this.parentChunk.GetVisibleChildren().length != this.visibleChildrenCount) {
      this.visibleChildrenCount = this.parentChunk.GetVisibleChildren().length;
      let geometries = [];
      for (const child of this.parentChunk.GetVisibleChildren()) {
        const verticesAndTriangles = child.CalculateVerticesAndTriangles(this.planet);
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

      if (geometries.length > 0) {
        this.geometry = BufferGeometryUtils.mergeGeometries(geometries);

        this.vertices = this.geometry.attributes.position.array;
        this.triangles = this.geometry.index.array;

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
  }

  UpdateTree() {
    this.parentChunk.UpdateChunk();
    let geometries = [];
    if (this.parentChunk.GetVisibleChildren().length != this.visibleChildrenCount) {
      this.visibleChildrenCount = this.parentChunk.GetVisibleChildren().length;
      for (const child of this.parentChunk.GetVisibleChildren()) {
        let verticesAndTriangles;
        if (child.vertices.length == 0) {
          verticesAndTriangles = child.CalculateVerticesAndTriangles();
        } else {
          verticesAndTriangles = { vertices: child.vertices, triangles: child.triangles };
        }
        let geometry = new THREE.BufferGeometry();
        const verticesArray = new Float32Array(verticesAndTriangles.vertices);
        geometry.setIndex(verticesAndTriangles.triangles);
        geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
        geometry.computeVertexNormals();
        geometry.normalizeNormals();
        geometry.computeBoundingBox();
        geometries.push(geometry);
      }
      if (geometries.length > 0 && geometries.length != this.geometryCount) {
        this.mesh.geometry.dispose();
        this.mesh.clear();
        this.geometry = BufferGeometryUtils.mergeGeometries(geometries);
        if (this.vertices.length != this.geometry.attributes.position.array.length) {
          this.vertices = this.geometry.attributes.position.array;
          this.triangles = this.geometry.index.array;
          this.geometry.computeVertexNormals();
          this.geometry.normalizeNormals();
          this.geometry.computeBoundingBox();
          this.material.face = THREE.DoubleFace;
          this.material.wireframe = true;
          this.material.receiveShadow = true;
          this.mesh.geometry = this.geometry;
          this.mesh.material = this.material;

          this.geometryCount = geometries.length;
        }
      }
    }
  }
}
