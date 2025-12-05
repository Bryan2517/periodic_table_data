# Kasatria Table - 3D Visualization

A Vite-based web application that visualizes data from Google Sheets in 3D using Three.js CSS3D renderer.

## Features

- Google OAuth 2.0 authentication
- Google Sheets API integration
- 3D CSS3D tile visualization
- Four layout modes: Table, Sphere, Double Helix, Grid
- Smooth animations using TWEEN.js
- Interactive camera controls

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Sheets API
   - Google Identity Services API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173`
5. Copy your Client ID

### 3. Update Configuration

Edit `src/auth.js` and replace:
```javascript
export const CLIENT_ID = "INSERT_CLIENT_ID_HERE";
```
with your actual Google OAuth Client ID.

### 4. Configure Google Sheets

1. Create a Google Sheet with the following columns (first row should be headers):
   - Name (or similar: "name", "nama", "full name")
   - Country (or similar: "country", "negara", "nation")
   - Net Worth (or similar: "networth", "net worth", "wealth", "value")
   - Image URL (optional: "image", "imageurl", "avatar", "photo", "picture")
2. Share the sheet with your Google account (or make it publicly readable)
3. Copy the Spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
4. Edit `src/sheets.js` and replace:
   ```javascript
   export const SPREADSHEET_ID = "INSERT_SPREADSHEET_ID_HERE";
   ```
   with your actual Spreadsheet ID.

### 5. Placeholder Image

A default placeholder SVG is included at `public/placeholder.svg`. You can replace it with your own image (JPG, PNG, or SVG) if desired. This will be used for tiles that don't have an image URL.

### 6. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Project Structure

```
project-root/
  index.html            # Vite entry HTML
  vite.config.js        # Vite configuration
  package.json          # Dependencies
  /src
    main.js             # App entry point
    auth.js             # Google Login
    sheets.js           # Google Sheets fetch + parsing
    tiles.js            # Create CSS3D tiles
    layouts.js          # Compute layout targets
    transform.js        # Tweening between layouts
    scene.js            # Three.js scene setup
    ui.js               # Buttons + UI wiring
    styles.css          # Global styles
  /public
    placeholder.jpg     # Default avatar
```

## Layout Modes

- **TABLE**: 20 columns × 10 rows grid layout
- **SPHERE**: Points distributed evenly on a sphere
- **HELIX**: Double helix (two intertwined spirals)
- **GRID**: 5 × 4 × 10 3D grid

## Color Coding

Tiles are colored based on Net Worth:
- **Red** (#FF0000): < $100,000
- **Orange** (#FFA500): $100,000 - $199,999
- **Green** (#00A000): ≥ $200,000

## Technologies

- Vite (build tool)
- Three.js (3D graphics)
- CSS3DRenderer (DOM-based 3D rendering)
- TWEEN.js (animations)
- Google Identity Services (OAuth)
- Google Sheets API

## License

MIT

