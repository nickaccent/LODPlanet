import * as THREE from 'three';

export class Chunk {
  constructor(children, parent, position, radius, detailLevel, localUp, axisA, axisB) {
    this.children = children;
    this.parent = parent;
    this.position = position;
    this.radius = radius;
    this.detailLevel = detailLevel;
    this.localUp = localUp;
    this.axisA = axisA;
    this.axisB = axisB;
  }

  GenerateChildren(Planet) {
    // If the detail level is under max level and above 0. Max level depends on how many detail levels are defined in planets and needs to be changed manually.
    if (this.detailLevel <= 8 && this.detailLevel >= 0) {
      if (
        this.position.normalize().multiplyScalar(Planet.size).distanceTo(Planet.player.position) <=
        Planet.detailLevelDistances[this.detailLevel]
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
            [],
            this,
            pos,
            this.radius / 2,
            this.detailLevel + 1,
            this.localUp,
            this.axisA,
            this.axisB,
          ),
        );
        pos = this.position
          .clone()
          .add(this.axisA.clone().multiplyScalar(this.radius).divideScalar(2))
          .sub(this.axisB.clone().multiplyScalar(this.radius).divideScalar(2));
        this.children.push(
          new Chunk(
            [],
            this,
            pos,
            this.radius / 2,
            this.detailLevel + 1,
            this.localUp,
            this.axisA,
            this.axisB,
          ),
        );
        pos = this.position
          .clone()
          .sub(this.axisA.clone().multiplyScalar(this.radius).divideScalar(2))
          .add(this.axisB.clone().multiplyScalar(this.radius).divideScalar(2));
        this.children.push(
          new Chunk(
            [],
            this,
            pos,
            this.radius / 2,
            this.detailLevel + 1,
            this.localUp,
            this.axisA,
            this.axisB,
          ),
        );
        pos = this.position
          .clone()
          .sub(this.axisA.clone().multiplyScalar(this.radius).divideScalar(2))
          .sub(this.axisB.clone().multiplyScalar(this.radius).divideScalar(2));
        this.children.push(
          new Chunk(
            [],
            this,
            pos,
            this.radius / 2,
            this.detailLevel + 1,
            this.localUp,
            this.axisA,
            this.axisB,
          ),
        );

        // Create grandchildren
        for (const child of this.children) {
          child.GenerateChildren(Planet);
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
      toBeRendered.push(this);
    }

    return toBeRendered;
  }

  CalculateVerticesAndTriangles(Planet) {
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

        const pointOnUnitSphere = pointOnUnitCube.normalize().multiplyScalar(Planet.size);
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

    return { vertices, triangles };
  }
}
