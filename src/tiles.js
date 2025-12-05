import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

// Net worth thresholds
const NET_WORTH_THRESHOLDS = {
  LOW: 100000,
  HIGH: 200000,
};

// Background colors (neon style)
const COLORS = {
  RED: '#ff2d55',     // < $100K neon red/pink
  ORANGE: '#ff9f0a',  // >= $100K & < $200K neon orange
  GREEN: '#32ff7e',   // >= $200K neon green
};

const PLACEHOLDER_IMAGE = '/placeholder.svg';

/**
 * Create CSS3D tiles from data array
 * @param {Array} dataArray - Array of person objects
 * @returns {Object} { objects, cssObjects }
 */
export function createTilesFromData(dataArray) {
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    console.warn('No data provided to createTilesFromData');
    return { objects: [], cssObjects: [] };
  }

  const objects = [];

  dataArray.forEach((person, index) => {
    try {
      const tile = createTile(person, index);
      if (tile) {
        objects.push(tile);
      }
    } catch (error) {
      console.error(`Error creating tile for person ${index}:`, error);
    }
  });

  return { objects, cssObjects: objects };
}

/**
 * Create a single CSS3D tile from person data
 * @param {Object} person - Person data object
 * @param {number} index - Index in the array
 * @returns {THREE.CSS3DObject|null} CSS3D object or null on error
 */
function createTile(person, index) {
  if (!person || !person.name) {
    console.warn(`Invalid person data at index ${index}`);
    return null;
  }

  // Create DOM element for tile
  const div = document.createElement('div');
  div.className = 'tile';
  
  // Determine background color based on net worth (periodic table style)
  const bgColor = getNetWorthColor(person.netWorth || 0);
  const initials = getInitials(person.name);
  const meta = person.interest || person.country || 'N/A';
  const imageUrl = person.imageUrl || PLACEHOLDER_IMAGE;
  
  // Build tile HTML (periodic-table-like: colored background, symbol, name, meta)
  div.innerHTML = `
    <div class="tile-content periodic-style" style="background-color: ${bgColor}; box-shadow: 0 0 12px ${bgColor}80;">
      <div class="tile-top">
        <div class="tile-symbol">${escapeHtml(initials)}</div>
        <div class="tile-number">${formatCompact(person.netWorth || 0)}</div>
      </div>
      <div class="tile-avatar">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(person.name)}" onerror="this.src='${PLACEHOLDER_IMAGE}'">
      </div>
      <div class="tile-bottom">
        <div class="tile-name">${escapeHtml(person.name)}</div>
        <div class="tile-interest">${escapeHtml(meta)}</div>
      </div>
    </div>
  `;

  // Create CSS3D object
  const cssObject = new CSS3DObject(div);
  cssObject.userData = { ...person, index }; // Store person data for reference
  return cssObject;
}

/**
 * Get background color based on net worth (periodic table style)
 * @param {number} netWorth - Net worth value
 * @returns {string} Color hex code
 */
function getNetWorthColor(netWorth) {
  if (netWorth >= NET_WORTH_THRESHOLDS.HIGH) {
    return COLORS.GREEN;     // >= $200K - Green
  } else if (netWorth >= NET_WORTH_THRESHOLDS.LOW) {
    return COLORS.ORANGE;    // >= $100K & < $200K - Orange
  }
  return COLORS.RED;         // < $100K - Red
}

/**
 * Get initials from a name (up to 2 characters)
 * @param {string} name - Full name
 * @returns {string} Initials
 */
function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
  if (text == null) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
  const number = Number(num) || 0;
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Format number into compact form (e.g., 123.4K, 1.2M)
 */
function formatCompact(num) {
  const n = Number(num) || 0;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

