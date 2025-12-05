import './styles.css';
import { initializeGoogleSignIn } from './auth.js';
import { fetchPeopleData } from './sheets.js';
import { createTilesFromData } from './tiles.js';
import { generateLayoutTargets } from './layouts.js';
import { transform } from './transform.js';
import { initScene, addObjectsToScene } from './scene.js';
import { initUI } from './ui.js';

// DOM elements
const loginSection = document.getElementById('login-section');
const appSection = document.getElementById('app-section');

// Application state
let sceneObjects = [];
let layoutTargets = null;
let isInitialized = false;

/**
 * Show login UI and hide app
 */
function showLogin() {
  if (loginSection) loginSection.style.display = 'flex';
  if (appSection) appSection.style.display = 'none';
}

/**
 * Hide login UI and show app
 */
function showApp() {
  if (loginSection) loginSection.style.display = 'none';
  if (appSection) appSection.style.display = 'block';
}

/**
 * Show error message to user
 * @param {string} message - Error message
 */
function showError(message) {
  console.error(message);
  alert(message);
}

/**
 * Initialize the 3D visualization
 * @param {string} accessToken - OAuth access token
 */
async function initializeVisualization(accessToken) {
  if (isInitialized) {
    console.warn('Visualization already initialized');
    return;
  }

  try {
    showApp();

    // Fetch data from Google Sheets
    console.log('Fetching data from Google Sheets...');
    let peopleData;
    try {
      peopleData = await fetchPeopleData(accessToken);
    } catch (error) {
      showError(error.message || 'Failed to fetch data from Google Sheets.');
      showLogin();
      return;
    }
    
    if (peopleData.length === 0) {
      showError('No data found in spreadsheet. Please ensure your sheet has data rows.');
      showLogin();
      return;
    }

    // Create tiles
    console.log('Creating tiles...');
    const { objects } = createTilesFromData(peopleData);
    sceneObjects = objects;

    // Initialize scene
    console.log('Initializing 3D scene...');
    try {
      initScene();
      addObjectsToScene(objects);
    } catch (error) {
      showError(`Failed to initialize 3D scene: ${error.message}`);
      showLogin();
      return;
    }

    // Generate layout targets
    console.log('Generating layouts...');
    layoutTargets = generateLayoutTargets(objects.length);

    // Initialize UI controls
    initUI(layoutTargets, objects);

    // Set initial layout to TABLE
    transform(objects, layoutTargets.table, 0); // Instant transition for initial layout

    isInitialized = true;
    console.log('Visualization initialized successfully!');
  } catch (error) {
    showError(`Failed to initialize visualization: ${error.message}`);
    showLogin();
  }
}

/**
 * Initialize Google authentication
 */
function initAuth() {
  if (typeof window.google === 'undefined') {
    // Wait for Google script to load
    const maxAttempts = 10;
    let attempts = 0;
    
    const checkGoogle = setInterval(() => {
      attempts++;
      if (typeof window.google !== 'undefined') {
        clearInterval(checkGoogle);
        try {
          initializeGoogleSignIn();
        } catch (error) {
          showError(`Failed to initialize Google Sign-In: ${error.message}`);
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(checkGoogle);
        showError('Google Identity Services failed to load. Please refresh the page.');
      }
    }, 200);
    
    return;
  }

  try {
    initializeGoogleSignIn();
  } catch (error) {
    showError(`Failed to initialize Google Sign-In: ${error.message}`);
  }
}

/**
 * Handle Google token received event
 * @param {CustomEvent} event - Token received event
 */
async function handleTokenReceived(event) {
  const { accessToken } = event.detail;
  if (!accessToken) {
    showError('No access token received');
    return;
  }
  
  console.log('Access token received');
  await initializeVisualization(accessToken);
}

/**
 * Initialize app on DOM load
 */
document.addEventListener('DOMContentLoaded', () => {
  // Validate required DOM elements
  if (!loginSection || !appSection) {
    showError('Required DOM elements not found. Please check index.html.');
    return;
  }

  showLogin();

  // Initialize authentication
  if (document.readyState === 'loading') {
    window.addEventListener('load', initAuth);
  } else {
    initAuth();
  }

  // Listen for token received event
  window.addEventListener('googleTokenReceived', handleTokenReceived);
});

