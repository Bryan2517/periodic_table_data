import { transform } from './transform.js';

// Layout configuration
const LAYOUTS = {
  table: { id: 'table', buttonId: 'btn-table', default: true },
  sphere: { id: 'sphere', buttonId: 'btn-sphere' },
  helix: { id: 'helix', buttonId: 'btn-helix' },
  grid: { id: 'grid', buttonId: 'btn-grid' },
  tetra: { id: 'tetra', buttonId: 'btn-tetra' },
};

const TRANSITION_DURATION = 2000; // milliseconds

let currentLayout = 'table';
let objects = [];
let layoutTargets = null;
let buttons = {};

/**
 * Initialize UI controls
 * @param {Object} targets - Layout targets object
 * @param {Array} sceneObjects - Array of CSS3D objects
 */
export function initUI(targets, sceneObjects) {
  if (!targets || !sceneObjects) {
    console.error('Invalid parameters for initUI');
    return;
  }

  layoutTargets = targets;
  objects = sceneObjects;

  // Initialize all layout buttons
  Object.values(LAYOUTS).forEach(layout => {
    const button = document.getElementById(layout.buttonId);
    if (!button) {
      console.warn(`Button not found: ${layout.buttonId}`);
      return;
    }
    
    buttons[layout.id] = button;
    
    // Set initial active state
    if (layout.default) {
      button.classList.add('active');
      currentLayout = layout.id;
    }
    
    // Add click handler
    button.addEventListener('click', () => switchLayout(layout.id));
  });
}

/**
 * Switch to a different layout
 * @param {string} layoutId - Layout identifier
 */
function switchLayout(layoutId) {
  if (currentLayout === layoutId) {
    return; // Already on this layout
  }

  if (!layoutTargets || !layoutTargets[layoutId]) {
    console.error(`Layout not found: ${layoutId}`);
    return;
  }

  if (!objects || objects.length === 0) {
    console.warn('No objects to transform');
    return;
  }

  // Update active button
  updateActiveButton(layoutId);

  // Transform to new layout
  try {
    transform(objects, layoutTargets[layoutId], TRANSITION_DURATION);
    currentLayout = layoutId;
  } catch (error) {
    console.error(`Error switching to layout ${layoutId}:`, error);
  }
}

/**
 * Update active button state
 * @param {string} layoutId - Active layout identifier
 */
function updateActiveButton(layoutId) {
  // Remove active class from all buttons
  Object.values(buttons).forEach(btn => {
    if (btn) btn.classList.remove('active');
  });

  // Add active class to current button
  const activeButton = buttons[layoutId];
  if (activeButton) {
    activeButton.classList.add('active');
  }
}

