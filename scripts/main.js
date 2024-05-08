import '../style.css';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { Planet } from './planet';

const STEPS_PER_FRAME = 5;
const clock = new THREE.Clock();

class Game {
  constructor() {
    this.lastPlayerPosition = new THREE.Vector3();
    this.useControlsTransform = false;
    this.useOrbit = this.prevTime = performance.now();
    this.elapsedTime = 0;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(this.renderer.domElement);

    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      20000,
    );
    this.camera.position.set(-10, 4, -225);
    this.camera.lookAt(0, 0, 0);

    this.scene = new THREE.Scene();
    window.scene = this.scene;

    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.target.set(0, 0, 0);
    this.orbitControls.update();
    this.controls = this.orbitControls;

    this.player = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    this.player.position.set(0, 0, -150);
    this.scene.add(this.player);

    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);

    this.transformControls.attach(this.player);

    this.SetupLights();

    this.planet = new Planet(100, this.scene, this.player, this.renderer);

    this.Animate();

    document.addEventListener('keyup', this.KeyUp.bind(this));
  }

  KeyUp(e) {
    switch (e.code) {
      // transform controls
      case 'KeyG':
        this.transformControls.setMode('translate');
        break;
      case 'KeyR':
        this.transformControls.setMode('rotate');
        break;
      case 'KeyS':
        this.transformControls.setMode('scale');
        break;
      case 'KeyW':
        // swap between orbit controls or transform controls for the player
        if (this.useControlsTransform) {
          this.useControlsTransform = false;
        } else {
          this.useControlsTransform = true;
        }
        break;
    }
    if (this.useControlsTransform) {
      this.controls = this.transformControls;
      this.scene.add(this.transformControls);
      this.orbitControls.enabled = false;
    } else {
      this.controls = this.orbitControls;
      this.orbitControls.enabled = true;
      this.scene.remove(this.transformControls);
    }
  }

  SetupLights() {
    this.sun = new THREE.DirectionalLight();
    this.sun.intensity = 2.5;
    this.sun.position.set(10, 400, 500);
    this.sun.castShadow = true;

    // Set the size of the sun's shadow box
    this.sun.shadow.camera.left = -100;
    this.sun.shadow.camera.right = 100;
    this.sun.shadow.camera.top = 100;
    this.sun.shadow.camera.bottom = -100;
    this.sun.shadow.camera.near = 0.1;
    this.sun.shadow.camera.far = 1200;
    this.sun.shadow.bias = -0.0001;
    this.sun.shadow.mapSize = new THREE.Vector2(2048, 2048);
    this.sun.target.position.set(0, 0, 0);
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);

    this.ambient = new THREE.AmbientLight();
    this.ambient.intensity = 1.2;
    this.scene.add(this.ambient);
  }

  Animate() {
    const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;
    let currentTime = performance.now();

    if (
      this.player.position.x != this.lastPlayerPosition.x ||
      this.player.position.y != this.lastPlayerPosition.y ||
      this.player.position.z != this.lastPlayerPosition.z
    ) {
      this.planet.PlanetGenerationLoop();
      this.lastPlayerPosition.copy(this.player.position);
    }
    this.renderer.render(this.scene, this.camera);

    this.stats.update();
    let dt = (currentTime - this.prevTime) / 1000;
    this.prevTime = currentTime;
    this.elapsedTime = this.elapsedTime += dt;
    requestAnimationFrame(this.Animate.bind(this));
  }
}

const game = new Game();
