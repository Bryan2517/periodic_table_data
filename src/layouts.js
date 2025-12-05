import * as THREE from 'three';

// Layout spacing constants - Increased for better visibility
export const LAYOUT_CONSTANTS = {
  TABLE: {
    X_SPACING: 250,  // Increased spacing for better visibility
    Y_SPACING: 320,  // Increased spacing for better visibility
    COLS: 20,
    ROWS: 10,
  },
  SPHERE: {
    RADIUS: 800,  // Increased from 500 for better spacing
  },
  HELIX: {
    RADIUS: 500,  // Increased from 300 for better spacing
    TURN_ANGLE: 0.3,
    VERTICAL_STEP: 40,  // Increased from 20 for better vertical spacing
  },
  GRID: {
    X_SPACING: 250,  // Increased from 150
    Y_SPACING: 320,  // Increased from 150
    Z_SPACING: 250,  // Increased from 150
    X_COUNT: 5,
    Y_COUNT: 4,
    Z_COUNT: 10,
  },
};

/**
 * Generate layout targets for all layouts
 * @param {number} count - Number of objects
 * @returns {Object} Object with table, sphere, helix, grid arrays
 */
export function generateLayoutTargets(count) {
  return {
    table: generateTableLayout(count),
    sphere: generateSphereLayout(count),
    helix: generateHelixLayout(count),
    grid: generateGridLayout(count),
  };
}

/**
 * Table layout: 20 columns x 10 rows
 * @param {number} count - Number of objects
 * @returns {Array<THREE.Object3D>} Array of target objects
 */
function generateTableLayout(count) {
  const targets = [];
  const { COLS, ROWS, X_SPACING, Y_SPACING } = LAYOUT_CONSTANTS.TABLE;

  for (let i = 0; i < count; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);

    const x = (col - COLS / 2 + 0.5) * X_SPACING;
    const y = (ROWS / 2 - row - 0.5) * Y_SPACING;
    const z = 0;

    const target = new THREE.Object3D();
    target.position.set(x, y, z);
    target.rotation.set(0, 0, 0);
    targets.push(target);
  }

  return targets;
}

/**
 * Sphere layout: distribute points evenly on a sphere using Fibonacci sphere algorithm
 * @param {number} count - Number of objects
 * @returns {Array<THREE.Object3D>} Array of target objects
 */
function generateSphereLayout(count) {
  const targets = [];
  const { RADIUS } = LAYOUT_CONSTANTS.SPHERE;

  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count); // Polar angle
    const theta = Math.sqrt(count * Math.PI) * phi; // Azimuthal angle

    const x = RADIUS * Math.cos(theta) * Math.sin(phi);
    const y = RADIUS * Math.sin(theta) * Math.sin(phi);
    const z = RADIUS * Math.cos(phi);

    const target = new THREE.Object3D();
    target.position.set(x, y, z);
    
    // Make tiles look at center
    target.lookAt(0, 0, 0);
    
    targets.push(target);
  }

  return targets;
}

/**
 * Double Helix layout: two intertwined spirals
 * @param {number} count - Number of objects
 * @returns {Array<THREE.Object3D>} Array of target objects
 */
function generateHelixLayout(count) {
  const targets = [];
  const { RADIUS, TURN_ANGLE, VERTICAL_STEP } = LAYOUT_CONSTANTS.HELIX;

  // Number of steps per strand (ceil because we alternate)
  const strandSteps = Math.ceil(count / 2);
  const centerOffset = ((strandSteps - 1) * VERTICAL_STEP) / 2;

  for (let i = 0; i < count; i++) {
    const strand = i % 2; // 0 or 1
    const k = Math.floor(i / 2); // Step along each strand
    const angleOffset = strand === 0 ? 0 : Math.PI; // 180° apart

    const angle = k * TURN_ANGLE + angleOffset;

    // Give each strand a slight radial offset to make the double helix more visible
    const strandOffset = strand === 0 ? 20 : -20;
    const radiusWithOffset = RADIUS + strandOffset;

    const x = radiusWithOffset * Math.cos(angle);
    const z = radiusWithOffset * Math.sin(angle);
    const y = k * VERTICAL_STEP - centerOffset;

    const target = new THREE.Object3D();
    target.position.set(x, y, z);
    
    // Make tiles look at center axis
    target.lookAt(0, y, 0);
    
    targets.push(target);
  }

  return targets;
}

/**
 * Grid layout: 5 x 4 x 10 (x, y, z)
 * @param {number} count - Number of objects
 * @returns {Array<THREE.Object3D>} Array of target objects
 */
function generateGridLayout(count) {
  const targets = [];
  const { X_COUNT, Y_COUNT, Z_COUNT, X_SPACING, Y_SPACING, Z_SPACING } = LAYOUT_CONSTANTS.GRID;

  for (let i = 0; i < count; i++) {
    const x = i % X_COUNT;
    const y = Math.floor(i / X_COUNT) % Y_COUNT;
    const z = Math.floor(i / (X_COUNT * Y_COUNT));

    const posX = (x - X_COUNT / 2 + 0.5) * X_SPACING;
    const posY = (Y_COUNT / 2 - y - 0.5) * Y_SPACING;
    const posZ = (z - Z_COUNT / 2 + 0.5) * Z_SPACING;

    const target = new THREE.Object3D();
    target.position.set(posX, posY, posZ);
    target.rotation.set(0, 0, 0);
    targets.push(target);
  }

  return targets;
}

