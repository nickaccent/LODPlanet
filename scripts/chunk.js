import * as THREE from 'three';

export class Chunk {
  constructor(
    planet,
    children,
    parent,
    position,
    radius,
    detailLevel,
    localUp,
    axisA,
    axisB,
    terrainFace,
  ) {
    this.planet = planet;
    this.children = children;
    this.parent = parent;
    this.position = position;
    this.radius = radius;
    this.detailLevel = detailLevel;
    this.localUp = localUp;
    this.axisA = axisA;
    this.axisB = axisB;
    this.terrainFace = terrainFace;
    this.vertices = [];
    this.triangles = [];
  }

  GenerateChildren() {
    const maxDetail = 8;
    // If the detail level is under max level and above 0. Max level depends on how many detail levels are defined in planets and needs to be changed manually.
    if (this.detailLevel <= maxDetail && this.detailLevel >= 0) {
      if (
        this.position
          .clone()
          .normalize()
          .multiplyScalar(this.planet.size)
          .distanceTo(this.planet.player.position) <=
        this.planet.detailLevelDistances[this.detailLevel]
      ) {
        // Assign the chunks children (grandchildren not included).
        // Position is calculated on a cube and based on the fact that each child has 1/2 the radius of the parent
        // Detail level is increased by 1. This doesn't change anything itself, but rather symbolizes that something HAS been changed (the detail).
        this.children = [];

        let pos = this.position
          .clone()
          .add(this.axisA.clone().multiplyScalar(this.radius).divideScalar(2))
          .add(this.axisB.clone().multiplyScalar(this.radius).divideScalar(2));
        this.children.push(
          new Chunk(
            this.planet,
            [],
            this,
            pos,
            this.radius / 2,
            this.detailLevel + 1,
            this.localUp,
            this.axisA,
            this.axisB,
            this.terrainFace,
          ),
        );
        pos = this.position
          .clone()
          .add(this.axisA.clone().multiplyScalar(this.radius).divideScalar(2))
          .sub(this.axisB.clone().multiplyScalar(this.radius).divideScalar(2));
        this.children.push(
          new Chunk(
            this.planet,
            [],
            this,
            pos,
            this.radius / 2,
            this.detailLevel + 1,
            this.localUp,
            this.axisA,
            this.axisB,
            this.terrainFace,
          ),
        );
        pos = this.position
          .clone()
          .sub(this.axisA.clone().multiplyScalar(this.radius).divideScalar(2))
          .add(this.axisB.clone().multiplyScalar(this.radius).divideScalar(2));
        this.children.push(
          new Chunk(
            this.planet,
            [],
            this,
            pos,
            this.radius / 2,
            this.detailLevel + 1,
            this.localUp,
            this.axisA,
            this.axisB,
            this.terrainFace,
          ),
        );
        pos = this.position
          .clone()
          .sub(this.axisA.clone().multiplyScalar(this.radius).divideScalar(2))
          .sub(this.axisB.clone().multiplyScalar(this.radius).divideScalar(2));
        this.children.push(
          new Chunk(
            this.planet,
            [],
            this,
            pos,
            this.radius / 2,
            this.detailLevel + 1,
            this.localUp,
            this.axisA,
            this.axisB,
            this.terrainFace,
          ),
        );

        // Create grandchildren
        for (const child of this.children) {
          child.GenerateChildren(this.planet);
        }
      }
    }
  }

  UpdateChunk() {
    const distanceToPlayer = this.terrainFace.mesh
      .localToWorld(this.position.clone().normalize().multiplyScalar(this.planet.size))
      .distanceTo(this.planet.player.position);
    if (this.detailLevel <= 8) {
      if (distanceToPlayer > this.planet.detailLevelDistances[this.detailLevel]) {
        this.children = [];
      } else {
        if (this.children.Length > 0) {
          for (const child of this.children) {
            child.UpdateChunk();
          }
        } else {
          this.GenerateChildren();
        }
      }
    }
  }

  GetVisibleChildren() {
    let toBeRendered = [];
    if (this.children && this.children.length > 0) {
      for (const child of this.children) {
        toBeRendered = toBeRendered.concat(child.GetVisibleChildren());
      }
    } else {
      let pDist = Math.pow(this.planet.size, 2) + Math.pow(this.planet.distanceToPlayer, 2);
      let aDist = Math.pow(
        this.terrainFace.mesh
          .localToWorld(this.position.clone().normalize().multiplyScalar(this.planet.size))
          .distanceTo(this.planet.player.position),
        2,
      );
      let cDist = pDist - aDist;
      let planetDist = 2 * this.planet.size * this.planet.distanceToPlayer;
      let distance = Math.acos(cDist / planetDist);

      if (!isNaN(distance) && distance < this.planet.cullingMinAngle) {
        toBeRendered.push(this);
      }
    }
    // console.log(toBeRendered);
    return toBeRendered;
  }

  CalculateVerticesAndTriangles() {
    let resolution = 8; // The resolution of the chunk. Can be changed
    let vertices = [];
    let triangles = [];
    let triIndex = 0;
    let i = 0;

    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        let percent = new THREE.Vector2(x, y).divide(
          new THREE.Vector2(resolution - 1, resolution - 1),
        );

        // calculate the point on the cube structure
        /* Same code as Sebastian Lague, with the difference being that
        1: The origin is the position variable rather than the middle of the terrain face
        2: The offset is scaled using the radius variable */

        const pointOnUnitCube = this.position.clone();
        const axisAVal = this.axisA.clone();
        axisAVal
          .multiply(
            new THREE.Vector3((percent.x - 0.5) * 2, (percent.x - 0.5) * 2, (percent.x - 0.5) * 2),
          )
          .multiplyScalar(this.radius);

        pointOnUnitCube.add(axisAVal);
        const axisBVal = this.axisB.clone();
        axisBVal
          .multiply(
            new THREE.Vector3((percent.y - 0.5) * 2, (percent.y - 0.5) * 2, (percent.y - 0.5) * 2),
          )
          .multiplyScalar(this.radius);
        pointOnUnitCube.add(axisBVal);

        const pointOnUnitSphere = pointOnUnitCube.normalize().multiplyScalar(this.planet.size);
        vertices.push(pointOnUnitSphere.x);
        vertices.push(pointOnUnitSphere.y);
        vertices.push(pointOnUnitSphere.z);

        if (x != resolution - 1 && y != resolution - 1) {
          triangles[triIndex] = i;
          triangles[triIndex + 1] = i + resolution + 1;
          triangles[triIndex + 2] = i + resolution;

          triangles[triIndex + 3] = i;
          triangles[triIndex + 4] = i + 1;
          triangles[triIndex + 5] = i + resolution + 1;
          triIndex += 6;
        }
        i++;
      }
    }

    this.vertices = vertices;
    this.triangles = triangles;
    return { vertices, triangles };
  }
}
