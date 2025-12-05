import * as TWEEN from '@tweenjs/tween.js';

const DEFAULT_DURATION = 2000; // milliseconds

let activeTweens = [];

/**
 * Transform objects to target positions with smooth animation
 * @param {Array} objects - Array of CSS3DObjects
 * @param {Array} targets - Array of Object3D with target positions/rotations
 * @param {number} duration - Animation duration in milliseconds
 */
export function transform(objects, targets, duration = DEFAULT_DURATION) {
  if (!Array.isArray(objects) || !Array.isArray(targets)) {
    console.error('Invalid parameters: objects and targets must be arrays');
    return;
  }

  if (objects.length === 0) {
    console.warn('No objects to transform');
    return;
  }

  if (objects.length !== targets.length) {
    console.warn(`Mismatch: ${objects.length} objects vs ${targets.length} targets`);
    return;
  }

  // Stop all active tweens
  stopAllTweens();

  // Create tweens for each object
  objects.forEach((object, index) => {
    if (!object || !targets[index]) {
      console.warn(`Invalid object or target at index ${index}`);
      return;
    }

    const target = targets[index];
    createTweensForObject(object, target, duration);
  });
}

/**
 * Create position and rotation tweens for a single object
 * @param {THREE.CSS3DObject} object - Object to animate
 * @param {THREE.Object3D} target - Target position/rotation
 * @param {number} duration - Animation duration
 */
function createTweensForObject(object, target, duration) {
  // Create tween for position
  const positionTween = new TWEEN.Tween(object.position)
    .to(
      {
        x: target.position.x,
        y: target.position.y,
        z: target.position.z,
      },
      duration
    )
    .easing(TWEEN.Easing.Cubic.InOut)
    .onComplete(() => {
      // Remove from active tweens when complete
      const index = activeTweens.indexOf(positionTween);
      if (index > -1) activeTweens.splice(index, 1);
    })
    .start();

  // Create tween for rotation
  const rotationTween = new TWEEN.Tween(object.rotation)
    .to(
      {
        x: target.rotation.x,
        y: target.rotation.y,
        z: target.rotation.z,
      },
      duration
    )
    .easing(TWEEN.Easing.Cubic.InOut)
    .onComplete(() => {
      // Remove from active tweens when complete
      const index = activeTweens.indexOf(rotationTween);
      if (index > -1) activeTweens.splice(index, 1);
    })
    .start();

  activeTweens.push(positionTween, rotationTween);
}

/**
 * Stop all active tweens
 */
function stopAllTweens() {
  activeTweens.forEach(tween => {
    if (tween && typeof tween.stop === 'function') {
      tween.stop();
    }
  });
  activeTweens = [];
}

/**
 * Update all active tweens (call this in animation loop)
 * @param {number} time - Current time (optional, TWEEN will use performance.now() if not provided)
 */
export function update(time) {
  TWEEN.update(time);
}

