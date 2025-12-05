import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { update as updateTween } from './transform.js';

let scene, camera, renderer, controls, container;

// Camera and scene constants
const CAMERA_CONFIG = {
  FOV: 75,
  NEAR: 1,
  FAR: 5000,
  INITIAL_POSITION: { x: 0, y: 0, z: 1000 },
};

const CONTROLS_CONFIG = {
  ENABLE_DAMPING: true,
  DAMPING_FACTOR: 0.1,
  ROTATE_SPEED: 0.5,
};

/**
 * Initialize Three.js scene with CSS3D renderer
 * @throws {Error} If container element is not found
 */
export function initScene() {
  container = document.getElementById('container');
  
  if (!container) {
    throw new Error('Container element not found. Ensure #container exists in index.html');
  }

  // Scene
  scene = new THREE.Scene();

  // Camera
  const aspect = container.clientWidth / container.clientHeight || 1;
  camera = new THREE.PerspectiveCamera(
    CAMERA_CONFIG.FOV,
    aspect,
    CAMERA_CONFIG.NEAR,
    CAMERA_CONFIG.FAR
  );
  // Position camera further back to see more tiles
  camera.position.set(
    CAMERA_CONFIG.INITIAL_POSITION.x,
    CAMERA_CONFIG.INITIAL_POSITION.y,
    CAMERA_CONFIG.INITIAL_POSITION.z * 1.5  // 1.5x further back
  );

  // CSS3D Renderer
  renderer = new CSS3DRenderer();
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  container.appendChild(renderer.domElement);

  // Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = CONTROLS_CONFIG.ENABLE_DAMPING;
  controls.dampingFactor = CONTROLS_CONFIG.DAMPING_FACTOR;
  controls.rotateSpeed = CONTROLS_CONFIG.ROTATE_SPEED;

  // Handle window resize
  window.addEventListener('resize', onWindowResize);

  // Start animation loop
  animate();
}

/**
 * Add objects to scene
 */
export function addObjectsToScene(objects) {
  objects.forEach(obj => {
    scene.add(obj);
  });
}

/**
 * Get scene reference
 */
export function getScene() {
  return scene;
}

/**
 * Get camera reference
 */
export function getCamera() {
  return camera;
}

/**
 * Handle window resize
 */
function onWindowResize() {
  if (!container || !camera || !renderer) return;
  
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

/**
 * Animation loop
 */
function animate() {
  requestAnimationFrame(animate);
  
  // Update TWEEN animations
  updateTween();
  
  if (controls) {
    controls.update();
  }
  
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

