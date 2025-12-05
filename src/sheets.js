// Google Sheets API Integration
export const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID || "";
// Sheet range - try without sheet name first (uses first sheet by default)
// If your sheet has a different name, change this to: "YourSheetName!A:Z"
export const SHEET_RANGE = "A:Z"; // This will use the first sheet by default

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

// Column name mappings for flexible header detection
// Expected order: Name, Photo, Age, Country, Interest, Net Worth
const COLUMN_MAPPINGS = {
  name: ['name', 'nama', 'full name', 'fullname', 'person'],
  country: ['country', 'negara', 'nation', 'location'],
  netWorth: ['networth', 'net worth', 'wealth', 'value', 'worth', 'net'],
  imageUrl: ['photo', 'image', 'imageurl', 'avatar', 'picture', 'img', 'url'],
  age: ['age', 'umur', 'years'],
  interest: ['interest', 'hobby', 'hobbies', 'interests']
};

/**
 * Fetch people data from Google Sheets
 * @param {string} accessToken - OAuth access token
 * @returns {Promise<Array>} Array of person objects
 */
export async function fetchPeopleData(accessToken) {
  if (!accessToken) {
    throw new Error('Access token is required');
  }

  try {
    // Try different range formats if the first one fails
    const rangeOptions = [
      SHEET_RANGE, // Try configured range first
      "A:Z", // Simple range (first sheet)
      "Sheet1!A:Z", // Common sheet name
      "Sheet 1!A:Z", // With space
    ];

    let lastError = null;
    
    for (const range of rangeOptions) {
      try {
        // URL encode the range to handle special characters
        const encodedRange = encodeURIComponent(range);
        const url = `${SHEETS_API_BASE}/${SPREADSHEET_ID}/values/${encodedRange}`;
        
        console.log('Trying to fetch from URL:', url);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error?.message || response.statusText;
          
          // If it's a range parsing error, try next option
          if (response.status === 400 && errorMessage.includes('parse range')) {
            console.warn(`Range "${range}" failed, trying next option...`);
            lastError = new Error(`Range parsing error: ${errorMessage}`);
            continue;
          }
          
          if (response.status === 403) {
            throw new Error('Access denied. Please ensure the spreadsheet is shared with your Google account.');
          } else if (response.status === 404) {
            throw new Error('Spreadsheet not found. Please check the spreadsheet ID.');
          }
          
          throw new Error(`Sheets API error (${response.status}): ${errorMessage}`);
        }

        // Success! Parse the data
        const data = await response.json();
        const rows = data.values || [];

        if (rows.length === 0) {
          console.warn('No data found in spreadsheet');
          return [];
        }

        if (rows.length === 1) {
          console.warn('Only headers found, no data rows');
          return [];
        }

        console.log(`Successfully fetched data using range: ${range}`);
        return parseSheetData(rows);
        
      } catch (error) {
        // If it's a range parsing error, continue to next option
        if (error.message && error.message.includes('parse range')) {
          lastError = error;
          continue;
        }
        // Otherwise, throw immediately
        throw error;
      }
    }
    
    // If all range options failed
    throw lastError || new Error('Unable to parse any sheet range. Please check your sheet name in SHEET_RANGE constant.');

  } catch (error) {
    console.error('Error fetching people data:', error);
    const userMessage = error.message || 'Failed to fetch data from Google Sheets. Please check your spreadsheet ID and permissions.';
    throw new Error(userMessage);
  }
}

/**
 * Parse sheet rows into person objects
 * @param {Array<Array>} rows - Raw sheet data
 * @returns {Array} Array of person objects
 */
function parseSheetData(rows) {
  const headers = rows[0].map(h => String(h).toLowerCase().trim());
  const dataRows = rows.slice(1);

  // Find column indices
  const columnIndices = {
    name: findColumnIndex(headers, COLUMN_MAPPINGS.name),
    country: findColumnIndex(headers, COLUMN_MAPPINGS.country),
    netWorth: findColumnIndex(headers, COLUMN_MAPPINGS.netWorth),
    imageUrl: findColumnIndex(headers, COLUMN_MAPPINGS.imageUrl),
    age: findColumnIndex(headers, COLUMN_MAPPINGS.age),
    interest: findColumnIndex(headers, COLUMN_MAPPINGS.interest),
  };

  // Log detected columns for debugging
  console.log('Detected columns:', {
    name: columnIndices.name !== -1 ? headers[columnIndices.name] : 'NOT FOUND',
    photo: columnIndices.imageUrl !== -1 ? headers[columnIndices.imageUrl] : 'NOT FOUND',
    age: columnIndices.age !== -1 ? headers[columnIndices.age] : 'NOT FOUND',
    country: columnIndices.country !== -1 ? headers[columnIndices.country] : 'NOT FOUND',
    interest: columnIndices.interest !== -1 ? headers[columnIndices.interest] : 'NOT FOUND',
    netWorth: columnIndices.netWorth !== -1 ? headers[columnIndices.netWorth] : 'NOT FOUND',
  });

  // Validate required columns
  if (columnIndices.name === -1) {
    console.warn('Name column not found. Using fallback naming.');
  }

  // Parse rows into objects
  const people = dataRows
    .map((row, index) => {
      const name = columnIndices.name !== -1 ? row[columnIndices.name] : row[0] || `Person ${index + 1}`;
      const photo = columnIndices.imageUrl !== -1 ? row[columnIndices.imageUrl] : row[1] || null;
      const age = columnIndices.age !== -1 ? row[columnIndices.age] : row[2] || null;
      const country = columnIndices.country !== -1 ? row[columnIndices.country] : row[3] || 'Unknown';
      const interest = columnIndices.interest !== -1 ? row[columnIndices.interest] : row[4] || null;
      const netWorthRaw = columnIndices.netWorth !== -1 ? row[columnIndices.netWorth] : row[5] || '0';

      return {
        id: index,
        name: String(name).trim(),
        country: String(country).trim(),
        netWorth: parseNetWorth(netWorthRaw),
        imageUrl: photo ? String(photo).trim() : null,
        age: age ? String(age).trim() : null,
        interest: interest ? String(interest).trim() : null,
      };
    })
    .filter(person => {
      // Filter out completely empty rows
      return person.name && person.name !== 'Person 0' && person.name.length > 0;
    });

  console.log(`Fetched ${people.length} people from Google Sheets`);
  return people;
}

/**
 * Find column index by matching header names
 * @param {Array<string>} headers - Header row
 * @param {Array<string>} possibleNames - Possible column name variations
 * @returns {number} Column index or -1 if not found
 */
function findColumnIndex(headers, possibleNames) {
  // Try exact match first
  for (const name of possibleNames) {
    const exactIndex = headers.indexOf(name);
    if (exactIndex !== -1) return exactIndex;
  }

  // Try partial match
  for (const name of possibleNames) {
    const index = headers.findIndex(h => 
      h.includes(name) || name.includes(h) || h === name
    );
    if (index !== -1) return index;
  }

  return -1;
}

/**
 * Parse net worth string to number
 * Handles currency symbols, commas, and various formats
 * @param {string|number} value - Net worth value
 * @returns {number} Parsed number
 */
function parseNetWorth(value) {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  
  if (!value) return 0;
  
  const str = String(value).trim();
  if (!str) return 0;

  // Remove currency symbols, commas, spaces, and other non-numeric characters except decimal point
  const cleaned = str.replace(/[$€£¥₹,\s]/g, '').replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : Math.max(0, parsed); // Ensure non-negative
}

